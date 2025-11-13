# Connect from ChatGPT

## Overview
This page provides instructions for connecting your app to ChatGPT clients using the Apps SDK.

## Before You Begin

**Developer Mode Requirement:**
To test your app in ChatGPT, you must enable developer mode through your account settings. Navigate to "Settings → Apps & Connectors → Advanced settings" and toggle developer mode if your organization allows it.

**Important Note:**
Public app publishing isn't currently available, though submissions will be accepted later in 2025. As of November 13th, 2025, ChatGPT Apps are supported across all plan types, including Business, Enterprise, and Education.

## Creating a Connector

The connector setup process involves four key steps:

1. **Ensure HTTPS Access** — Your MCP server must be publicly reachable over HTTPS. For local development, tools like ngrok or Cloudflare Tunnel can expose your server.

2. **Access Connector Creation** — In ChatGPT settings, navigate to "Connectors → Create."

3. **Provide Metadata** — Fill in three required fields:
   - Connector name (user-facing title)
   - Description (explains functionality and use cases)
   - Connector URL (the public `/mcp` endpoint)

4. **Verify Connection** — Upon clicking Create, you'll see advertised tools or receive debugging guidance if connection fails.

## Testing Your App

Once created, test the connector by:
- Opening a new ChatGPT conversation
- Clicking the **+** button and selecting your connector
- Prompting the model to invoke related tools
- Reviewing displayed tool-call payloads for confirmation

## Updating Metadata

When modifying tools or descriptions, refresh your server's metadata through "Settings → Connectors → Refresh" after redeploying.

## Using Other Clients

Your MCP server integrates with:
- **API Playground** — Access at platform.openai.com for raw request/response logs
- **Mobile clients** — Available on ChatGPT mobile once linked on web