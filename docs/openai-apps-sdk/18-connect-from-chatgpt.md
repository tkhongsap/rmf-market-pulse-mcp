# Connect from ChatGPT

## Overview
This guide explains how to connect your app to ChatGPT clients after building your MCP server.

## Prerequisites

Before connecting, ensure:
- Your MCP server is accessible via HTTPS
- For local development, use tools like ngrok or Cloudflare Tunnel to expose your server publicly
- Developer mode is enabled in ChatGPT (Settings → Apps & Connectors → Advanced settings)
- Your organization permits developer mode access
- As of November 13th, 2025, ChatGPT Apps work across all plan types

## Creating a Connector

### Setup Steps

1. **Enable Developer Mode**: Navigate to Settings, find Apps & Connectors, scroll to Advanced settings, and toggle developer mode
2. **Access Create Button**: Once active, the Create button appears under Settings → Apps & Connectors
3. **Provide Metadata**:
   - Connector name (user-facing title)
   - Description (explains functionality and use cases for model discovery)
   - Connector URL (your server's public `/mcp` endpoint)
4. **Verify Connection**: The system displays advertised tools if successful; consult the Testing guide if issues arise

## Testing Your App

1. Open a new ChatGPT conversation
2. Click the **+** button near the message composer and select **More**
3. Choose your connector from available tools
4. Prompt the model to invoke related tools (e.g., "What are my available tasks?")

**Important Note**: ChatGPT displays tool-call payloads for confirmation. Write tools require manual approval unless you enable conversation-specific remembering.

## Metadata Refresh Process

When updating tools or descriptions:
1. Update and redeploy your MCP server
2. In Settings → Connectors, select your connector and choose **Refresh**
3. Verify tool list changes and test updated workflows

## Additional Client Options

- **API Playground**: Add your MCP server via Tools → Add → MCP Server for raw request/response logging
- **Mobile Apps**: Connectors automatically sync to mobile once linked on web; test mobile layouts early

---

**Source URL:** https://developers.openai.com/apps-sdk/deploy/connect-chatgpt
**Extracted:** 2025-11-14
