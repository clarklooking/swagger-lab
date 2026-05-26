<p align="center">
  <h1 align="center">Swagger Lab</h1>
  <p align="center">
    <strong>你的 Swagger 文档，缺一个能打的接口测试工具。</strong>
  </p>
  <p align="center">
    <a href="./README.md">English</a>
  </p>
</p>

---

扔一个 Swagger/OpenAPI 文件进去，秒出一个全功能的 API 测试工作台——无需配置、无需数据库、无需环境变量。

> **你对着 Swagger JSON 发了多少次呆，想知道每个接口到底返回什么？** Swagger Lab 让你的 API 文档"活"起来。上传即用，切接口、改参数、看响应，一气呵成。

## 为什么需要 Swagger Lab？

市面上的 API 测试工具，你得一个个手动配请求。Swagger Lab 的思路不一样：你的 API 契约本身就是测试套件。上传一次，所有接口——连同参数、请求体、响应结构——原地待命。你可以把它理解为"从 Swagger 自动生成的 Postman"。

### 🎯 搞定这四件事

- **Swagger UI 只读**——能看不能测，着急
- **Postman 集合容易过时**——api 文档更新了，collections 还停在旧版本
- **手写 cURL 太慢**——记参数名、拼 JSON 体，效率太低
- **CORS 直接拦住你**——浏览器页面调后端，跨域报错家常便饭

Swagger Lab 一把全解决。

## 截图

| 首页（上传前） | 工作台（上传后） |
|---|---|
| ![首页](img/swagger-lab_index.png) | ![工作台](img/swagger-lab_dash.png) |

## 功能特性

### 核心能力

- **拖拽上传**——支持 Swagger 2.0 和 OpenAPI 3.0，JSON / YAML 通吃
- **自动生成测试界面**——按 tag 分组，方法 + 路径 + 摘要一目了然
- **完整参数支持**——路径参数、查询参数、请求头、JSON 请求体全覆盖
- **智能请求体**——根据 schema 中的 `example` 或 `default` 字段自动生成 JSON 示例

### 开发者体验

- **内置 API 代理**——所有请求走后端转发，从此告别 CORS 烦恼
- **代码片段一键生成**——任意请求均可导出为 cURL、Fetch、Axios、Python 四种格式
- **请求历史记录**——每次调用的状态码、耗时全记录，随时回看
- **多环境管理**——保存多套环境（生产 / 预发 / 本地），各自维护 URL 和 Token
- **深色模式**——保护眼睛的暗色主题，偏好设置跨会话保持

### 架构特色

- **除 Node.js 外零依赖**——无需数据库、Redis、Docker
- **一行命令启动**——`npm start` 即跑
- **内置 Mock 服务**——内存级 CRUD Mock API，随手演示
- **零构建步骤**——Vue 3 CDN 引入，原生 CSS，改了刷新就能看到效果

## 快速开始

```bash
git clone https://github.com/clarklooking/swagger-lab.git
cd swagger-lab
npm install
npm start
```

打开 http://localhost:3210，把 Swagger 文件拖进去即可。

## 演示

项目内置了 `petstore-demo.json` 演示文件，定义了一套宠物商店 CRUD 接口，基于内存 Mock 实现。不需要任何外部服务，上传即可直接调用。

| 演示接口 | 方法 | 说明 |
|---|---|---|
| `/mock/pets` | GET | 获取宠物列表（支持筛选） |
| `/mock/pets/{id}` | GET | 获取单个宠物详情 |
| `/mock/pets` | POST | 新增宠物 |
| `/mock/pets/{id}` | PUT | 更新宠物信息 |
| `/mock/pets/{id}` | DELETE | 删除宠物 |
| `/mock/header-test` | GET | 查看服务端收到的自定义 Header |

## 技术栈

| 层次 | 技术选型 |
|---|---|
| 运行时 | Node.js |
| Web 框架 | Express 5 |
| 前端 | Vue 3 (CDN) |
| 文件解析 | js-yaml, multer |
| HTTP 代理 | node-fetch |

不依赖任何构建工具、打包器或 CSS 框架。极致轻量，随时魔改。

## 项目结构

```
swagger-lab/
├── server.js              # Express 后端（上传、代理、Mock 接口）
├── package.json
├── public/
│   └── index.html         # 完整 SPA 单页应用（Vue 3 + 内联 CSS）
├── petstore-demo.json     # 演示用 Swagger 文件
├── LICENSE
└── README.md
```

## API 接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/upload` | `POST` | 上传 Swagger 文件（multipart），返回解析后的接口列表 |
| `/api/proxy` | `POST` | 代理 HTTP 请求，返回响应 + 耗时 + 响应大小 |
| `/api/history` | `GET` | 获取请求历史记录 |
| `/api/history` | `DELETE` | 清空请求历史 |

## 开源协议

MIT © [Swagger Lab](https://github.com/clarklooking/swagger-lab)
