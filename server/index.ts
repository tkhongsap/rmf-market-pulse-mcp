/**
 * Standalone MCP Server for Thai RMF Market Pulse
 *
 * This is a lightweight MCP (Model Context Protocol) server that provides
 * real-time Thai Retirement Mutual Fund (RMF) data via 6 tools:
 *
 * Tools:
 * - get_rmf_funds: List funds with pagination and sorting
 * - search_rmf_funds: Search/filter funds by multiple criteria
 * - get_rmf_fund_detail: Get detailed fund information
 * - get_rmf_fund_performance: Top performers by period
 * - get_rmf_fund_nav_history: NAV history over time
 * - compare_rmf_funds: Compare 2-5 funds side-by-side
 *
 * Data: 403 RMF funds with comprehensive market data
 * Protocol: Model Context Protocol (MCP) via HTTP POST
 * Endpoint: POST /mcp
 */

import express from 'express';
import { createServer } from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { rmfMCPServer } from './mcp';
import { rmfDataService } from './services/rmfDataService';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging for MCP endpoint
app.use((req, res, next) => {
  if (req.path === '/mcp') {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
  }
  next();
});

/**
 * Health check endpoint
 * Returns server status and fund data statistics
 */
app.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    server: 'Thai RMF Market Pulse MCP Server',
    version: '1.0.0',
    protocol: 'Model Context Protocol (MCP)',
    fundsLoaded: rmfDataService.getTotalCount(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * MCP Protocol endpoint (POST only)
 * Handles all MCP tool calls according to the Model Context Protocol
 */
app.post('/mcp', async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      transport.close();
    });

    await rmfMCPServer.getServer().connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('MCP endpoint error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error',
        },
        id: null,
      });
    }
  }
});

/**
 * Root endpoint - Server information
 */
app.get('/', (_req, res) => {
  res.json({
    name: 'Thai RMF Market Pulse MCP Server',
    version: '1.0.0',
    description: 'MCP server providing Thai Retirement Mutual Fund (RMF) market data',
    protocol: 'Model Context Protocol (MCP)',
    endpoint: {
      mcp: 'POST /mcp',
      health: 'GET /healthz',
    },
    tools: [
      'get_rmf_funds',
      'search_rmf_funds',
      'get_rmf_fund_detail',
      'get_rmf_fund_performance',
      'get_rmf_fund_nav_history',
      'compare_rmf_funds',
    ],
    dataSource: {
      funds: rmfDataService.getTotalCount(),
      lastUpdated: new Date().toISOString(),
    },
    documentation: 'https://github.com/tkhongsap/rmf-market-pulse-mcp',
  });
});

/**
 * 404 handler
 */
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'This is an MCP server. Please use POST /mcp for tool calls.',
    availableEndpoints: {
      mcp: 'POST /mcp',
      health: 'GET /healthz',
      info: 'GET /',
    },
  });
});

/**
 * Error handler
 */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Server error:', err);
  res.status(status).json({ error: message });
});

/**
 * Initialize and start server
 */
async function startServer() {
  console.log('🚀 Thai RMF Market Pulse MCP Server');
  console.log('=' .repeat(60));

  // Initialize data service
  console.log('📦 Loading RMF fund data...');
  await rmfDataService.initialize();
  console.log(`✓ Loaded ${rmfDataService.getTotalCount()} RMF funds`);

  // Create HTTP server
  const httpServer = createServer(app);

  // Get port from environment or default to 5000
  const port = parseInt(process.env.PORT || '5000', 10);

  // Start listening
  httpServer.listen({
    port,
    host: '0.0.0.0',
    reusePort: true,
  }, () => {
    console.log('=' .repeat(60));
    console.log(`✓ MCP Server listening on port ${port}`);
    console.log(`  Endpoint: POST http://0.0.0.0:${port}/mcp`);
    console.log(`  Health: GET http://0.0.0.0:${port}/healthz`);
    console.log('=' .repeat(60));
    console.log('Available MCP Tools:');
    console.log('  1. get_rmf_funds - List funds with pagination');
    console.log('  2. search_rmf_funds - Search/filter funds');
    console.log('  3. get_rmf_fund_detail - Get fund details');
    console.log('  4. get_rmf_fund_performance - Top performers');
    console.log('  5. get_rmf_fund_nav_history - NAV history');
    console.log('  6. compare_rmf_funds - Compare funds');
    console.log('=' .repeat(60));
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down server...');
    httpServer.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start the server
startServer().catch(error => {
  console.error('❌ Fatal error starting server:', error);
  process.exit(1);
});
