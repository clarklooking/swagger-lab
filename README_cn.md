# Swagger Lab

[English](./README.md)

上传 Swagger/OpenAPI 文件，自动生成可交互的 API 测试页面。

## 截图

| 首页（上传前） | 使用页（上传后） |
|---|---|
| ![首页](img/swagger-lab_index.png) | ![使用页](img/swagger-lab_dash.png) |

## 功能特性

- 支持 Swagger 2.0 和 OpenAPI 3.0（JSON / YAML 格式）
- 按 tag 自动生成分组的接口测试界面
- 支持 GET、POST、PUT、DELETE、PATCH，覆盖路径/查询/请求头/请求体参数
- 内置 API 代理，解决浏览器跨域限制
- 支持 Bearer Token 认证
- 无数据库、无中间件，只需 Node.js

## 快速开始

```bash
npm install
npm start
```

打开 http://localhost:3210，上传 Swagger 文件即可开始测试。

## 演示

项目内置了 `petstore-demo.json` 演示文件，上传即可体验 Mock 接口（宠物商店 CRUD）。

## 技术栈

| 组件 | 技术 |
|---|---|
| 后端 | Express, multer, js-yaml, node-fetch |
| 前端 | Vue 3 (CDN), 原生 CSS |

无需构建工具，无需打包，`npm start` 即可运行。

## 后端接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `POST /api/upload` | multipart/form-data | 上传 Swagger 文件 |
| `POST /api/proxy` | JSON | 代理转发 API 请求 |

## 开源协议

MIT
