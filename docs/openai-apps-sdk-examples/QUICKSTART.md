# Quick Start Guide: OpenAI Apps SDK

Get your MCP server with widgets running in under 10 minutes.

## Prerequisites

- Node.js 18+
- Python 3.10+ (if using Python server)
- ngrok account (for testing)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Clone the examples repo
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples

# Install Node.js dependencies
pnpm install
# or: npm install
```

### 2. Build Widget Assets

```bash
# Build all widget bundles
pnpm run build

# This creates versioned HTML/JS/CSS files in ./assets/
# Output: assets/pizzaz-*.html, assets/solar-system-*.html, etc.
```

### 3. Start Asset Server

```bash
# Serve widgets on http://localhost:4444
pnpm run serve

# Keep this terminal window open!
# You should see: "Serving! - Local: http://localhost:4444"
```

### 4. Launch MCP Server

**Option A: Node.js Server**

```bash
# In a new terminal
cd pizzaz_server_node
pnpm install
pnpm start

# Server runs on http://127.0.0.1:8000
```

**Option B: Python Server**

```bash
# In a new terminal
cd pizzaz_server_python

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py

# Server runs on http://127.0.0.1:8000
```

### 5. Expose Server with ngrok

```bash
# In a new terminal
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# This URL will be used in ChatGPT
```

### 6. Configure Chrome (First Time Only)

**Chrome 142+ users:**

1. Go to `chrome://flags/`
2. Search for "Local Network Access Check"
3. Set to **Disabled**
4. Restart Chrome

### 7. Connect to ChatGPT

1. Open ChatGPT (chat.openai.com)
2. Enable developer mode (if available)
3. Go to Connector Settings
4. Add new connector:
   - **URL**: Your ngrok URL (e.g., `https://abc123.ngrok.io`)
   - **Name**: MCP Test Server
5. Save

### 8. Test Your Integration

In ChatGPT, try:

- "Show me a pizza map"
- "Display a pizza carousel"
- "Show me the solar system"

You should see interactive widgets appear in the chat!

## Troubleshooting

### Widget Not Rendering

**Check:**
1. Asset server is running on port 4444
2. Chrome flag is disabled
3. Browser console for errors
4. CORS is enabled on both servers

**Fix:**
```bash
# Restart asset server
pnpm run serve

# Check it's accessible
curl http://localhost:4444/assets/pizzaz.html
```

### Tool Not Appearing

**Check:**
1. MCP server is running on port 8000
2. ngrok tunnel is active
3. Connector URL is correct in ChatGPT

**Fix:**
```bash
# Test MCP endpoint
curl http://127.0.0.1:8000/mcp

# Check ngrok status
ngrok status
```

### Connection Errors

**Check:**
1. Firewall isn't blocking ports 4444 or 8000
2. ngrok account is active
3. CORS headers are present

**Fix:**
```bash
# Test with verbose curl
curl -v http://127.0.0.1:8000/health
```

## Next Steps

### Customize for Your Use Case

1. **Create Custom Widget**
   - Copy `src/pizzaz/` to `src/your-widget/`
   - Modify React component
   - Add to `build-all.mts`
   - Rebuild: `pnpm run build`

2. **Add Your Data**
   - Update server to fetch from your API/database
   - Modify tool handlers to return your data structure
   - Pass data to widget via `structuredContent`

3. **Deploy to Production**
   - Deploy assets to CDN (Vercel, Netlify, S3)
   - Deploy MCP server to Railway, Render, or similar
   - Update widget URLs to production endpoints
   - Configure CORS for ChatGPT domains

### Development Workflow

```bash
# Terminal 1: Widget development with hot reload
pnpm run dev

# Terminal 2: Asset server
pnpm run serve

# Terminal 3: MCP server
cd pizzaz_server_node
pnpm start

# Terminal 4: ngrok
ngrok http 8000
```

### Testing Tools

**MCP Inspector:**
```bash
# Install
npm install -g @modelcontextprotocol/inspector

# Run
mcp-inspector http://127.0.0.1:8000/mcp
```

**Manual Tool Testing:**
```bash
# List tools
curl -X POST http://127.0.0.1:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Call tool
curl -X POST http://127.0.0.1:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools/call",
    "params":{
      "name":"pizzaz-map",
      "arguments":{"pizzaTopping":"pepperoni"}
    },
    "id":2
  }'
```

## Architecture Overview

```
┌─────────────┐
│  ChatGPT    │
└──────┬──────┘
       │ MCP Protocol (via ngrok)
       ↓
┌──────────────────┐
│  MCP Server      │  http://127.0.0.1:8000
│  (Node/Python)   │
└──────┬───────────┘
       │ HTTP GET (widget templates)
       ↓
┌──────────────────┐
│  Asset Server    │  http://localhost:4444
│  (Static Files)  │
└──────────────────┘
```

## Common Commands Reference

```bash
# Build widgets
pnpm run build

# Serve assets
pnpm run serve

# Start Node server
cd pizzaz_server_node && pnpm start

# Start Python server
cd pizzaz_server_python && python main.py

# Expose server
ngrok http 8000

# Development mode (with HMR)
pnpm run dev

# Type check
pnpm run tsc

# Format code
pre-commit run --all-files
```

## Resources

- **Repository**: https://github.com/openai/openai-apps-sdk-examples
- **MCP Docs**: https://modelcontextprotocol.io
- **ngrok**: https://ngrok.com/download
- **OpenAI Apps**: https://platform.openai.com/docs/apps

---

**Need Help?**

Check the main [README.md](./README.md) for detailed documentation, or review the [examples/](./examples/) directory for sample code.
