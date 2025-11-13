# Integration Guide: Adding OpenAI Apps SDK to RMF Market Pulse MCP

This guide explains how to integrate the OpenAI Apps SDK widget support into the existing RMF Market Pulse MCP server.

## Overview

The RMF Market Pulse MCP server currently provides 6 tools for Thai RMF fund data. We can enhance the user experience by adding interactive widgets that display fund information visually in ChatGPT.

## Current Architecture

```
RMF Market Pulse MCP Server (server/index.ts)
├── Express HTTP server (port 5000)
├── MCP endpoint: POST /mcp
├── 6 MCP tools (server/mcp.ts)
│   ├── get_rmf_funds
│   ├── search_rmf_funds
│   ├── get_rmf_fund_detail
│   ├── get_rmf_fund_performance
│   ├── get_rmf_fund_nav_history
│   └── compare_rmf_funds
└── Data service (server/services/rmfDataService.ts)
    └── Loads from docs/rmf-funds-consolidated.csv
```

## Target Architecture with Widgets

```
RMF Market Pulse MCP Server
├── Express HTTP server (port 5000)
├── MCP endpoint: POST /mcp (with SSE support)
├── 6 MCP tools with widget support
│   ├── get_rmf_fund_detail → Widget: Fund Detail Card
│   ├── compare_rmf_funds → Widget: Comparison Table
│   ├── get_rmf_fund_nav_history → Widget: NAV Chart
│   ├── get_rmf_fund_performance → Widget: Performance Table
│   └── ... (other tools remain text-based)
├── Widget asset server (port 4444)
│   └── Serves built HTML/JS/CSS bundles
└── Data service (unchanged)
```

## Implementation Steps

### Step 1: Add Dependencies

```bash
# In project root
npm install --save @modelcontextprotocol/sdk zod

# For widget development
npm install --save-dev vite @vitejs/plugin-react typescript
npm install --save react react-dom

# For serving assets
npm install --save-dev serve
```

Update `package.json`:

```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "npm run build:widgets && npm run build:server",
    "build:widgets": "tsx scripts/build-widgets.ts",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --format=esm --external:@modelcontextprotocol/sdk",
    "serve:assets": "serve -s ./assets -p 4444 --cors",
    "start": "npm run serve:assets & node dist/index.js"
  }
}
```

### Step 2: Create Widget Components

Create `widgets/` directory structure:

```
widgets/
├── src/
│   ├── fund-detail/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── FundDetailCard.tsx
│   ├── fund-comparison/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── ComparisonTable.tsx
│   ├── nav-history/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── NavChart.tsx
│   └── performance/
│       ├── index.html
│       ├── main.tsx
│       └── PerformanceTable.tsx
├── build-widgets.ts
└── vite.config.ts
```

### Step 3: Update MCP Server for SSE

Modify `server/mcp.ts` to use SSE transport:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

export class RMFMCPServer {
  private sessions = new Map<string, {
    server: Server;
    transport: SSEServerTransport;
  }>();

  // Add SSE endpoint handler
  async handleSSEConnection(res: Response) {
    const sessionId = crypto.randomUUID();
    const transport = new SSEServerTransport('/mcp/messages', res);
    const server = this.createServer();

    this.sessions.set(sessionId, { server, transport });

    transport.on('close', () => {
      this.sessions.delete(sessionId);
    });

    await transport.start();
  }

  // Update existing createServer to return Server instance
  private createServer(): Server {
    const server = new Server(
      { name: 'rmf-market-pulse-mcp', version: '1.0.0' },
      { capabilities: { tools: {}, resources: {} } }
    );

    // Register all tools with widget support
    this.registerTools(server);
    this.registerResources(server);

    return server;
  }

  // Add widget metadata to tool responses
  private registerTools(server: Server) {
    server.setRequestHandler('tools/call', async (request) => {
      if (request.params.name === 'get_rmf_fund_detail') {
        const result = await this.handleGetRMFFundDetail(request.params.arguments);

        return {
          content: [{ type: 'text', text: result.summary }],
          structuredContent: result.data,
          _meta: {
            'openai/outputTemplate': {
              templateUri: 'http://localhost:4444/assets/fund-detail.html'
            },
            'openai/invocationStates': {
              approvalHint: 'About to display fund details',
              inProgressHint: 'Loading fund data...',
              successHint: 'Fund details loaded'
            }
          }
        };
      }
      // ... other tools
    });
  }
}
```

### Step 4: Update Express Server

Modify `server/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { RMFMCPServer } from './mcp.js';

const app = express();
const mcpServer = new RMFMCPServer();

app.use(cors());
app.use(express.json());

// SSE endpoint
app.get('/mcp', (req, res) => {
  mcpServer.handleSSEConnection(res);
});

// Message endpoint
app.post('/mcp/messages', (req, res) => {
  mcpServer.handleMessage(req, res);
});

// Existing HTTP POST endpoint (keep for backwards compatibility)
app.post('/mcp', (req, res) => {
  // ... existing handler
});

app.listen(5000, () => {
  console.log('MCP server running on port 5000');
});
```

### Step 5: Build and Serve Assets

Create `scripts/build-widgets.ts`:

```typescript
import { build } from 'vite';
import { resolve } from 'path';

const widgets = [
  'fund-detail',
  'fund-comparison',
  'nav-history',
  'performance'
];

async function buildAll() {
  for (const widget of widgets) {
    await build({
      root: 'widgets',
      build: {
        outDir: '../assets',
        rollupOptions: {
          input: {
            [widget]: resolve('widgets/src', widget, 'index.html')
          }
        }
      }
    });
  }
}

buildAll();
```

### Step 6: Widget Implementation Example

`widgets/src/fund-detail/FundDetailCard.tsx`:

```typescript
import { RMFFundCSV } from '../../../shared/schema';

interface Props {
  fund: RMFFundCSV;
}

export function FundDetailCard({ fund }: Props) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-4">{fund.proj_name_th}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-gray-600">Symbol:</span>
          <span className="font-semibold ml-2">{fund.symbol}</span>
        </div>
        <div>
          <span className="text-gray-600">NAV:</span>
          <span className="font-semibold ml-2">{fund.latest_nav}</span>
        </div>
        <div>
          <span className="text-gray-600">Risk Level:</span>
          <span className="font-semibold ml-2">{fund.risk_spectrum}</span>
        </div>
        <div>
          <span className="text-gray-600">YTD Return:</span>
          <span className={`font-semibold ml-2 ${
            parseFloat(fund.return_ytd || '0') >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {fund.return_ytd}%
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Testing

```bash
# Terminal 1: Build widgets
npm run build:widgets

# Terminal 2: Serve assets
npm run serve:assets

# Terminal 3: Start MCP server
npm run dev

# Terminal 4: Expose with ngrok
ngrok http 5000
```

Test in ChatGPT:
- "Show me details for fund KFRMF"
- "Compare KFRMF and SCBRMF"
- "Show NAV history for KFRMF"

### Step 8: Production Deployment

**1. Deploy Widget Assets to Vercel:**

```bash
cd widgets
npm run build
cd ../assets
vercel --prod
# Copy deployment URL: https://your-widgets.vercel.app
```

**2. Update Widget URLs:**

```typescript
// server/config.ts
export const WIDGET_BASE_URL =
  process.env.WIDGET_BASE_URL ||
  'https://your-widgets.vercel.app';
```

**3. Deploy MCP Server:**

```bash
npm run build:server
# Deploy dist/index.js to Railway, Render, etc.
```

**4. Update CORS:**

```typescript
app.use(cors({
  origin: [
    'https://chatgpt.com',
    'https://chat.openai.com'
  ],
  credentials: true
}));
```

## Widget Types for RMF Data

### 1. Fund Detail Card
- **Data**: Single fund (RMFFundCSV)
- **Display**: NAV, performance, risk, fees
- **Tool**: `get_rmf_fund_detail`

### 2. Fund Comparison Table
- **Data**: 2-5 funds (RMFFundCSV[])
- **Display**: Side-by-side comparison
- **Tool**: `compare_rmf_funds`

### 3. NAV History Chart
- **Data**: NAV time series (RMFNavHistory[])
- **Display**: Line chart with date range
- **Tool**: `get_rmf_fund_nav_history`
- **Library**: Chart.js or Recharts

### 4. Performance Table
- **Data**: Top performers (RMFFundCSV[])
- **Display**: Sortable table with returns
- **Tool**: `get_rmf_fund_performance`

### 5. Search Results Grid
- **Data**: Search results (RMFFundCSV[])
- **Display**: Card grid with filters
- **Tool**: `search_rmf_funds`

### 6. Fund List Table
- **Data**: Paginated funds (RMFFundCSV[])
- **Display**: Table with pagination
- **Tool**: `get_rmf_funds`

## Recommended Libraries

- **UI Components**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts or Chart.js
- **Tables**: TanStack Table (React Table)
- **Build**: Vite
- **State**: React hooks (no need for Redux/Zustand)

## Migration Checklist

- [ ] Add MCP SDK dependencies
- [ ] Create widgets directory structure
- [ ] Implement widget components
- [ ] Update MCP server for SSE
- [ ] Add widget metadata to tool responses
- [ ] Create build script for widgets
- [ ] Test locally with ngrok
- [ ] Deploy assets to CDN
- [ ] Deploy MCP server to production
- [ ] Update CORS configuration
- [ ] Test with ChatGPT in production

## Benefits of Widget Integration

1. **Better UX**: Visual fund data vs plain text
2. **Interactivity**: Users can interact with charts/tables
3. **Rich Display**: Colors, formatting, icons
4. **Data Density**: More info in less space
5. **Professional Look**: Polished UI components

## Performance Considerations

- **Bundle Size**: Keep widgets < 500KB each
- **Loading**: Show loading states
- **Caching**: Cache widget HTML on server
- **CDN**: Use CDN for faster asset delivery
- **Lazy Loading**: Load charts/heavy components on demand

## Security

- **CORS**: Restrict to ChatGPT domains
- **CSP**: Content Security Policy for widgets
- **Input Validation**: Sanitize data before rendering
- **Rate Limiting**: Prevent abuse
- **Authentication**: If needed for private data

---

**Next Steps**: Review the [examples/](./examples/) directory for complete implementation samples.
