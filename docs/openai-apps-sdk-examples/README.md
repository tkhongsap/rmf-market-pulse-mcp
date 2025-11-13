# OpenAI Apps SDK Deployment Guide

> Comprehensive guide based on [openai/openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples)

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Widget Development](#widget-development)
- [MCP Server Implementation](#mcp-server-implementation)
- [Testing & Debugging](#testing--debugging)
- [Production Considerations](#production-considerations)
- [Examples](#examples)

---

## Overview

### What is the OpenAI Apps SDK?

The **OpenAI Apps SDK** enables developers to create rich, interactive user interfaces that integrate with ChatGPT. It works alongside the **Model Context Protocol (MCP)**—an open specification that connects language models to external tools, data, and custom interfaces.

### Key Capabilities

The Apps SDK + MCP integration provides three core capabilities:

1. **Tool Advertisement** - Servers announce supported tools with JSON Schema contracts and optional annotations
2. **Tool Invocation** - ChatGPT calls tools with user-intent-matching arguments; servers execute and return structured results
3. **Widget Rendering** - Servers include metadata in responses that the Apps SDK uses to display inline UI components

### Use Cases

- **Interactive Data Visualization** - Display charts, graphs, 3D models, and maps directly in ChatGPT
- **Custom UI Components** - Create shopping interfaces, galleries, carousels, and task managers
- **Rich Content Display** - Embed HTML/CSS/JS widgets for enhanced user experiences
- **Data Integration** - Connect ChatGPT to your APIs and databases with custom visualizations

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         ChatGPT                              │
│                    (Apps SDK Client)                         │
└──────────────────┬──────────────────────────────────────────┘
                   │ MCP Protocol (JSON-RPC 2.0)
                   │ via SSE (Server-Sent Events)
┌──────────────────▼──────────────────────────────────────────┐
│                    MCP Server                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tool Handlers (expose capabilities)                   │ │
│  │  - validate inputs (Zod schemas)                       │ │
│  │  - execute business logic                              │ │
│  │  - return structured content + widget metadata         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Resource Handlers (serve widget assets)               │ │
│  │  - HTML templates                                      │ │
│  │  - JavaScript bundles                                  │ │
│  │  - CSS stylesheets                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ HTTP GET
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Widget Asset Server                             │
│         http://localhost:4444/assets/                        │
│  - Serves compiled HTML/JS/CSS bundles                       │
│  - CORS enabled for local development                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Query** → ChatGPT analyzes user intent
2. **Tool Selection** → ChatGPT selects appropriate MCP tool
3. **Tool Invocation** → MCP server receives tool call with parameters
4. **Business Logic** → Server executes logic, fetches data
5. **Widget Response** → Server returns:
   - `content`: Text summary
   - `structuredContent`: JSON data
   - `_meta.openai/outputTemplate`: Widget metadata
6. **Widget Rendering** → ChatGPT fetches widget HTML from asset server
7. **Display** → User sees interactive widget inline in chat

---

## Prerequisites

### System Requirements

- **Node.js**: 18+ (for widget building and Node.js servers)
- **Python**: 3.10+ (for Python MCP servers)
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Browser**: Chrome 142+ (requires flag configuration for local testing)

### Required Tools

```bash
# Install pnpm globally (recommended)
npm install -g pnpm

# Install pre-commit (optional, for code formatting)
pip install pre-commit
```

### Browser Configuration (for local development)

**Chrome 142+ users only:**

1. Navigate to `chrome://flags/`
2. Search for "Local Network Access Check"
3. Set `#local-network-access-check` to **Disabled**
4. Restart Chrome

This is required to view widgets served from `localhost` in ChatGPT's iframe.

---

## Quick Start

### 1. Clone and Install

```bash
# Clone the examples repository
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples

# Install dependencies
pnpm install

# Setup pre-commit hooks (optional)
pre-commit install
```

### 2. Build Widget Assets

```bash
# Build all widgets
pnpm run build

# This generates versioned bundles in ./assets/
# Output: HTML, JS, CSS files for each widget
```

### 3. Serve Widget Assets

```bash
# Start asset server on http://localhost:4444
pnpm run serve

# Keep this running in a separate terminal
# Assets must be accessible at http://localhost:4444/assets/
```

### 4. Launch MCP Server

**Option A: Node.js Server (Pizzaz)**

```bash
cd pizzaz_server_node
pnpm install
pnpm start

# Server runs on http://127.0.0.1:8000
```

**Option B: Python Server (Pizzaz)**

```bash
cd pizzaz_server_python
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Server runs on http://127.0.0.1:8000
```

**Option C: Python Server (Solar System 3D)**

```bash
cd solar-system_server_python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py

# Server runs on http://127.0.0.1:8000
```

### 5. Expose Server to ChatGPT (Local Testing)

```bash
# Install ngrok
# Download from https://ngrok.com/download

# Expose your local MCP server
ngrok http 8000

# Copy the generated public URL (e.g., https://abc123.ngrok.io)
```

### 6. Connect to ChatGPT

1. Open ChatGPT in developer mode
2. Navigate to Connector Settings
3. Add new connector with your ngrok URL: `https://abc123.ngrok.io`
4. Test by asking ChatGPT to use your tools

---

## Deployment Options

### Option 1: Local Development (ngrok)

**Pros:**
- Quick setup for testing
- No infrastructure needed
- Instant iteration

**Cons:**
- ngrok URL changes on restart
- Not suitable for production
- Limited to development testing

**Setup:**
```bash
# Terminal 1: Asset server
pnpm run serve

# Terminal 2: MCP server
cd pizzaz_server_node
pnpm start

# Terminal 3: ngrok
ngrok http 8000
```

### Option 2: Cloud Deployment (Production)

**Recommended Stack:**

**Widget Assets:**
- **Hosting**: AWS S3 + CloudFront, Vercel, Netlify, or any CDN
- **Files**: Static HTML/JS/CSS bundles from `./assets/`
- **CORS**: Must be configured for ChatGPT domains

**MCP Server:**
- **Node.js**: Deploy to Vercel, Railway, Render, or AWS Lambda
- **Python**: Deploy to Railway, Render, Google Cloud Run, or AWS Lambda
- **Requirements**:
  - Public HTTPS endpoint
  - SSE (Server-Sent Events) support
  - CORS enabled

**Example: Deploy to Railway**

1. **Deploy Widget Assets to Vercel:**

```bash
# In project root
pnpm run build

# Deploy assets directory to Vercel
cd assets
vercel --prod

# Copy the deployment URL (e.g., https://your-widgets.vercel.app)
```

2. **Update MCP Server Widget URLs:**

Update your server code to point to production asset URLs:

```typescript
// Node.js example
const WIDGET_BASE_URL = "https://your-widgets.vercel.app";
```

3. **Deploy MCP Server to Railway:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

4. **Configure Environment:**

Set environment variables in Railway dashboard:
- `PORT`: 8000 (or Railway's auto-assigned port)
- `CORS_ORIGINS`: ChatGPT allowed origins

5. **Get Public URL:**

Railway provides a public HTTPS URL (e.g., `https://your-app.railway.app`)

### Option 3: Self-Hosted (VPS)

**Example: Deploy to Ubuntu VPS**

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone and build
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples
pnpm install
pnpm run build

# Setup nginx to serve assets
sudo cp -r assets /var/www/widgets
# Configure nginx with CORS headers

# Setup MCP server with PM2
cd pizzaz_server_node
pnpm install
pm2 start pnpm --name "mcp-server" -- start
pm2 save
pm2 startup

# Setup HTTPS with Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

---

## Widget Development

### Widget Structure

Each widget consists of:

1. **Widget Definition** (TypeScript/Python):
```typescript
interface Widget {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  templateUri: string;           // Widget asset URL
  invocationStates: {
    approvalHint?: string;       // Message before execution
    inProgressHint?: string;     // Message during execution
    successHint?: string;        // Message after execution
  };
  html: string;                  // Widget HTML content
  responseText: string;          // Text response
}
```

2. **Widget Implementation** (React/HTML):
```typescript
// src/my-widget/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetProps } from '../utils/widget-types';

interface MyWidgetData {
  // Your widget's data structure
  message: string;
  items: string[];
}

function MyWidget({ data }: WidgetProps<MyWidgetData>) {
  return (
    <div className="p-4">
      <h2>{data.message}</h2>
      <ul>
        {data.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <MyWidget />
    </StrictMode>
  );
}
```

3. **Build Configuration**:
```typescript
// Add to build-all.mts
const widgets = [
  // ... existing widgets
  {
    name: 'my-widget',
    entry: 'src/my-widget/main.tsx',
    template: 'index.html'
  }
];
```

### Available Example Widgets

The repository includes these widgets:

1. **pizzaz** - Main pizza shop widget
2. **pizzaz-carousel** - Image carousel
3. **pizzaz-albums** - Album/gallery view
4. **pizzaz-list** - List display
5. **pizzaz-shop** - Shopping interface
6. **solar-system** - 3D planetary viewer (Three.js)
7. **todo** - Task management widget

### Creating a New Widget

**Step 1: Create widget directory**

```bash
mkdir src/my-widget
```

**Step 2: Create main component**

```typescript
// src/my-widget/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function MyWidget() {
  return <div>Hello Widget!</div>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MyWidget />
  </StrictMode>
);
```

**Step 3: Add to build configuration**

Edit `build-all.mts` to include your widget in the build process.

**Step 4: Build and test**

```bash
pnpm run build
pnpm run serve
```

**Step 5: Register in MCP server**

Add your widget to the server's widget registry (see MCP Server Implementation section).

---

## MCP Server Implementation

### Node.js Implementation

**File: `server.ts`**

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import express from 'express';
import cors from 'cors';

// Widget definition
interface Widget {
  id: string;
  title: string;
  templateUri: string;
  invocationStates: {
    approvalHint?: string;
    inProgressHint?: string;
    successHint?: string;
  };
  html: string;
  responseText: string;
}

// Define your widgets
const widgets: Widget[] = [
  {
    id: 'my-widget',
    title: 'My Widget',
    templateUri: 'http://localhost:4444/assets/my-widget.html',
    invocationStates: {
      approvalHint: 'About to show my widget',
      inProgressHint: 'Loading widget...',
      successHint: 'Widget loaded successfully'
    },
    html: '<html>...</html>',  // Load from file
    responseText: 'Widget displayed'
  }
];

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Session management
const sessions = new Map<string, { server: Server; transport: SSEServerTransport }>();

// SSE endpoint
app.get('/mcp', async (req, res) => {
  const sessionId = Math.random().toString(36).substring(7);

  const transport = new SSEServerTransport('/mcp/messages', res);
  const server = new Server(
    { name: 'my-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // List tools
  server.setRequestHandler('tools/list', async () => ({
    tools: widgets.map(w => ({
      name: w.id,
      description: w.title,
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'object', description: 'Widget data' }
        },
        required: ['data']
      },
      annotations: {
        'openai/outputTemplate': { templateUri: w.templateUri },
        'openai/invocationStates': w.invocationStates
      }
    }))
  }));

  // Call tool
  server.setRequestHandler('tools/call', async (request) => {
    const widget = widgets.find(w => w.id === request.params.name);
    if (!widget) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    return {
      content: [
        { type: 'text', text: widget.responseText }
      ],
      structuredContent: request.params.arguments,
      _meta: {
        'openai/outputTemplate': { templateUri: widget.templateUri },
        'openai/invocationStates': widget.invocationStates
      }
    };
  });

  // List resources
  server.setRequestHandler('resources/list', async () => ({
    resources: widgets.map(w => ({
      uri: w.templateUri,
      mimeType: 'text/html+skybridge',
      name: w.title
    }))
  }));

  // Read resource
  server.setRequestHandler('resources/read', async (request) => {
    const widget = widgets.find(w => w.templateUri === request.params.uri);
    if (!widget) {
      throw new Error(`Unknown resource: ${request.params.uri}`);
    }

    return {
      contents: [{
        uri: request.params.uri,
        mimeType: 'text/html+skybridge',
        text: widget.html
      }]
    };
  });

  sessions.set(sessionId, { server, transport });
  await transport.start();
});

// Message endpoint
app.post('/mcp/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  await session.transport.handlePostMessage(req, res);
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`MCP server running on http://127.0.0.1:${PORT}`);
});
```

### Python Implementation (FastAPI)

**File: `main.py`**

```python
from typing import Any, Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

# Widget definition
class Widget:
    def __init__(
        self,
        id: str,
        title: str,
        template_uri: str,
        html: str,
        response_text: str,
        approval_hint: str = "",
        in_progress_hint: str = "",
        success_hint: str = ""
    ):
        self.id = id
        self.title = title
        self.template_uri = template_uri
        self.html = html
        self.response_text = response_text
        self.invocation_states = {
            "approvalHint": approval_hint,
            "inProgressHint": in_progress_hint,
            "successHint": success_hint
        }

# Define widgets
widgets = [
    Widget(
        id="my-widget",
        title="My Widget",
        template_uri="http://localhost:4444/assets/my-widget.html",
        html="<html>...</html>",  # Load from file
        response_text="Widget displayed",
        approval_hint="About to show widget",
        in_progress_hint="Loading...",
        success_hint="Widget loaded"
    )
]

# Create FastMCP server
mcp = FastMCP("my-mcp-server")

# Tool input model
class WidgetInput(BaseModel):
    data: Dict[str, Any] = Field(..., description="Widget data")

# Register tools
@mcp.tool()
async def my_widget(input: WidgetInput) -> Dict[str, Any]:
    """Display my custom widget"""
    widget = widgets[0]

    return {
        "content": [{"type": "text", "text": widget.response_text}],
        "structuredContent": input.data,
        "_meta": {
            "openai/outputTemplate": {"templateUri": widget.template_uri},
            "openai/invocationStates": widget.invocation_states
        }
    }

# Create FastAPI app
app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount MCP server
app.mount("/mcp", mcp.get_asgi_app())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

### Key Implementation Notes

1. **SSE Transport**: MCP uses Server-Sent Events for bi-directional communication
2. **Session Management**: Track active sessions with unique IDs
3. **Tool Registration**: Tools must include input schemas and OpenAI annotations
4. **Resource Handling**: Widgets are exposed as resources with `text/html+skybridge` MIME type
5. **Metadata**: `_meta.openai/outputTemplate` links tool responses to widget templates
6. **CORS**: Must be enabled for ChatGPT to access your server

---

## Testing & Debugging

### Local Testing with MCP Inspector

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Run inspector
mcp-inspector http://127.0.0.1:8000/mcp

# Interactive testing in browser
```

### Testing Widget Rendering

1. **Test asset server**:
```bash
curl http://localhost:4444/assets/my-widget.html
```

2. **Test MCP tool listing**:
```bash
curl -X POST http://127.0.0.1:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

3. **Test tool invocation**:
```bash
curl -X POST http://127.0.0.1:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools/call",
    "params":{"name":"my-widget","arguments":{"data":{"test":"value"}}},
    "id":2
  }'
```

### Debugging Tips

1. **Check browser console** for widget rendering errors
2. **Verify CORS headers** in Network tab
3. **Test SSE connection** with curl or MCP Inspector
4. **Check ngrok logs** for request/response details
5. **Use `console.log`** in widget JavaScript
6. **Verify asset URLs** are accessible from ChatGPT

### Common Issues

**Issue: Widget not rendering**
- Check Chrome flags (`#local-network-access-check`)
- Verify asset server is running on port 4444
- Check CORS headers in response
- Ensure widget HTML is valid

**Issue: Tool not appearing in ChatGPT**
- Verify MCP server is running
- Check ngrok tunnel is active
- Confirm connector URL in ChatGPT settings
- Review tool schema for errors

**Issue: SSE connection fails**
- Check server logs for errors
- Verify port 8000 is not in use
- Test SSE endpoint with curl
- Check firewall rules

---

## Production Considerations

### Security

1. **CORS Configuration**:
```typescript
app.use(cors({
  origin: ['https://chatgpt.com', 'https://chat.openai.com'],
  credentials: true
}));
```

2. **Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/mcp', limiter);
```

3. **Input Validation**:
```typescript
// Use Zod for strict validation
const InputSchema = z.object({
  data: z.object({
    field: z.string().max(1000)
  })
});
```

4. **Authentication** (if needed):
```typescript
app.use('/mcp', authenticateMiddleware);
```

### Performance

1. **Cache Widget HTML**:
```typescript
const widgetCache = new Map<string, string>();

function getWidgetHTML(id: string): string {
  if (!widgetCache.has(id)) {
    widgetCache.set(id, fs.readFileSync(`assets/${id}.html`, 'utf8'));
  }
  return widgetCache.get(id)!;
}
```

2. **CDN for Assets**:
- Use CloudFront, Cloudflare, or Fastly
- Enable gzip compression
- Set appropriate cache headers

3. **Connection Pooling**:
- Reuse database connections
- Implement connection pooling for APIs

### Monitoring

1. **Logging**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. **Error Tracking**:
- Sentry for error monitoring
- Application Insights for Azure deployments
- CloudWatch for AWS

3. **Health Checks**:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Scalability

1. **Horizontal Scaling**:
- Deploy multiple server instances
- Use load balancer (ALB, nginx)
- Implement session affinity for SSE

2. **Stateless Design**:
- Store session state in Redis
- Avoid in-memory session storage

3. **Asset Optimization**:
- Minify JavaScript and CSS
- Use tree-shaking for smaller bundles
- Implement code splitting

---

## Examples

See the `examples/` directory for:

- **Node.js MCP Server** - Complete implementation with multiple widgets
- **Python MCP Server** - FastAPI-based server with FastMCP
- **Custom Widget** - React widget with Tailwind CSS
- **3D Visualization** - Three.js integration example
- **Production Deployment** - Railway + Vercel configuration

---

## Resources

- **Official Repository**: https://github.com/openai/openai-apps-sdk-examples
- **MCP Specification**: https://modelcontextprotocol.io
- **MCP SDK (Node)**: https://github.com/modelcontextprotocol/sdk-typescript
- **MCP SDK (Python)**: https://github.com/modelcontextprotocol/python-sdk
- **OpenAI Apps Documentation**: https://platform.openai.com/docs/apps

---

## License

The OpenAI Apps SDK examples are released under the MIT License. See the original repository for details.

---

**Last Updated**: 2025-01-13
**Repository Version**: Based on commit f8d6471
