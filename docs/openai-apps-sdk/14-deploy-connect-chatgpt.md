# Connect from ChatGPT

## Overview

This guide explains how to link your application to ChatGPT clients, enabling users to access your tools within conversations.

## Before You Begin

### Developer Mode Requirements

To test your application in ChatGPT using your account, you'll need to activate developer mode:

1. Navigate to **Settings → Apps & Connectors → Advanced settings**
2. Toggle developer mode (availability depends on organization permissions)
3. Once activated, a **Create** button appears under **Settings → Apps & Connectors**

**Availability Note:** As of November 13th, 2025, ChatGPT Apps work across all subscription tiers, including Business, Enterprise, and Education plans.

### Important Limitation

Currently, public distribution is unavailable. The platform will accept submissions later in 2025. Review the [app developer guidelines](/apps-sdk/app-developer-guidelines) for publishing requirements.

## Creating Your Connector

### Prerequisites

Your MCP server must be accessible via HTTPS. For local development, tools like ngrok or Cloudflare Tunnel can expose your server publicly.

### Setup Steps

1. Go to **Settings → Connectors → Create** in ChatGPT
2. Enter connector details:
   - **Name:** User-friendly identifier (e.g., "Kanban board")
   - **Description:** Explains functionality and use cases for model discovery
   - **URL:** Your server's public `/mcp` endpoint (e.g., `https://abc123.ngrok.app/mcp`)
3. Submit the form

A successful connection displays your advertised tools. If it fails, use the Testing guide with MCP Inspector or the API Playground for troubleshooting.

## Testing Your Application

### In ChatGPT

1. Open a new conversation
2. Select the **+** button near the message input
3. Click **More** and choose your connector from available tools
4. Instruct the model to use your tools (example: "What tasks do I have?")

The interface displays tool payloads for verification. Write-enabled tools need manual approval unless you enable remembered permissions for the session.

## Updating Tool Metadata

When your tools change:

1. Modify and redeploy your MCP server
2. Open **Settings → Connectors**, select your connector, then **Refresh**
3. Verify updated tools and test new workflows

## Alternative Clients

### API Playground
Access the [platform playground](https://platform.openai.com/chat), add your MCP endpoint via **Tools → Add → MCP Server**, and view detailed request/response logs.

### Mobile Clients
Once linked on ChatGPT web, your connector automatically appears in mobile applications. Test responsive designs early.

---

**Next Steps:** Proceed to [testing your integration](/apps-sdk/deploy/testing) for validation strategies.
