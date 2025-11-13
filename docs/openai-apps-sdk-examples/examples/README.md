# OpenAI Apps SDK - Example Code

This directory contains complete, working example implementations of MCP servers for the OpenAI Apps SDK.

## Available Examples

### Node.js/TypeScript Implementation

**File:** `pizzaz-server-node.ts`

A complete MCP server implementation using:
- **@modelcontextprotocol/sdk**: Official TypeScript MCP SDK
- **Express**: HTTP server framework
- **SSE (Server-Sent Events)**: Real-time transport layer
- **Zod**: Runtime schema validation

**Features:**
- 5 pizza-themed widget tools
- Resource handlers for widget HTML delivery
- Session management for multiple clients
- Type-safe parameter validation
- Graceful shutdown handling

**Usage:**
```bash
# Install dependencies
pnpm install

# Run directly with tsx
tsx pizzaz-server-node.ts

# Or use the npm script
pnpm start
```

### Python Implementation

**File:** `pizzaz-server-python.py`

A complete MCP server implementation using:
- **FastMCP**: MCP SDK with FastAPI integration
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

**Features:**
- 5 pizza-themed widget tools with decorators
- Resource endpoints for widget templates
- CORS middleware for cross-origin requests
- Type-safe input models
- Environment-based configuration

**Usage:**
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python pizzaz-server-python.py
```

## Configuration Files

### package.json

Node.js project configuration with:
- Dependencies for MCP server
- Scripts for running and building
- TypeScript configuration
- Engine requirements

### requirements.txt

Python dependencies:
- `fastapi>=0.115.0` - Web framework
- `mcp[fastapi]>=0.1.0` - MCP SDK with FastAPI support
- `uvicorn>=0.30.0` - ASGI server

### tsconfig.json

TypeScript compiler configuration:
- ES2022 target
- Strict type checking
- ESM module system
- Source maps enabled

### .env.example

Environment variable template:
- Server configuration (PORT, HOST)
- Widget base URL
- CORS settings
- API keys placeholder
- Production examples

## Key Concepts Demonstrated

### 1. Widget Definition

Both examples define widgets with this structure:

```typescript
{
  id: 'widget-name',              // Unique identifier
  title: 'Widget Title',          // Human-readable name
  templateUri: 'http://...',      // URL to widget HTML
  responseText: 'Success message' // Tool response text
}
```

### 2. Tool Registration

**Node.js:**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: widgets.map(w => ({
    name: w.id,
    description: w.title,
    inputSchema: { /* JSON Schema */ }
  }))
}));
```

**Python:**
```python
@mcp.tool()
def widget_name(input: InputModel):
    """Tool description"""
    return create_tool_response(widget, input.param)
```

### 3. Tool Response Format

All tools return:
```json
{
  "content": [
    { "type": "text", "text": "Human message" },
    { "type": "text", "text": "{\"data\": \"json\"}" }
  ],
  "_meta": {
    "openai/outputTemplate": "https://widgets.com/widget.html",
    "openai/resultCanProduceWidget": true
  }
}
```

### 4. Input Validation

**Node.js (Zod):**
```typescript
const InputSchema = z.object({
  param: z.string().describe('Parameter description')
});
```

**Python (Pydantic):**
```python
class InputModel(BaseModel):
    param: str = Field(..., description='Parameter description')
```

### 5. Transport Layer

**Node.js:**
- Uses `SSEServerTransport` from MCP SDK
- Handles multiple concurrent sessions
- Integrates with Express app

**Python:**
- Uses FastMCP's built-in transport
- Returns ASGI app for Uvicorn
- Automatic session management

## Adapting for Your Use Case

### 1. Replace Widget Definitions

Update the `widgets` array with your own:

```typescript
const widgets = [
  {
    id: 'data-chart',
    title: 'Data Visualization Chart',
    templateUri: `${WIDGET_BASE_URL}/chart.html`,
    responseText: 'Chart generated successfully',
  },
  // Add more...
];
```

### 2. Add Real Data Sources

Replace hardcoded responses with API calls:

```typescript
// Node.js
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { arguments: args } = request.params;

  // Fetch real data
  const data = await fetchDataFromAPI(args.param);

  return {
    content: [
      { type: 'text', text: `Fetched ${data.length} items` },
      { type: 'text', text: JSON.stringify(data) }
    ],
    _meta: { /* ... */ }
  };
});
```

### 3. Add Authentication

**Node.js:**
```typescript
app.use((req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!validateToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

**Python:**
```python
from fastapi import Header, HTTPException

async def verify_token(authorization: str = Header(None)):
    if not authorization or not validate_token(authorization):
        raise HTTPException(status_code=401, detail='Unauthorized')
```

### 4. Add Database Integration

**Node.js:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const data = await pool.query('SELECT * FROM items WHERE category = $1', [category]);
```

**Python:**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(os.getenv('DATABASE_URL'))
Session = sessionmaker(bind=engine)

with Session() as session:
    items = session.query(Item).filter_by(category=category).all()
```

### 5. Add Error Handling

**Node.js:**
```typescript
try {
  const result = await processRequest(args);
  return successResponse(result);
} catch (error) {
  console.error('Tool failed:', error);
  return errorResponse('Failed to process request');
}
```

**Python:**
```python
import logging

logger = logging.getLogger(__name__)

try:
    result = process_request(input)
    return success_response(result)
except Exception as e:
    logger.error(f"Tool failed: {str(e)}", exc_info=True)
    raise HTTPException(status_code=500, detail="Failed to process request")
```

## Testing Your Server

### Local Testing

**Test server health:**
```bash
curl http://localhost:8000/
```

**Test tool invocation (Node.js):**
```bash
curl -X POST http://localhost:8000/mcp/messages \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "pizza-map",
      "arguments": { "pizzaTopping": "pepperoni" }
    }
  }'
```

### MCP Inspector (Node.js only)

Debug tools interactively:
```bash
npx @modelcontextprotocol/inspector tsx pizzaz-server-node.ts
```

Opens web UI at `http://localhost:5173`

### Integration Testing

Use the examples with the widget server:

```bash
# Terminal 1: Build and serve widgets
pnpm run build
pnpm run serve

# Terminal 2: Start MCP server
tsx pizzaz-server-node.ts

# Terminal 3: Expose with ngrok
ngrok http 8000
```

Then test in ChatGPT!

## Deployment

See the [Deployment Guide](../DEPLOYMENT_GUIDE.md) for:
- Production deployment options
- CDN configuration for widgets
- Security best practices
- Scaling strategies

## Next Steps

1. **Customize**: Adapt these examples to your use case
2. **Build Widgets**: Create custom React widgets in `src/`
3. **Add Features**: Authentication, databases, real APIs
4. **Deploy**: Push to production (Lambda, Cloud Run, etc.)
5. **Monitor**: Add logging and analytics

## Resources

- **Deployment Guide**: [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
- **Quick Start**: [../QUICK_START.md](../QUICK_START.md)
- **MCP SDK Docs**: https://modelcontextprotocol.io
- **FastMCP**: https://github.com/jlowin/fastmcp

## License

These examples are based on the [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) repository (MIT License).
