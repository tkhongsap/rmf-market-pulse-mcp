# OpenAI Apps SDK - Quick Start Guide

Get your first MCP server with widgets running in under 10 minutes!

## What You'll Build

A working MCP server that:
- Exposes custom tools to ChatGPT
- Renders interactive widgets inline with responses
- Serves as a foundation for your own applications

## Prerequisites

Choose your stack:

**Option A: Node.js**
- Node.js 18+
- pnpm, npm, or yarn

**Option B: Python**
- Python 3.10+
- pip

## Quick Start (Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples
```

### Step 2: Install Dependencies

```bash
# Install root dependencies for widget builds
pnpm install

# Pre-commit hooks (optional)
pnpm install -g pre-commit
pre-commit install
```

### Step 3: Build Widgets

```bash
# Build all widget bundles
pnpm run build

# This creates assets/ directory with:
# - pizzaz.html, pizzaz-[hash].js, pizzaz-[hash].css
# - pizza-carousel.html, ...
# - And other widget bundles
```

### Step 4: Serve Widget Assets

In a **separate terminal**, start the static file server:

```bash
pnpm run serve
```

This starts a server on `http://localhost:4444` serving widget files with CORS enabled.

**Keep this running!** The MCP server needs to reference these assets.

### Step 5: Start MCP Server

In another terminal:

```bash
cd pizzaz_server_node
pnpm install
pnpm start
```

Your MCP server is now running on `http://localhost:8000`!

### Step 6: Expose Locally (Development Only)

For ChatGPT to access your local server, use ngrok:

```bash
# Install ngrok if you haven't
brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose MCP server
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abcd-1234.ngrok.io`)

### Step 7: Connect to ChatGPT

1. Open [ChatGPT](https://chat.openai.com)
2. Go to **Settings** → **Developer** → Enable **Developer Mode**
3. Go to **Settings** → **Apps** → **Add Connector**
4. Enter your ngrok URL: `https://abcd-1234.ngrok.io/mcp`
5. Save

### Step 8: Test It!

1. Start a new chat in ChatGPT
2. Click **More** (+) → Select your **Pizzaz Demo** app
3. Try these prompts:
   - "Show me the pizza map with pepperoni"
   - "Create a pizza carousel with mushrooms"
   - "Open the pizza shop with olives"

You should see interactive widgets render inline! 🎉

## Quick Start (Python)

### Step 1: Build Widgets

Follow Steps 1-4 from the Node.js guide above to build and serve widgets.

### Step 2: Set Up Python Server

```bash
cd pizzaz_server_python

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Start MCP Server

```bash
python main.py
```

Server runs on `http://127.0.0.1:8000`

### Step 4: Connect to ChatGPT

Follow Steps 6-8 from the Node.js guide above.

## Understanding the Flow

Here's what happens when you invoke a tool:

```
1. User: "Show me the pizza map with pepperoni"
   ↓
2. ChatGPT → MCP Server: POST /mcp/messages
   {
     tool: "pizza-map",
     arguments: { pizzaTopping: "pepperoni" }
   }
   ↓
3. MCP Server → ChatGPT:
   {
     content: [
       { type: "text", text: "Found nearby pizzerias" },
       { type: "text", text: '{"topping":"pepperoni"}' }
     ],
     _meta: {
       "openai/outputTemplate": "http://localhost:4444/pizzaz.html"
     }
   }
   ↓
4. ChatGPT → Widget Server: GET /pizzaz.html
   ↓
5. Widget renders inline with tool response
```

## Troubleshooting

### Widget doesn't load

**Problem**: Widget shows loading spinner forever

**Solutions**:
1. Check that `pnpm run serve` is still running on port 4444
2. Verify CORS headers:
   ```bash
   curl -I http://localhost:4444/pizzaz.html
   ```
   Should include: `Access-Control-Allow-Origin: *`

3. **Chrome users**: Disable `#local-network-access-check` at `chrome://flags`

### MCP server connection fails

**Problem**: "Failed to connect to MCP server"

**Solutions**:
1. Verify server is running:
   ```bash
   curl http://localhost:8000/
   ```

2. Check ngrok is forwarding correctly:
   ```bash
   curl https://your-ngrok-url.ngrok.io/
   ```

3. Restart ngrok if URL changed

### Tool not showing in ChatGPT

**Problem**: Can't find tools in ChatGPT

**Solutions**:
1. Make sure Developer Mode is enabled
2. Refresh ChatGPT page after adding connector
3. Start a **new** conversation
4. Click **More** (+) to select the app first

### Python: "No module named 'mcp'"

**Problem**: Import error when running Python server

**Solution**:
```bash
# Make sure you're in the virtual environment
source .venv/bin/activate

# Reinstall with correct package
pip install 'mcp[fastapi]>=0.1.0'
```

Note: There's an unrelated `modelcontextprotocol` package on PyPI - don't install that one!

## Next Steps

### 1. Customize the Example

Edit `pizzaz_server_node/src/server.ts` (or `main.py` for Python):

```typescript
// Add your own widget
const widgets: PizzazWidget[] = [
  ...
  {
    id: 'my-custom-widget',
    title: 'My Custom Widget',
    templateUri: `${WIDGET_BASE_URL}/my-widget.html`,
    responseText: 'Custom widget loaded!',
  },
];
```

### 2. Create Your Own Widget

```bash
# Create new widget directory
mkdir src/my-widget

# Create entry point
touch src/my-widget/index.tsx
```

```tsx
// src/my-widget/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

function MyWidget({ data }: { data: any }) {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600">
      <h1 className="text-white text-2xl">My Custom Widget</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<MyWidget data={{ hello: 'world' }} />);
```

Rebuild:
```bash
pnpm run build
```

### 3. Add Real Data

Replace hardcoded responses with real API calls:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { pizzaTopping } = request.params.arguments;

  // Call your API
  const restaurants = await fetch(`https://api.example.com/restaurants?topping=${pizzaTopping}`);
  const data = await restaurants.json();

  return {
    content: [
      { type: 'text', text: `Found ${data.length} restaurants` },
      { type: 'text', text: JSON.stringify(data) }
    ],
    _meta: {
      'openai/outputTemplate': widget.templateUri,
      'openai/resultCanProduceWidget': true
    }
  };
});
```

### 4. Deploy to Production

See the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for:
- Deploying to AWS Lambda / Google Cloud Run
- Serving widgets from CDN (S3, Cloudflare)
- Production security best practices
- Monitoring and scaling

## Key Concepts

### MCP Server Responsibilities

Your MCP server must:
1. **Advertise tools** with JSON schemas
2. **Execute tool calls** with validated parameters
3. **Return widget metadata** for UI rendering

### Widget Asset Server

Must serve static files with:
- CORS headers enabled (`Access-Control-Allow-Origin`)
- Correct MIME types (HTML, JS, CSS)
- HTTPS in production

### Tool Response Format

Always return this structure:

```typescript
{
  content: [
    { type: 'text', text: 'Human-readable summary' },
    { type: 'text', text: 'JSON.stringify(data)' }  // Optional structured data
  ],
  _meta: {
    'openai/outputTemplate': 'https://your-cdn.com/widget.html',
    'openai/resultCanProduceWidget': true
  }
}
```

## Useful Commands

### Development

```bash
# Watch mode for widgets (auto-rebuild)
pnpm run dev

# Type checking
pnpm run tsc

# Start widget server
pnpm run serve

# Start MCP server (Node)
cd pizzaz_server_node && pnpm start

# Start MCP server (Python)
cd pizzaz_server_python && python main.py
```

### Debugging

```bash
# MCP Inspector (Node.js only)
cd pizzaz_server_node
npx @modelcontextprotocol/inspector pnpm start
```

Opens a web UI at `http://localhost:5173` for testing tools locally.

### Testing

```bash
# Test tool invocation
curl -X POST http://localhost:8000/mcp/messages \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "pizza-map",
      "arguments": { "pizzaTopping": "pepperoni" }
    }
  }'

# Test widget loading
curl http://localhost:4444/pizzaz.html
```

## Resources

- **Full Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Example Code**: [examples/](./examples/)
- **OpenAI Apps SDK**: https://github.com/openai/openai-apps-sdk-examples
- **MCP Documentation**: https://modelcontextprotocol.io
- **FastMCP**: https://github.com/jlowin/fastmcp

## Getting Help

**Common issues:**
1. Widget not loading → Check CORS, Chrome flags, widget server
2. Tools not showing → Enable Developer Mode, start new chat
3. Connection failed → Verify ngrok URL, server running
4. Import errors (Python) → Use `mcp[fastapi]`, not `modelcontextprotocol`

**Still stuck?**
- Check browser console for errors
- Review MCP server logs
- Use MCP Inspector for debugging
- Try the examples in this repository first

---

**Ready to build?** Start with the examples and customize from there. The Pizzaz demo is intentionally simple - you can extend it with real data, authentication, databases, and more sophisticated widgets.

Happy coding! 🚀
