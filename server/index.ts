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
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { rmfMCPServer } from './mcp';
import { rmfDataService } from './services/rmfDataService';

const app = express();

// Security: Helmet middleware for secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for MCP protocol compatibility
  crossOriginEmbedderPolicy: false,
}));

// Security: CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

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
 * Health check endpoint - Beautiful HTML status dashboard
 */
const healthHandler = (_req: express.Request, res: express.Response) => {
  const totalFunds = rmfDataService.getTotalCount();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);
  const uptimeSeconds = Math.floor(uptime % 60);
  
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="30">
  <title>Health Status - Thai RMF Market Pulse</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      min-height: 100vh;
      color: #1a202c;
      padding: 20px;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
      animation: fadeInDown 0.8s ease;
    }
    .header h1 {
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 12px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.2);
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 18px;
      font-weight: 700;
      margin-top: 16px;
      backdrop-filter: blur(10px);
    }
    .status-dot {
      width: 12px;
      height: 12px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: white;
      padding: 28px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      animation: fadeInUp 0.8s ease;
      position: relative;
      overflow: hidden;
    }
    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
    }
    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }
    .metric-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    .metric-value {
      font-size: 36px;
      font-weight: 800;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    .metric-label {
      font-size: 14px;
      color: #718096;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-card {
      background: white;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 24px;
      animation: fadeInUp 0.8s ease 0.2s both;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label {
      color: #4b5563;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-value {
      color: #1f2937;
      font-weight: 700;
      font-family: 'Monaco', monospace;
      font-size: 14px;
    }
    .success { color: #10b981; }
    .footer {
      text-align: center;
      color: white;
      margin-top: 40px;
      opacity: 0.9;
      font-size: 14px;
    }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .auto-refresh {
      background: rgba(255,255,255,0.15);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      margin-top: 12px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Server Health Status</h1>
      <div class="status-badge">
        <span class="status-dot"></span>
        All Systems Operational
      </div>
      <div class="auto-refresh">🔄 Auto-refresh every 30 seconds</div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">✅</div>
        <div class="metric-value">100%</div>
        <div class="metric-label">Healthy</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">📊</div>
        <div class="metric-value">${totalFunds}</div>
        <div class="metric-label">RMF Funds</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">🚀</div>
        <div class="metric-value">${uptimeHours}h ${uptimeMinutes}m</div>
        <div class="metric-label">Uptime</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">💾</div>
        <div class="metric-value">${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB</div>
        <div class="metric-label">Memory Used</div>
      </div>
    </div>

    <div class="info-card">
      <h2 style="margin-bottom: 24px; color: #1f2937; font-size: 24px;">📋 System Information</h2>
      
      <div class="info-row">
        <span class="info-label">🟢 Status</span>
        <span class="info-value success">OPERATIONAL</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">🏷️ Server Name</span>
        <span class="info-value">Thai RMF Market Pulse MCP Server</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">📦 Version</span>
        <span class="info-value">v1.0.0</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">🔌 Protocol</span>
        <span class="info-value">Model Context Protocol (MCP)</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">🛠️ MCP Tools</span>
        <span class="info-value">6 tools available</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">💿 Data Loaded</span>
        <span class="info-value">${totalFunds} RMF Funds</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">⏱️ Uptime</span>
        <span class="info-value">${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">🧠 Heap Memory</span>
        <span class="info-value">${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">🕐 Timestamp</span>
        <span class="info-value">${new Date().toISOString()}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">🌍 Node.js Version</span>
        <span class="info-value">${process.version}</span>
      </div>
    </div>

    <div class="info-card">
      <h2 style="margin-bottom: 20px; color: #1f2937; font-size: 24px;">🔗 Quick Links</h2>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="/mcp" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s;">
          📡 MCP Endpoint
        </a>
        <a href="/" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s;">
          ℹ️ Server Info
        </a>
        <a href="https://github.com/tkhongsap/rmf-market-pulse-mcp" target="_blank" style="display: inline-block; padding: 12px 24px; background: #1f2937; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s;">
          📚 Documentation
        </a>
      </div>
    </div>

    <div class="footer">
      <p>Thai RMF Market Pulse MCP Server | Monitoring Dashboard</p>
      <p style="margin-top: 8px; font-size: 12px;">Page auto-refreshes every 30 seconds for real-time status</p>
    </div>
  </div>
</body>
</html>`);
};

app.get('/healthz', healthHandler);
app.get('/health', healthHandler);

/**
 * Security: Rate limiting for MCP endpoint
 * Prevents DoS attacks by limiting requests per IP
 */
const mcpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Too many requests. Please try again later.',
    },
    id: null,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health checks from monitoring systems
  skip: (req) => req.path === '/healthz',
});

/**
 * MCP Protocol endpoint - GET: Landing page with documentation
 */
app.get('/mcp', (_req, res) => {
  const totalFunds = rmfDataService.getTotalCount();
  
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thai RMF Market Pulse - MCP Server</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #1a202c;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 60px;
      animation: fadeInDown 0.8s ease;
    }
    .header h1 {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 16px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header .subtitle {
      font-size: 20px;
      opacity: 0.9;
      font-weight: 300;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 20px;
      backdrop-filter: blur(10px);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: white;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      animation: fadeInUp 0.8s ease;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }
    .stat-number {
      font-size: 48px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    .stat-label {
      font-size: 16px;
      color: #718096;
      font-weight: 600;
    }
    .content-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 32px;
      animation: fadeInUp 0.8s ease 0.2s both;
    }
    h2 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #2d3748;
    }
    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 24px 0 16px 0;
      color: #4a5568;
    }
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }
    .tool-item {
      padding: 20px;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 12px;
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
    }
    .tool-item:hover {
      border-left-color: #764ba2;
      transform: translateX(5px);
    }
    .tool-name {
      font-weight: 700;
      color: #2d3748;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .tool-desc {
      color: #718096;
      font-size: 14px;
      line-height: 1.6;
    }
    .code-block {
      background: #1a202c;
      color: #e2e8f0;
      padding: 24px;
      border-radius: 12px;
      overflow-x: auto;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.8;
      margin: 16px 0;
      position: relative;
    }
    .code-block::before {
      content: attr(data-lang);
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 11px;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .endpoint-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      margin-right: 8px;
    }
    .post-badge { background: #48bb78; color: white; }
    .get-badge { background: #4299e1; color: white; }
    .footer {
      text-align: center;
      color: white;
      margin-top: 60px;
      padding: 20px;
      opacity: 0.9;
    }
    .footer a {
      color: white;
      text-decoration: underline;
      font-weight: 600;
    }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .highlight { color: #667eea; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🇹🇭 Thai RMF Market Pulse</h1>
      <p class="subtitle">Model Context Protocol Server for Thai Retirement Mutual Funds</p>
      <div class="badge">✨ MCP Protocol v1.0 | ${totalFunds} RMF Funds Loaded</div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${totalFunds}</div>
        <div class="stat-label">RMF Funds</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">6</div>
        <div class="stat-label">MCP Tools</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">100%</div>
        <div class="stat-label">Real-Time Data</div>
      </div>
    </div>

    <div class="content-card">
      <h2>📡 MCP Endpoint</h2>
      <p style="color: #718096; margin-bottom: 24px; font-size: 16px; line-height: 1.8;">
        This server implements the <span class="highlight">Model Context Protocol (MCP)</span> for querying Thai Retirement Mutual Fund (RMF) data. 
        Send JSON-RPC 2.0 requests to interact with ${totalFunds} funds and access comprehensive market analytics.
      </p>
      
      <h3><span class="post-badge">POST</span> /mcp</h3>
      <div class="code-block" data-lang="bash">curl -X POST https://rmf-market-pulse-mcp-tkhongsap.replit.app/mcp \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_rmf_fund_performance",
      "arguments": {"period": "ytd", "limit": 5}
    }
  }'</div>
    </div>

    <div class="content-card">
      <h2>🛠️ Available MCP Tools</h2>
      <p style="color: #718096; margin-bottom: 24px; font-size: 16px;">
        Query the server using these 6 powerful tools via the MCP protocol:
      </p>
      
      <div class="tools-grid">
        <div class="tool-item">
          <div class="tool-name">📋 get_rmf_funds</div>
          <div class="tool-desc">List all RMF funds with pagination and flexible sorting options</div>
        </div>
        
        <div class="tool-item">
          <div class="tool-name">🔍 search_rmf_funds</div>
          <div class="tool-desc">Search and filter funds by name, AMC, risk level, category, and performance</div>
        </div>
        
        <div class="tool-item">
          <div class="tool-name">📊 get_rmf_fund_detail</div>
          <div class="tool-desc">Get comprehensive details for a specific fund including NAV, fees, and holdings</div>
        </div>
        
        <div class="tool-item">
          <div class="tool-name">🏆 get_rmf_fund_performance</div>
          <div class="tool-desc">Top performing funds by period (YTD, 3M, 1Y, 3Y, 5Y, 10Y) with benchmarks</div>
        </div>
        
        <div class="tool-item">
          <div class="tool-name">📈 get_rmf_fund_nav_history</div>
          <div class="tool-desc">Historical NAV data with volatility analysis and trend indicators</div>
        </div>
        
        <div class="tool-item">
          <div class="tool-name">⚖️ compare_rmf_funds</div>
          <div class="tool-desc">Side-by-side comparison of 2-5 funds across performance, risk, and fees</div>
        </div>
      </div>
    </div>

    <div class="content-card">
      <h2>📚 Quick Start Examples</h2>
      
      <h3>1️⃣ List all available tools</h3>
      <div class="code-block" data-lang="json">{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}</div>

      <h3>2️⃣ Find gold-related RMF funds</h3>
      <div class="code-block" data-lang="json">{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_rmf_funds",
    "arguments": {
      "search": "gold",
      "limit": 5
    }
  },
  "id": 2
}</div>

      <h3>3️⃣ Get low-risk funds with best YTD returns</h3>
      <div class="code-block" data-lang="json">{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_rmf_funds",
    "arguments": {
      "minRiskLevel": 1,
      "maxRiskLevel": 3,
      "sortBy": "ytd",
      "limit": 10
    }
  },
  "id": 3
}</div>
    </div>

    <div class="content-card">
      <h2>🔗 Additional Endpoints</h2>
      <p style="margin-bottom: 16px;"><span class="get-badge">GET</span> <code style="background: #edf2f7; padding: 4px 8px; border-radius: 4px;">/</code> - Server information and health status</p>
      <p><span class="get-badge">GET</span> <code style="background: #edf2f7; padding: 4px 8px; border-radius: 4px;">/healthz</code> - Health check endpoint for monitoring</p>
    </div>

    <div class="footer">
      <p>
        Built with ❤️ for Thai investors | 
        <a href="https://github.com/tkhongsap/rmf-market-pulse-mcp" target="_blank">View on GitHub</a> | 
        Powered by Model Context Protocol
      </p>
    </div>
  </div>
</body>
</html>`);
});

/**
 * MCP Protocol endpoint - POST: Handle MCP tool calls
 * Handles all MCP tool calls according to the Model Context Protocol
 */
app.post('/mcp', mcpLimiter, async (req, res) => {
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
    // Log full error details internally for debugging
    console.error('MCP endpoint error:', error);

    // Return generic error message to client (no stack traces or internal details)
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'An error occurred while processing your request',
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

    // Set 10-second timeout to force exit
    const forceExitTimeout = setTimeout(() => {
      console.log('⚠️  Force closing server after timeout');
      process.exit(1);
    }, 10000);

    httpServer.close(() => {
      clearTimeout(forceExitTimeout);
      console.log('✓ Server closed gracefully');
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
