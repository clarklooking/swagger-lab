# Swagger Lab

[简体中文](./README_cn.md)

Upload a Swagger/OpenAPI file and instantly get an interactive API testing page.

## Features

- Supports Swagger 2.0 and OpenAPI 3.0 (JSON / YAML)
- Auto-generates a test UI grouped by API tags
- Supports GET, POST, PUT, DELETE, PATCH with path/query/header/body parameters
- Built-in API proxy to bypass CORS
- Bearer Token authentication support
- Zero database, zero middleware — just Node.js

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:3210, upload a Swagger file, and start testing.

## Demo

A demo file `petstore-demo.json` is included. Upload it to try the mock APIs (pet store CRUD).

## Tech Stack

| Component | Tech |
|---|---|
| Backend | Express, multer, js-yaml, node-fetch |
| Frontend | Vue 3 (CDN), vanilla CSS |

No build tools. No bundler. Just `npm start`.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/upload` | multipart/form-data | Upload Swagger file |
| `POST /api/proxy` | JSON | Proxy API requests |

## License

MIT
