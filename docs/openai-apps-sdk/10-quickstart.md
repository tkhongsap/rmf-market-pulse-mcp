# Apps SDK Quickstart

## Overview

The Apps SDK enables developers to build applications for ChatGPT. According to the documentation, "The Apps SDK relies on the Model Context Protocol (MCP) to expose your app to ChatGPT."

## Core Requirements

Two essential components are needed:

1. **Web Component**: A frontend interface built with any framework, rendered in an iframe within ChatGPT
2. **MCP Server**: Exposes the app and defines capabilities (tools) to ChatGPT

## Building a Web Component

The quickstart demonstrates creating a to-do list application in a single HTML file (`public/todo-widget.html`). The component includes:

- Styled HTML markup with a form for adding tasks
- CSS styling with a clean, modern design
- JavaScript using `window.openai` as the bridge to ChatGPT

### Key Integration Points

The web component accesses tool outputs through `window.openai.toolOutput`. Tool calls are made via `window.openai.callTool(name, payload)`, which returns structured content to keep the UI synchronized.

## Building an MCP Server

### Installation

```bash
npm install @modelcontextprotocol/sdk zod
```

### Server Implementation

The example uses Node.js with the official MCP SDK. The server:

- Registers resources for UI components
- Defines tools (e.g., `add_todo`, `complete_todo`) with input schemas
- Returns responses containing both text and structured content

### Package Configuration

```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.20.2",
    "zod": "^3.25.76"
  }
}
```

## Local Development

### Running the Server

```bash
node server.js
```

The server listens on `http://localhost:8787/mcp` by default.

### Testing

The MCP Inspector tool allows local testing:

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

### Public Exposure

Use ngrok to tunnel local development to a public URL:

```bash
ngrok http <port>
```

This generates an HTTPS endpoint like `https://<subdomain>.ngrok.app/mcp`.

## Integration with ChatGPT

### Setup Steps

1. Enable developer mode in ChatGPT settings
2. Create a connector under Settings → Connectors
3. Provide the MCP endpoint URL
4. Name and describe the connector
5. Access in new conversations via the More menu

### Development Workflow

After modifying the MCP server, refresh the connector in settings to apply changes. The documentation notes that iteration focuses on UI/UX, prompts, tool metadata, and overall user experience.

## Best Practices

The documentation references app developer guidelines and recommends:

- Researching your use case before building
- Following design guidelines for consistency
- Building custom UX with Apps SDK primitives
- Implementing user authentication if needed
- Persisting state appropriately

## Additional Resources

- Examples repository: GitHub OpenAI Apps SDK Examples
- For Python implementations: Refer to the examples repository
- Model Context Protocol documentation available via provided links

---

**Source URL:** https://developers.openai.com/apps-sdk/quickstart
**Extracted:** 2025-11-14
