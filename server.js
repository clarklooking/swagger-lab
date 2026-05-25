const express = require('express');
const multer = require('multer');
const yaml = require('js-yaml');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3210;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 解析 Swagger 文件内容，统一转换为标准格式
 * 支持 JSON 字符串和 YAML 字符串
 * @param {string} content - 文件内容字符串
 * @returns {object} 解析后的 Swagger 对象
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
 * @param {object} swagger - 解析后的 Swagger 对象
 * @returns {Array} 接口列表，每个元素包含 method, path, summary, tag, parameters, requestBody, responses
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
 * @param {file} file - 上传的文件（field name: file）
 * @returns {object} { info, baseUrl, endpoints }
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
 * @param {object} body - { method, url, headers, body }
 * @returns {object} { status, headers, data }
 */
app.post('/api/proxy', async (req, res) => {
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

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data
    });
  } catch (err) {
    res.status(500).json({ error: '代理请求失败: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Swagger Lab 已启动: http://localhost:${PORT}`);
});
