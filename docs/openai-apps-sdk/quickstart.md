# Apps SDK Quickstart Guide

## Introduction

The Apps SDK leverages the Model Context Protocol (MCP) to expose applications to ChatGPT. Building an app requires two components:

1. **Web Component**: Built with your chosen framework, rendered in an iframe within ChatGPT
2. **MCP Server**: Exposes your app and defines capabilities (tools) to ChatGPT

This guide demonstrates creating a simple to-do list application in a single HTML file.

## Building a Web Component

Create `public/todo-widget.html` containing your UI. The example includes:

- Styled HTML structure with a to-do list interface
- Form for adding tasks
- Checkboxes for marking tasks complete
- JavaScript for managing local state

### Key Integration Points

The `window.openai` object serves as the bridge between your frontend and ChatGPT:

- **`window.openai.toolOutput`**: Receives injected tool responses from ChatGPT
- **`window.openai.callTool`**: Calls tool functions and receives updated structured content

## Building an MCP Server

### Setup Requirements

Install dependencies:
```bash
npm install @modelcontextprotocol/sdk zod
```

### Server Implementation

Create `server.js` using the Node SDK. The server must:

- Register UI resources (your HTML component)
- Define tools (functions ChatGPT can invoke)
- Return responses with `structuredContent` containing updated data

Key example functions:
- `add_todo`: Creates new task items
- `complete_todo`: Marks tasks as done

## Running Locally

### Start the Server

Ensure `package.json` includes `"type": "module"`, then:

```bash
node server.js
```

Expected output: Server listening on `http://localhost:8787/mcp`

### Testing with MCP Inspector

Validate your server using the official tool:

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

This opens an interface for testing tools and viewing responses.

### Exposing to the Internet

Use tunneling software like ngrok to access your local server from ChatGPT:

```bash
ngrok http <port>
```

This generates a public URL (`https://<subdomain>.ngrok.app`) for your MCP endpoint.

## Adding Your App to ChatGPT

1. Enable developer mode in **Settings → Apps & Connectors → Advanced settings**
2. Create a connector under **Settings → Connectors**
3. Paste your public MCP URL (with `/mcp` path)
4. Name and describe your connector
5. Access the connector in new chats via the **More** menu

## Next Steps

- Review [app developer guidelines](/apps-sdk/app-developer-guidelines)
- Explore [design guidelines](/apps-sdk/concepts/design-guidelines)
- Implement [custom UX](/apps-sdk/build/custom-ux) using SDK primitives
- Add [user authentication](/apps-sdk/build/auth) if needed
- Enable [state persistence](/apps-sdk/build/storage)

Refresh your connector in Settings after any MCP server changes.