# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Swagger Lab — 上传 Swagger/OpenAPI 文件，自动生成可交互的 API 测试页面。

## 架构

- `server.js` — Express 后端，负责：静态文件托管、Swagger 文件解析（`POST /api/upload`）、API 请求代理（`POST /api/proxy`）
- `public/index.html` — Vue 3 CDN 单页应用，上传 Swagger → 渲染接口列表 → 填参数调用

## 常用命令

```bash
npm install        # 安装依赖
npm start          # 启动服务，默认 http://localhost:3210
```

## 依赖

- `express` — Web 框架
- `multer` — 文件上传
- `js-yaml` — YAML 解析
- `node-fetch@2` — 后端 HTTP 请求代理

## API 接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `POST /api/upload` | multipart/form-data | 上传 Swagger 文件，返回解析后的接口列表 |
| `POST /api/proxy` | JSON | 代理请求 `{ method, url, headers, body }` |
