/**
 * Example MCP Server Implementation (Node.js + TypeScript)
 * Based on openai/openai-apps-sdk-examples
 *
 * This example demonstrates:
 * - Setting up an MCP server with SSE transport
 * - Registering tools with widget support
 * - Handling tool invocations
 * - Serving widget resources
 * - Session management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

interface Widget {
  id: string;
  title: string;
  description: string;
  templateUri: string;
  invocationStates: {
    approvalHint?: string;
    inProgressHint?: string;
    successHint?: string;
  };
  html: string;
  responseText: string;
}

interface Session {
  server: Server;
  transport: SSEServerTransport;
}

// ============================================================================
// Configuration
// ============================================================================

const PORT = process.env.PORT || 8000;
const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL || 'http://localhost:4444/assets';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || '*';

// ============================================================================
// Widget Definitions
// ============================================================================

const widgets: Widget[] = [
  {
    id: 'rmf-fund-detail',
    title: 'RMF Fund Detail',
    description: 'Display detailed information about an RMF fund',
    templateUri: `${WIDGET_BASE_URL}/rmf-fund-detail.html`,
    invocationStates: {
      approvalHint: 'About to show RMF fund details',
      inProgressHint: 'Loading fund information...',
      successHint: 'Fund details displayed successfully'
    },
    html: loadWidgetHTML('rmf-fund-detail.html'),
    responseText: 'Here are the fund details'
  },
  {
    id: 'rmf-fund-comparison',
    title: 'RMF Fund Comparison',
    description: 'Compare multiple RMF funds side-by-side',
    templateUri: `${WIDGET_BASE_URL}/rmf-fund-comparison.html`,
    invocationStates: {
      approvalHint: 'About to compare RMF funds',
      inProgressHint: 'Loading comparison data...',
      successHint: 'Comparison displayed successfully'
    },
    html: loadWidgetHTML('rmf-fund-comparison.html'),
    responseText: 'Here is the fund comparison'
  },
  {
    id: 'rmf-performance-chart',
    title: 'RMF Performance Chart',
    description: 'Display fund performance over time',
    templateUri: `${WIDGET_BASE_URL}/rmf-performance-chart.html`,
    invocationStates: {
      approvalHint: 'About to show performance chart',
      inProgressHint: 'Loading chart data...',
      successHint: 'Chart displayed successfully'
    },
    html: loadWidgetHTML('rmf-performance-chart.html'),
    responseText: 'Here is the performance chart'
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

function loadWidgetHTML(filename: string): string {
  try {
    // In production, load from assets directory
    return readFileSync(join(__dirname, '../assets', filename), 'utf8');
  } catch (error) {
    // Fallback: return minimal HTML template
    console.warn(`Could not load widget HTML: ${filename}`, error);
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Widget implementation would be loaded here
    document.getElementById('root').innerHTML = '<div class="p-4">Widget: ${filename}</div>';
  </script>
</body>
</html>
    `.trim();
  }
}

// ============================================================================
// MCP Server Setup
// ============================================================================

function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'rmf-market-pulse-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {},
        resources: {}
      }
    }
  );

  // -------------------------------------------------------------------------
  // Tools Handler
  // -------------------------------------------------------------------------

  server.setRequestHandler('tools/list', async () => {
    return {
      tools: widgets.map(widget => ({
        name: widget.id,
        description: widget.description,
        inputSchema: {
          type: 'object' as const,
          properties: {
            data: {
              type: 'object' as const,
              description: 'Widget data payload',
              additionalProperties: true
            }
          },
          required: ['data']
        },
        // OpenAI-specific annotations for widget rendering
        annotations: {
          'openai/outputTemplate': {
            templateUri: widget.templateUri
          },
          'openai/invocationStates': widget.invocationStates
        }
      }))
    };
  });

  // -------------------------------------------------------------------------
  // Tool Call Handler
  // -------------------------------------------------------------------------

  server.setRequestHandler('tools/call', async (request) => {
    const toolName = request.params.name;
    const widget = widgets.find(w => w.id === toolName);

    if (!widget) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Validate input schema
    const InputSchema = z.object({
      data: z.record(z.unknown())
    });

    const validatedInput = InputSchema.parse(request.params.arguments);

    console.log(`Tool called: ${toolName}`, validatedInput);

    // In a real implementation, you would:
    // 1. Fetch data from your database/API
    // 2. Process the data according to the widget's needs
    // 3. Return structured content with the widget metadata

    return {
      content: [
        {
          type: 'text' as const,
          text: widget.responseText
        }
      ],
      // Pass through the data to the widget
      structuredContent: validatedInput.data,
      // Widget metadata for ChatGPT
      _meta: {
        'openai/outputTemplate': {
          templateUri: widget.templateUri
        },
        'openai/invocationStates': widget.invocationStates
      }
    };
  });

  // -------------------------------------------------------------------------
  // Resources Handler (List)
  // -------------------------------------------------------------------------

  server.setRequestHandler('resources/list', async () => {
    return {
      resources: widgets.map(widget => ({
        uri: widget.templateUri,
        mimeType: 'text/html+skybridge',
        name: widget.title,
        description: widget.description
      }))
    };
  });

  // -------------------------------------------------------------------------
  // Resources Handler (Read)
  // -------------------------------------------------------------------------

  server.setRequestHandler('resources/read', async (request) => {
    const uri = request.params.uri;
    const widget = widgets.find(w => w.templateUri === uri);

    if (!widget) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    return {
      contents: [
        {
          uri: uri,
          mimeType: 'text/html+skybridge',
          text: widget.html
        }
      ]
    };
  });

  // -------------------------------------------------------------------------
  // Error Handler
  // -------------------------------------------------------------------------

  server.onerror = (error) => {
    console.error('MCP Server Error:', error);
  };

  return server;
}

// ============================================================================
// Express Server Setup
// ============================================================================

const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Session storage
const sessions = new Map<string, Session>();

// -------------------------------------------------------------------------
// Health Check
// -------------------------------------------------------------------------

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    sessions: sessions.size
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'RMF Market Pulse MCP Server',
    version: '1.0.0',
    mcp_endpoint: '/mcp',
    health_endpoint: '/health'
  });
});

// -------------------------------------------------------------------------
// MCP SSE Endpoint
// -------------------------------------------------------------------------

app.get('/mcp', async (req: Request, res: Response) => {
  const sessionId = Math.random().toString(36).substring(7);

  console.log(`New MCP session: ${sessionId}`);

  // Create SSE transport
  const transport = new SSEServerTransport('/mcp/messages', res);

  // Create MCP server instance
  const server = createMCPServer();

  // Store session
  sessions.set(sessionId, { server, transport });

  // Handle transport close
  transport.on('close', () => {
    console.log(`Session closed: ${sessionId}`);
    sessions.delete(sessionId);
  });

  // Start SSE connection
  try {
    await transport.start();
  } catch (error) {
    console.error(`Error starting transport for session ${sessionId}:`, error);
    sessions.delete(sessionId);
  }
});

// -------------------------------------------------------------------------
// MCP Message Endpoint
// -------------------------------------------------------------------------

app.post('/mcp/messages', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId parameter' });
  }

  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error(`Error handling message for session ${sessionId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------------------
// OPTIONS for CORS preflight
// -------------------------------------------------------------------------

app.options('/mcp', cors());
app.options('/mcp/messages', cors());

// ============================================================================
// Server Start
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  RMF Market Pulse MCP Server                                   ║
╠════════════════════════════════════════════════════════════════╣
║  Status: Running                                               ║
║  Port: ${PORT}                                                 ║
║  MCP Endpoint: http://127.0.0.1:${PORT}/mcp                    ║
║  Health Check: http://127.0.0.1:${PORT}/health                 ║
║  Widget Base URL: ${WIDGET_BASE_URL}                           ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  sessions.forEach((session, sessionId) => {
    console.log(`Closing session: ${sessionId}`);
    session.transport.close();
  });
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  sessions.forEach((session, sessionId) => {
    console.log(`Closing session: ${sessionId}`);
    session.transport.close();
  });
  process.exit(0);
});
