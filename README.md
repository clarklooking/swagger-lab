# Swagger Lab

Upload a Swagger/OpenAPI file and instantly get an interactive API testing page.

上传 Swagger/OpenAPI 文件，自动生成可交互的 API 测试页面。

---

## Features / 功能特性

- Supports Swagger 2.0 and OpenAPI 3.0 (JSON / YAML)
- Auto-generates a test UI grouped by API tags
- Supports GET, POST, PUT, DELETE, PATCH with path/query/header/body parameters
- Built-in API proxy to bypass CORS
- Bearer Token authentication support
- Zero database, zero middleware — just Node.js

- 支持 Swagger 2.0 和 OpenAPI 3.0（JSON / YAML 格式）
- 按 tag 自动生成分组的接口测试界面
- 支持 GET、POST、PUT、DELETE、PATCH，覆盖路径/查询/请求头/请求体参数
- 内置 API 代理，解决浏览器跨域限制
- 支持 Bearer Token 认证
- 无数据库、无中间件，只需 Node.js

## Quick Start / 快速开始

```bash
# Install dependencies / 安装依赖
npm install

# Start the server / 启动服务
npm start
```

Open http://localhost:3210, upload a Swagger file, and start testing.

打开 http://localhost:3210，上传 Swagger 文件即可开始测试。

## Demo / 演示

A demo Swagger file `petstore-demo.json` is included in the repo. Upload it to try out the mock APIs (CRUD operations on a pet store).

项目内置了 `petstore-demo.json` 演示文件，上传即可体验 Mock 接口（宠物商店 CRUD）。

## Tech Stack / 技术栈

| Component | Tech |
|---|---|
| Backend / 后端 | Express, multer, js-yaml, node-fetch |
| Frontend / 前端 | Vue 3 (CDN), vanilla CSS |

No build tools. No bundler. Just `npm start`.

无需构建工具，无需打包，`npm start` 即可运行。

## API Endpoints / 后端接口

| Endpoint | Method | Description / 说明 |
|---|---|---|
| `POST /api/upload` | multipart/form-data | Upload Swagger file / 上传 Swagger 文件 |
| `POST /api/proxy` | JSON | Proxy API requests / 代理转发 API 请求 |

## License

MIT
