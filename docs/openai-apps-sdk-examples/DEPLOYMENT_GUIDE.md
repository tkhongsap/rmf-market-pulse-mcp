# OpenAI Apps SDK Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying applications using the OpenAI Apps SDK based on the [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) repository.

The OpenAI Apps SDK enables developers to create custom UI components and Model Context Protocol (MCP) servers that integrate seamlessly with ChatGPT, providing rich interactive experiences beyond simple text responses.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Widget Development](#widget-development)
5. [MCP Server Implementation](#mcp-server-implementation)
6. [Building and Serving Widgets](#building-and-serving-widgets)
7. [Deployment Options](#deployment-options)
8. [ChatGPT Integration](#chatgpt-integration)
9. [Production Considerations](#production-considerations)

## Architecture Overview

### Core Components

The OpenAI Apps SDK ecosystem consists of three main components:

1. **UI Widgets**: React-based components that render interactive interfaces
2. **MCP Server**: Protocol server that exposes tools and manages widget metadata
3. **Asset Server**: Static file server that delivers compiled widget bundles

### How It Works

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   ChatGPT   │────────▶│ MCP Server  │────────▶│Widget Assets│
│   Client    │◀────────│   (Tools)   │◀────────│   (HTTP)    │
└─────────────┘         └─────────────┘         └─────────────┘
     │                         │                        │
     │                         │                        │
     └─────────────────────────┴────────────────────────┘
              User invokes tool → Widget rendered
```

**Flow:**
1. User invokes a tool through natural language in ChatGPT
2. ChatGPT calls the MCP server with tool parameters
3. MCP server returns structured data + widget metadata
4. ChatGPT fetches widget HTML/JS/CSS from asset server
5. Widget renders inline with the tool response

### MCP Protocol Requirements

An MCP server for the Apps SDK must implement three core capabilities:

1. **Tool Advertising**: Expose available tools with JSON Schema contracts
2. **Tool Execution**: Handle tool invocations with validated parameters
3. **Widget Metadata**: Return `_meta.openai/outputTemplate` for UI rendering

## Prerequisites

### For Widget Development

- **Node.js**: Version 18 or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **pnpm** installation: `npm install -g pnpm`
- **pre-commit**: For code quality hooks

### For MCP Server (Node.js)

- **Node.js**: Version 18+
- **Dependencies**: `@modelcontextprotocol/sdk`, `zod`

### For MCP Server (Python)

- **Python**: Version 3.10 or higher
- **Virtual Environment**: Recommended for isolation
- **Dependencies**: `fastapi`, `mcp[fastapi]`, `uvicorn`

### Browser Requirements

**Important:** Chrome 142+ users must disable the `#local-network-access-check` flag at `chrome://flags` to view widget UI served from localhost during development.

## Project Structure

```
openai-apps-sdk-examples/
├── src/                          # Widget source code
│   ├── pizzaz/                   # Core pizzaz widget
│   ├── pizzaz-albums/            # Album viewer widget
│   ├── pizzaz-carousel/          # Carousel display widget
│   ├── pizzaz-list/              # List presentation widget
│   ├── pizzaz-shop/              # Shopping interface widget
│   ├── solar-system/             # 3D solar system widget
│   ├── todo/                     # Task management widget
│   └── [each contains index.tsx] # Entry points for builds
│
├── assets/                       # Compiled widget bundles
│   ├── pizzaz.html
│   ├── pizzaz-[hash].js
│   ├── pizzaz-[hash].css
│   └── [other widgets...]
│
├── pizzaz_server_node/           # TypeScript MCP server
│   ├── src/
│   │   └── server.ts             # Main server implementation
│   ├── package.json
│   └── tsconfig.json
│
├── pizzaz_server_python/         # Python MCP server
│   ├── main.py                   # FastMCP server implementation
│   └── requirements.txt
│
├── solar-system_server_python/   # 3D visualization server
│
├── package.json                  # Root package config
├── vite.config.mts               # Widget build configuration
└── build-all.mts                 # Build orchestration script
```

## Widget Development

### Widget Structure

Each widget is a self-contained React component with:

- **Entry point**: `src/{widget-name}/index.tsx`
- **Component**: React component using hooks and props
- **Styling**: CSS modules or Tailwind classes
- **Build output**: Separate HTML, JS, CSS bundles

### Available Widget Libraries

The example repository includes these UI libraries:

- **React 19**: Core framework
- **Three.js + React Three Fiber**: 3D rendering
- **Mapbox GL**: Geospatial visualization
- **Framer Motion / React Spring**: Animations
- **Embla Carousel**: Carousel functionality
- **Mermaid**: Diagram rendering
- **React DatePicker**: Date selection
- **Lucide React**: Icon library
- **Zod**: Schema validation
- **React Router DOM v7**: Routing

### Widget Hooks

Widgets can use specialized hooks for OpenAI integration:

- `use-openai-global.ts`: Access global OpenAI context
- `use-widget-state.ts`: Manage widget-specific state
- `use-widget-props.ts`: Receive props from tool invocations

### Creating a New Widget

1. **Create widget directory**:
   ```bash
   mkdir src/my-widget
   ```

2. **Create entry point** (`src/my-widget/index.tsx`):
   ```tsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';

   function MyWidget({ pizzaTopping }: { pizzaTopping: string }) {
     return (
       <div className="p-4">
         <h1>My Widget</h1>
         <p>Topping: {pizzaTopping}</p>
       </div>
     );
   }

   const root = ReactDOM.createRoot(document.getElementById('root')!);
   root.render(<MyWidget pizzaTopping="pepperoni" />);
   ```

3. **Widget will be auto-discovered** by Vite build system

## MCP Server Implementation

### Node.js Implementation (TypeScript)

The Node.js MCP server uses the official `@modelcontextprotocol/sdk` with Server-Sent Events (SSE) transport.

**Key features:**
- SSE-based transport for real-time communication
- Zod schema validation for tool parameters
- Structured widget metadata in responses
- Session management for multiple clients

**Core implementation pattern**:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';

// Define widget structure
type PizzazWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  responseText: string;
};

// Register widgets
const widgets: PizzazWidget[] = [
  {
    id: 'pizza-map',
    title: 'Pizza Map',
    templateUri: 'http://localhost:4444/pizzaz.html',
    invoking: 'Finding pizzerias...',
    invoked: 'Here are pizzerias near you',
    html: '<html>...</html>',
    responseText: 'Pizza map loaded'
  },
  // ... more widgets
];

// Initialize MCP server
const server = new Server({ name: 'pizzaz-mcp', version: '1.0.0' });

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: widgets.map(w => ({
    name: w.id,
    description: w.title,
    inputSchema: {
      type: 'object',
      properties: {
        pizzaTopping: { type: 'string', description: 'Pizza topping' }
      },
      required: ['pizzaTopping']
    }
  }))
}));

// Handle tool invocation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const widget = widgets.find(w => w.id === name);

  return {
    content: [
      { type: 'text', text: widget.responseText },
      { type: 'text', text: JSON.stringify({ topping: args.pizzaTopping }) }
    ],
    _meta: {
      'openai/outputTemplate': widget.templateUri,
      'openai/resultCanProduceWidget': true
    }
  };
});

// Setup SSE transport
const transport = new SSEServerTransport('/mcp', app);
await server.connect(transport);
```

**See:** `examples/pizzaz-server-node.ts` for complete implementation

### Python Implementation (FastMCP)

The Python implementation uses FastMCP, which provides FastAPI integration.

**Key features:**
- FastAPI/Starlette-based HTTP server
- Pydantic models for input validation
- CORS middleware for cross-origin requests
- Uvicorn ASGI server

**Core implementation pattern**:

```python
from dataclasses import dataclass
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel

# Define widget structure
@dataclass
class PizzazWidget:
    id: str
    title: str
    template_uri: str
    invoking: str
    invoked: str
    html: str
    response_text: str

# Initialize widgets
widgets = [
    PizzazWidget(
        id="pizza-map",
        title="Pizza Map",
        template_uri="http://localhost:4444/pizzaz.html",
        invoking="Finding pizzerias...",
        invoked="Here are pizzerias near you",
        html="<html>...</html>",
        response_text="Pizza map loaded"
    ),
    # ... more widgets
]

# Create MCP server
mcp = FastMCP("Pizzaz Demo")

# Input validation
class PizzaInput(BaseModel):
    pizzaTopping: str

# Register tools
@mcp.tool()
def pizza_map(input: PizzaInput):
    """Show pizza map"""
    widget = next(w for w in widgets if w.id == "pizza-map")

    return {
        "content": [
            {"type": "text", "text": widget.response_text},
            {"type": "text", "text": f'{{"topping": "{input.pizzaTopping}"}}'}
        ],
        "_meta": {
            "openai/outputTemplate": widget.template_uri,
            "openai/resultCanProduceWidget": True
        }
    }

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(mcp.get_asgi_app(), host="127.0.0.1", port=8000)
```

**See:** `examples/pizzaz-server-python.py` for complete implementation

### Widget Metadata Fields

The `_meta` object controls widget rendering:

- `openai/outputTemplate`: URI to widget HTML file
- `openai/resultCanProduceWidget`: Boolean flag (true to enable widget)
- Additional custom metadata as needed

### Tool Response Format

All tools must return this structure:

```typescript
{
  content: [
    { type: 'text', text: 'Human-readable message' },
    { type: 'text', text: 'JSON.stringify(structuredData)' }
  ],
  _meta: {
    'openai/outputTemplate': 'http://localhost:4444/widget.html',
    'openai/resultCanProduceWidget': true
  }
}
```

## Building and Serving Widgets

### Build Process

The build system uses Vite with multi-entry configuration to bundle each widget separately.

**1. Install dependencies**:
```bash
pnpm install
```

**2. Build all widgets**:
```bash
pnpm run build
```

This command:
- Discovers all `src/**/index.tsx` entry points
- Bundles each widget with Vite
- Generates hashed filenames for cache busting
- Outputs to `assets/` directory

**Build outputs**:
- `assets/{widget}.html` - HTML shell
- `assets/{widget}-[hash].js` - JavaScript bundle
- `assets/{widget}-[hash].css` - Stylesheet

### Development Server

For development, run the static file server:

```bash
pnpm run serve
```

This starts a server on `http://localhost:4444` with:
- CORS enabled for cross-origin requests
- Serves files from `assets/` directory
- Required before starting MCP server

### Production Build Optimization

**Vite configuration highlights**:

```typescript
// vite.config.mts
export default defineConfig({
  build: {
    rollupOptions: {
      input: inputs,  // All widget entry points
      output: {
        preserveEntrySignatures: 'strict',
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
    target: 'es2022',
    outDir: 'assets'
  },
  server: {
    port: 4444,
    cors: true
  }
});
```

## Deployment Options

### Option 1: Local Development

**Use case**: Testing and development

**Setup**:
1. Build widgets: `pnpm run build`
2. Serve assets: `pnpm run serve` (port 4444)
3. Run MCP server: `pnpm start` in `pizzaz_server_node/`
4. Use ngrok for public access: `ngrok http 4444` and `ngrok http 8000`

**ChatGPT configuration**:
- Add MCP connector with ngrok URL
- Enable developer mode in ChatGPT settings

### Option 2: Cloud Deployment (Recommended)

**Use case**: Production applications

**Architecture**:
```
┌─────────────────┐
│   CDN / Cloud   │  ← Widget assets (S3, Cloudflare, Vercel)
│   Storage       │     (static HTML/JS/CSS)
└─────────────────┘
         ▲
         │
┌─────────────────┐
│   MCP Server    │  ← Cloud function or container
│   (Node/Python) │     (AWS Lambda, Google Cloud Run, etc.)
└─────────────────┘
         ▲
         │
┌─────────────────┐
│    ChatGPT      │
└─────────────────┘
```

**Steps**:

1. **Deploy widget assets to CDN**:
   - Build widgets: `pnpm run build`
   - Upload `assets/` to S3, Cloudflare Pages, or Vercel
   - Configure CORS headers
   - Note the public URLs (e.g., `https://cdn.example.com/pizzaz.html`)

2. **Deploy MCP server**:

   **Node.js (AWS Lambda example)**:
   ```bash
   # Build server
   cd pizzaz_server_node
   pnpm install
   pnpm run build  # if using build step

   # Package for Lambda
   zip -r function.zip node_modules/ dist/ package.json

   # Deploy with AWS CLI or Serverless Framework
   ```

   **Python (Google Cloud Run example)**:
   ```bash
   # Create Dockerfile
   cd pizzaz_server_python

   # Build and deploy
   gcloud run deploy pizzaz-mcp \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Update widget template URIs**:
   - Change `http://localhost:4444/` to CDN URLs
   - Update in MCP server widget definitions

4. **Configure ChatGPT**:
   - Add MCP connector with production server URL
   - Test tool invocations

### Option 3: Self-Hosted Server

**Use case**: Enterprise deployments with custom infrastructure

**Requirements**:
- Web server (nginx, Apache) for widget assets
- Node.js or Python runtime for MCP server
- Reverse proxy for SSL termination
- Load balancer for scaling (optional)

**Example nginx configuration**:

```nginx
# Widget assets
server {
    listen 443 ssl;
    server_name widgets.example.com;

    root /var/www/widgets/assets;

    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;

    location / {
        try_files $uri $uri/ =404;
    }
}

# MCP server proxy
server {
    listen 443 ssl;
    server_name mcp.example.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## ChatGPT Integration

### Enable Developer Mode

1. Open ChatGPT settings
2. Navigate to "Developer" section
3. Enable "Developer mode"
4. This unlocks the ability to add custom MCP connectors

### Add MCP Connector

1. Go to Settings → Apps → Add connector
2. Enter MCP server URL:
   - Local: `http://localhost:8000/mcp` (with ngrok)
   - Production: `https://mcp.example.com/mcp`
3. Save and verify connection

### Test Tools

1. Start a new conversation
2. Click "More" (+ icon) → Select your app
3. Invoke tools via natural language:
   - "Show me the pizza map with pepperoni"
   - "Create a pizza carousel with mushrooms"
4. Widgets should render inline with responses

### Debugging

**MCP Inspector** (Node.js only):
```bash
cd pizzaz_server_node
npx @modelcontextprotocol/inspector pnpm start
```

This opens a web UI for testing tool invocations locally.

**Server logs**:
- Node.js: Check console output
- Python: Uvicorn logs to stdout

**Widget loading issues**:
- Verify CORS headers on asset server
- Check browser console for errors
- Ensure template URIs are accessible
- Disable `#local-network-access-check` in Chrome flags (dev only)

## Production Considerations

### Security

1. **Authentication**: Add auth middleware to MCP server
   ```typescript
   app.use((req, res, next) => {
     const token = req.headers.authorization;
     if (!validateToken(token)) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

2. **Input Validation**: Always validate tool parameters with Zod/Pydantic
   - Prevent injection attacks
   - Sanitize user inputs
   - Validate data types and ranges

3. **Rate Limiting**: Prevent abuse
   ```typescript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use('/mcp', limiter);
   ```

4. **HTTPS**: Always use SSL in production
   - Use Let's Encrypt for free certificates
   - Configure SSL termination at load balancer/proxy

5. **CORS**: Restrict origins in production
   ```typescript
   const corsOptions = {
     origin: ['https://chat.openai.com', 'https://chatgpt.com'],
     credentials: true
   };
   app.use(cors(corsOptions));
   ```

### Performance

1. **Widget Asset Optimization**:
   - Enable gzip/brotli compression
   - Use CDN for global distribution
   - Implement cache headers
   - Minimize bundle sizes with tree shaking

2. **Server Scaling**:
   - Use horizontal scaling with load balancers
   - Implement caching for frequently accessed data
   - Consider serverless for variable loads
   - Monitor response times and error rates

3. **Database Integration**:
   - Add persistent storage for user data
   - Use connection pooling
   - Implement caching layer (Redis)

### Monitoring

1. **Application Monitoring**:
   - Log all tool invocations
   - Track error rates and response times
   - Monitor server health metrics

2. **User Analytics**:
   - Track which tools are used most
   - Measure widget load times
   - Monitor user engagement

### Error Handling

1. **Graceful Degradation**:
   ```typescript
   try {
     const result = await processToolCall(args);
     return result;
   } catch (error) {
     console.error('Tool invocation failed:', error);
     return {
       content: [
         { type: 'text', text: 'Sorry, something went wrong. Please try again.' }
       ]
     };
   }
   ```

2. **Structured Logging**:
   ```python
   import logging

   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)

   @mcp.tool()
   def my_tool(input: MyInput):
       try:
           logger.info(f"Tool invoked with: {input}")
           result = process(input)
           logger.info(f"Tool succeeded")
           return result
       except Exception as e:
           logger.error(f"Tool failed: {str(e)}", exc_info=True)
           raise
   ```

### Maintenance

1. **Version Management**:
   - Use semantic versioning for MCP server
   - Track widget versions in metadata
   - Support backward compatibility

2. **Updates and Rollbacks**:
   - Blue-green deployments for zero downtime
   - Canary releases for gradual rollouts
   - Quick rollback procedures

3. **Documentation**:
   - Document all tools and their parameters
   - Maintain API changelog
   - Provide user guides for ChatGPT users

## Next Steps

1. **Explore Examples**: Review the complete example code in `examples/` directory
2. **Quick Start**: Follow the [Quick Start Guide](./QUICK_START.md) to deploy your first widget
3. **Customize**: Adapt the Pizzaz examples to your use case
4. **Deploy**: Choose a deployment option and go live
5. **Monitor**: Set up monitoring and iterate based on usage

## Resources

- **OpenAI Apps SDK Examples**: https://github.com/openai/openai-apps-sdk-examples
- **MCP SDK Documentation**: https://modelcontextprotocol.io
- **FastMCP**: https://github.com/jlowin/fastmcp
- **Vite Documentation**: https://vitejs.dev

## Support

For issues and questions:
- Check browser console for widget errors
- Review MCP server logs for API issues
- Use MCP Inspector for debugging tool calls
- Verify CORS configuration for cross-origin issues

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Based on**: openai-apps-sdk-examples (MIT License)
