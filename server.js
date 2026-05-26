const express = require('express');
const multer = require('multer');
const yaml = require('js-yaml');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3210;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== 请求历史记录（内存） ==========
const requestHistory = [];
const MAX_HISTORY = 200;

/**
 * 解析 Swagger 文件内容，统一转换为标准格式
 * 支持 JSON 字符串和 YAML 字符串
 */
function parseSwaggerContent(content) {
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed);
  }
  return yaml.load(trimmed);
}

/**
 * 从 Swagger/OpenAPI 定义中提取接口列表
 * 支持 Swagger 2.0 和 OpenAPI 3.0
 */
function extractEndpoints(swagger) {
  const endpoints = [];
  const paths = swagger.paths || {};

  for (const [pathStr, pathObj] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(pathObj)) {
      if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method.toLowerCase())) {
        const tags = op.tags || ['default'];
        endpoints.push({
          method: method.toUpperCase(),
          path: pathStr,
          summary: op.summary || '',
          description: op.description || '',
          tag: tags[0],
          operationId: op.operationId || '',
          parameters: op.parameters || [],
          requestBody: op.requestBody || null,
          responses: op.responses || {}
        });
      }
    }
  }

  return endpoints;
}

/**
 * POST /api/upload
 * 接收上传的 Swagger JSON/YAML 文件，解析后返回接口列表
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传 Swagger 文件' });
    }

    const content = req.file.buffer.toString('utf-8');
    const swagger = parseSwaggerContent(content);
    const endpoints = extractEndpoints(swagger);

    // 提取基础 URL
    let baseUrl = '';
    if (swagger.host) {
      const scheme = (swagger.schemes && swagger.schemes[0]) || 'http';
      const basePath = swagger.basePath || '';
      baseUrl = `${scheme}://${swagger.host}${basePath}`;
    } else if (swagger.servers && swagger.servers.length > 0) {
      baseUrl = swagger.servers[0].url || '';
    }
    // 处理 OpenAPI 3.0 中 servers 带变量的情况
    if (swagger.servers && swagger.servers.length > 0 && swagger.servers[0].variables) {
      let url = swagger.servers[0].url;
      for (const [k, v] of Object.entries(swagger.servers[0].variables)) {
        url = url.replace(`{${k}}`, v.default || '');
      }
      baseUrl = url;
    }

    res.json({
      info: swagger.info || {},
      baseUrl,
      endpoints
    });
  } catch (err) {
    res.status(400).json({ error: '文件解析失败: ' + err.message });
  }
});

/**
 * POST /api/proxy
 * 代理请求到目标 API，解决浏览器 CORS 限制
 * 返回包含耗时、响应大小等详细信息的统一格式
 */
app.post('/api/proxy', async (req, res) => {
  const startTime = Date.now();
  try {
    const { method, url, headers = {}, body: reqBody } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url 不能为空' });
    }

    const fetchOptions = {
      method: method || 'GET',
      headers: { ...headers }
    };

    if (reqBody && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method.toUpperCase())) {
      fetchOptions.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
      if (!fetchOptions.headers['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    let data;
    let responseSize = 0;

    if (contentType.includes('application/json')) {
      const text = await response.text();
      responseSize = Buffer.byteLength(text, 'utf-8');
      try { data = JSON.parse(text); } catch { data = text; }
    } else {
      data = await response.text();
      responseSize = Buffer.byteLength(data, 'utf-8');
    }

    const elapsed = Date.now() - startTime;

    const result = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      meta: {
        time: elapsed,
        size: responseSize,
        sizeFormatted: formatSize(responseSize),
        timestamp: new Date().toISOString()
      }
    };

    // 保存到历史记录
    requestHistory.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      method: fetchOptions.method.toUpperCase(),
      url,
      status: response.status,
      time: elapsed,
      timestamp: new Date().toISOString()
    });
    if (requestHistory.length > MAX_HISTORY) requestHistory.length = MAX_HISTORY;

    res.json(result);
  } catch (err) {
    const elapsed = Date.now() - startTime;
    res.json({
      success: false,
      status: 0,
      statusText: 'Error',
      data: err.message,
      meta: {
        time: elapsed,
        size: 0,
        sizeFormatted: '0 B',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/history
 * 获取请求历史记录
 */
app.get('/api/history', (req, res) => {
  res.json({ data: requestHistory });
});

/**
 * DELETE /api/history
 * 清空请求历史记录
 */
app.delete('/api/history', (req, res) => {
  requestHistory.length = 0;
  res.json({ success: true });
});

// ========== 工具函数 ==========
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ========== Mock 接口（本地测试用） ==========

let pets = [
  { id: 1, name: '小黄', category: '狗', status: 'available', price: 299, tags: ['可爱', '幼崽'] },
  { id: 2, name: '小白', category: '猫', status: 'available', price: 199, tags: ['温顺'] },
  { id: 3, name: '大橘', category: '猫', status: 'sold', price: 99, tags: ['胖', '橘猫'] }
];
let nextId = 4;

app.get('/mock/pets', (req, res) => {
  let result = [...pets];
  if (req.query.name) result = result.filter(p => p.name.includes(req.query.name));
  if (req.query.status) result = result.filter(p => p.status === req.query.status);
  if (req.query.limit) result = result.slice(0, parseInt(req.query.limit));
  res.json({ code: 200, data: result, total: result.length });
});

app.get('/mock/pets/:id', (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  if (!pet) return res.status(404).json({ code: 404, message: '宠物不存在' });
  res.json({ code: 200, data: pet });
});

app.post('/mock/pets', (req, res) => {
  const pet = { id: nextId++, ...req.body };
  pets.push(pet);
  res.status(201).json({ code: 201, message: '创建成功', data: pet });
});

app.put('/mock/pets/:id', (req, res) => {
  const idx = pets.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '宠物不存在' });
  pets[idx] = { ...pets[idx], ...req.body };
  res.json({ code: 200, message: '更新成功', data: pets[idx] });
});

app.delete('/mock/pets/:id', (req, res) => {
  const idx = pets.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '宠物不存在' });
  const removed = pets.splice(idx, 1)[0];
  res.json({ code: 200, message: '删除成功', data: removed });
});

app.get('/mock/header-test', (req, res) => {
  res.json({
    code: 200,
    message: '收到的自定义请求头',
    data: {
      'X-Request-Id': req.headers['x-request-id'] || null,
      'X-Tenant-Code': req.headers['x-tenant-code'] || null,
      'Authorization': req.headers['authorization'] || null
    }
  });
});

app.listen(PORT, () => {
  console.log(`Swagger Lab 已启动: http://localhost:${PORT}`);
});
