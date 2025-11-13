/**
 * Pizzaz MCP Server (Node.js/TypeScript)
 *
 * Example MCP server implementation using the official TypeScript SDK.
 * Exposes pizza-themed widgets as tools for ChatGPT integration.
 *
 * Based on: https://github.com/openai/openai-apps-sdk-examples
 * License: MIT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import express from 'express';

// ============================================================================
// Widget Type Definition
// ============================================================================

type PizzazWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  responseText: string;
};

// ============================================================================
// Widget Definitions
// ============================================================================

const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL || 'http://localhost:4444';

const widgets: PizzazWidget[] = [
  {
    id: 'pizza-map',
    title: 'Pizza Map',
    templateUri: `${WIDGET_BASE_URL}/pizzaz.html`,
    invoking: 'Finding pizzerias near you...',
    invoked: 'Here are pizzerias in your area',
    html: '<div>Pizza Map Widget HTML would be loaded here</div>',
    responseText: 'Found nearby pizzerias on the map',
  },
  {
    id: 'pizza-carousel',
    title: 'Pizza Carousel',
    templateUri: `${WIDGET_BASE_URL}/pizzaz-carousel.html`,
    invoking: 'Loading pizza carousel...',
    invoked: 'Here\'s your pizza carousel',
    html: '<div>Pizza Carousel Widget HTML would be loaded here</div>',
    responseText: 'Pizza carousel is ready to browse',
  },
  {
    id: 'pizza-albums',
    title: 'Pizza Albums',
    templateUri: `${WIDGET_BASE_URL}/pizzaz-albums.html`,
    invoking: 'Organizing pizza albums...',
    invoked: 'Here are your pizza albums',
    html: '<div>Pizza Albums Widget HTML would be loaded here</div>',
    responseText: 'Pizza albums organized and displayed',
  },
  {
    id: 'pizza-list',
    title: 'Pizza List',
    templateUri: `${WIDGET_BASE_URL}/pizzaz-list.html`,
    invoking: 'Creating pizza list...',
    invoked: 'Here\'s your pizza list',
    html: '<div>Pizza List Widget HTML would be loaded here</div>',
    responseText: 'Pizza list created successfully',
  },
  {
    id: 'pizza-shop',
    title: 'Pizza Shop',
    templateUri: `${WIDGET_BASE_URL}/pizzaz-shop.html`,
    invoking: 'Opening pizza shop...',
    invoked: 'Welcome to the pizza shop',
    html: '<div>Pizza Shop Widget HTML would be loaded here</div>',
    responseText: 'Pizza shop is now open for orders',
  },
];

// ============================================================================
// Input Schema
// ============================================================================

const PizzaToppingSchema = z.object({
  pizzaTopping: z.string().describe('The pizza topping to use'),
});

type PizzaToppingInput = z.infer<typeof PizzaToppingSchema>;

// ============================================================================
// MCP Server Setup
// ============================================================================

class PizzazMCPServer {
  private server: Server;
  private widgets: PizzazWidget[];

  constructor(widgets: PizzazWidget[]) {
    this.widgets = widgets;
    this.server = new Server(
      {
        name: 'pizzaz-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.widgets.map((widget) => ({
          name: widget.id,
          description: widget.title,
          inputSchema: {
            type: 'object' as const,
            properties: {
              pizzaTopping: {
                type: 'string',
                description: 'The pizza topping you want',
              },
            },
            required: ['pizzaTopping'],
          },
        })),
      };
    });

    // Tool invocation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Validate input
      const validatedInput = PizzaToppingSchema.parse(args);

      // Find the widget
      const widget = this.widgets.find((w) => w.id === name);
      if (!widget) {
        throw new Error(`Unknown tool: ${name}`);
      }

      // Return response with widget metadata
      return {
        content: [
          {
            type: 'text' as const,
            text: widget.responseText,
          },
          {
            type: 'text' as const,
            text: JSON.stringify({
              topping: validatedInput.pizzaTopping,
              widget: widget.id,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
        _meta: {
          'openai/outputTemplate': widget.templateUri,
          'openai/resultCanProduceWidget': true,
        },
      };
    });

    // Resource listing (for widget HTML)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: this.widgets.map((widget) => ({
          uri: `widget://${widget.id}`,
          name: widget.title,
          mimeType: 'text/html',
          description: `HTML template for ${widget.title}`,
        })),
      };
    });

    // Resource reading (deliver widget HTML)
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      const widgetId = uri.replace('widget://', '');

      const widget = this.widgets.find((w) => w.id === widgetId);
      if (!widget) {
        throw new Error(`Unknown resource: ${uri}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'text/html',
            text: widget.html,
          },
        ],
      };
    });
  }

  getServer(): Server {
    return this.server;
  }
}

// ============================================================================
// HTTP Server with SSE Transport
// ============================================================================

async function main() {
  const app = express();
  const port = process.env.PORT || 8000;

  // Create MCP server instance
  const pizzazServer = new PizzazMCPServer(widgets);
  const mcpServer = pizzazServer.getServer();

  // SSE transport setup
  const transport = new SSEServerTransport('/mcp', app);

  // Connect the MCP server to the transport
  await mcpServer.connect(transport);

  // Start HTTP server
  app.listen(port, () => {
    console.log(`Pizzaz MCP Server running on http://localhost:${port}`);
    console.log(`SSE endpoint: http://localhost:${port}/mcp`);
    console.log(`Widget base URL: ${WIDGET_BASE_URL}`);
    console.log(`\nRegistered tools: ${widgets.map((w) => w.id).join(', ')}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await mcpServer.close();
    process.exit(0);
  });
}

// ============================================================================
// Start Server
// ============================================================================

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
