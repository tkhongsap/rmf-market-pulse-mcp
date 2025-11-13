# OpenAI Apps SDK Deployment Documentation

Complete guide and examples for deploying applications using the OpenAI Apps SDK with Model Context Protocol (MCP) servers.

## Overview

This documentation provides everything you need to build and deploy custom ChatGPT applications with interactive widgets using the OpenAI Apps SDK.

**Based on:** [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) repository

## Documentation

### 📘 [Deployment Guide](./DEPLOYMENT_GUIDE.md)

Comprehensive guide covering:
- Architecture overview and concepts
- Widget development with React
- MCP server implementation (Node.js & Python)
- Building and serving widgets
- Deployment options (local, cloud, self-hosted)
- ChatGPT integration
- Production considerations (security, performance, monitoring)

**Start here** for a deep understanding of the Apps SDK architecture.

### 🚀 [Quick Start Guide](./QUICK_START.md)

Get up and running in under 10 minutes:
- Prerequisites and setup
- Building your first widget server
- Connecting to ChatGPT
- Testing and troubleshooting
- Next steps and customization

**Start here** if you want to see it working immediately.

### 💻 [Example Code](./examples/)

Complete, working implementations:
- **Node.js/TypeScript** MCP server (`pizzaz-server-node.ts`)
- **Python/FastMCP** server (`pizzaz-server-python.py`)
- Configuration files (`package.json`, `requirements.txt`, `tsconfig.json`)
- Environment setup (`.env.example`)

**Start here** to copy and customize working code.

## What is the OpenAI Apps SDK?

The OpenAI Apps SDK enables developers to create custom tools for ChatGPT that can:

1. **Expose Custom Tools**: Define functions that ChatGPT can call
2. **Return Rich UI**: Render interactive React widgets inline with responses
3. **Handle Complex Data**: Process and visualize structured data
4. **Integrate Services**: Connect ChatGPT to your APIs and databases

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   ChatGPT   │────────▶│ MCP Server  │────────▶│   Widget    │
│   Client    │◀────────│   (Tools)   │◀────────│   Assets    │
└─────────────┘         └─────────────┘         └─────────────┘
```

**Components:**

1. **MCP Server**: Implements the Model Context Protocol, exposes tools, returns widget metadata
2. **Widget Assets**: React-based UI components served as static HTML/JS/CSS bundles
3. **ChatGPT**: Calls tools via natural language, renders widgets inline

## Use Cases

### Data Visualization
Create custom charts, graphs, and dashboards that render directly in ChatGPT conversations.

### Interactive Forms
Build forms for data collection, configuration, or user input with real-time validation.

### Geospatial Applications
Display maps, location data, and geographic visualizations with Mapbox integration.

### E-commerce
Product catalogs, shopping carts, and checkout flows integrated into chat.

### 3D Visualization
Three.js-powered 3D models and interactive visualizations.

### Task Management
To-do lists, project boards, and workflow tools embedded in conversations.

## Technology Stack

### Frontend (Widgets)
- **React 19**: Core UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Three.js / React Three Fiber**: 3D graphics (optional)
- **Mapbox GL**: Maps and geospatial (optional)
- **Framer Motion**: Animations (optional)

### Backend (MCP Server)

**Node.js:**
- `@modelcontextprotocol/sdk`: Official MCP SDK
- Express: HTTP server
- Zod: Schema validation

**Python:**
- `mcp[fastapi]`: MCP SDK with FastAPI
- FastAPI: Web framework
- Uvicorn: ASGI server
- Pydantic: Data validation

## Getting Started

### Choose Your Path

**I want to understand everything first:**
→ Start with [Deployment Guide](./DEPLOYMENT_GUIDE.md)

**I want to see it working now:**
→ Start with [Quick Start Guide](./QUICK_START.md)

**I want to start coding:**
→ Start with [Example Code](./examples/)

### Minimal Setup

```bash
# 1. Clone the examples repository
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples

# 2. Build widgets
pnpm install
pnpm run build

# 3. Serve widgets
pnpm run serve  # Port 4444

# 4. Start MCP server (choose one)
cd pizzaz_server_node && pnpm start  # Node.js
# OR
cd pizzaz_server_python && python main.py  # Python

# 5. Expose locally (for ChatGPT access)
ngrok http 8000

# 6. Add to ChatGPT
# Settings → Developer → Enable Developer Mode
# Settings → Apps → Add Connector → [ngrok URL]/mcp
```

## File Structure

```
openai-apps-sdk-examples/
├── README.md                    # This file
├── DEPLOYMENT_GUIDE.md          # Comprehensive deployment guide
├── QUICK_START.md               # Quick start tutorial
└── examples/
    ├── README.md                # Example code documentation
    ├── pizzaz-server-node.ts    # Node.js MCP server
    ├── pizzaz-server-python.py  # Python MCP server
    ├── package.json             # Node.js dependencies
    ├── requirements.txt         # Python dependencies
    ├── tsconfig.json            # TypeScript config
    └── .env.example             # Environment variables template
```

## Key Concepts

### Model Context Protocol (MCP)

A protocol for exposing tools to AI models like ChatGPT. Your server must:

1. **Advertise tools** with JSON schemas
2. **Execute tool calls** with validated parameters
3. **Return responses** with optional widget metadata

### Widget Metadata

Tools can return `_meta` object to trigger widget rendering:

```json
{
  "content": [
    { "type": "text", "text": "Response message" }
  ],
  "_meta": {
    "openai/outputTemplate": "https://cdn.example.com/widget.html",
    "openai/resultCanProduceWidget": true
  }
}
```

### Separation of Concerns

- **MCP Server**: Business logic, data fetching, tool execution
- **Widget Assets**: UI rendering, user interactions, visualizations
- **Asset Server**: Static file hosting (can be CDN in production)

## Production Deployment

### Recommended Architecture

```
┌──────────────────────────────────────────────┐
│              ChatGPT                         │
└──────────────┬───────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐   ┌──────────────┐
│ MCP Server  │   │  CDN/Storage │
│ (Lambda/    │   │  (S3/        │
│  Cloud Run) │   │  Cloudflare) │
└─────────────┘   └──────────────┘
       │                │
       │                │
       ▼                ▼
┌─────────────┐   ┌──────────────┐
│  Database   │   │    Widgets   │
│  (RDS/      │   │   (HTML/JS/  │
│   Firestore)│   │    CSS)      │
└─────────────┘   └──────────────┘
```

### Deployment Checklist

- [ ] Build widgets with production settings
- [ ] Upload widget assets to CDN with CORS headers
- [ ] Deploy MCP server to cloud (Lambda, Cloud Run, etc.)
- [ ] Configure environment variables
- [ ] Set up HTTPS/SSL
- [ ] Restrict CORS origins in production
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Test all tools in ChatGPT
- [ ] Document tools for users

## Examples Included

### Pizzaz Demo (Node.js & Python)

Five pizza-themed widgets demonstrating different UI patterns:

1. **Pizza Map**: Mapbox-based location finder
2. **Pizza Carousel**: Image carousel component
3. **Pizza Albums**: Grid-based album view
4. **Pizza List**: Filterable list interface
5. **Pizza Shop**: E-commerce shopping interface

Each tool accepts a `pizzaTopping` parameter and renders an interactive widget.

### Solar System (Python)

3D visualization of the solar system using Three.js and React Three Fiber.

## Customization Guide

### 1. Add Your Own Tools

Modify the widget definitions in the server code:

```typescript
const myWidget = {
  id: 'data-dashboard',
  title: 'Data Dashboard',
  templateUri: `${WIDGET_BASE_URL}/dashboard.html`,
  responseText: 'Dashboard loaded'
};
```

### 2. Create Custom Widgets

Add new React components in `src/my-widget/index.tsx`:

```tsx
function MyWidget({ data }) {
  return (
    <div>
      <h1>My Custom Widget</h1>
      {/* Your UI here */}
    </div>
  );
}
```

### 3. Integrate Real APIs

Replace mock data with actual API calls in your MCP server.

### 4. Add Persistence

Connect to databases (PostgreSQL, MongoDB, Firestore) for data storage.

### 5. Implement Auth

Add authentication middleware to protect your tools.

## Resources

### Official Documentation
- **OpenAI Apps SDK Examples**: https://github.com/openai/openai-apps-sdk-examples
- **MCP Documentation**: https://modelcontextprotocol.io
- **ChatGPT Developer Mode**: https://chat.openai.com/settings

### Libraries & Frameworks
- **FastMCP**: https://github.com/jlowin/fastmcp
- **Vite**: https://vitejs.dev
- **React**: https://react.dev
- **FastAPI**: https://fastapi.tiangolo.com

### Tools
- **ngrok**: https://ngrok.com (for local development)
- **MCP Inspector**: https://github.com/modelcontextprotocol/inspector

## Troubleshooting

### Common Issues

**Widget not rendering:**
- Check CORS headers on widget assets
- Verify `WIDGET_BASE_URL` is accessible
- Disable Chrome's local network access check (dev only)

**Tools not appearing in ChatGPT:**
- Enable Developer Mode in ChatGPT settings
- Verify MCP server is running and accessible
- Start a new conversation after adding connector

**Connection errors:**
- Check ngrok is forwarding correctly
- Verify server is listening on correct port
- Review server logs for errors

See [Quick Start Guide](./QUICK_START.md#troubleshooting) for detailed solutions.

## Support & Contributing

This documentation is based on the official OpenAI Apps SDK examples. For issues:

1. Check the [Quick Start Guide](./QUICK_START.md) troubleshooting section
2. Review browser console and server logs
3. Test with MCP Inspector for debugging
4. Consult the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for architecture questions

## License

Based on [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) - MIT License

## Document Information

- **Version**: 1.0
- **Last Updated**: 2025-11-13
- **Repository**: tkhongsap/rmf-market-pulse-mcp
- **Location**: `docs/openai-apps-sdk-examples/`

---

**Ready to build?** Start with the [Quick Start Guide](./QUICK_START.md) or dive into the [Deployment Guide](./DEPLOYMENT_GUIDE.md)!
