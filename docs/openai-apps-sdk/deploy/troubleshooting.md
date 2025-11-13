# Troubleshooting

## Overview
This guide addresses common issues in Apps SDK applications across three primary layers: server infrastructure, component rendering, and ChatGPT client integration.

## Server-Side Issues

**Missing Tools**
- Verify the server is operational and properly connected to the `/mcp` endpoint
- Update connector URLs if port changes occur and restart MCP Inspector

**Structured Content Without Components**
- Ensure tool responses configure `_meta["openai/outputTemplate"]` with a registered HTML resource
- Resource must specify `mimeType: "text/html+skybridge"`
- Test for Content Security Policy (CSP) errors during load

**Schema Validation Errors**
- Confirm Pydantic or TypeScript model definitions align with advertised `outputSchema`
- Regenerate types following any model modifications

**Performance Degradation**
- Tool calls exceeding several hundred milliseconds create noticeable lag
- Profile backend operations and implement result caching where feasible

## Widget Issues

**Component Loading Failures**
- Check browser console and MCP Inspector logs for CSP violations
- Confirm bundled dependencies and inline-compiled JavaScript are present

**State Persistence Problems**
- Invoke `window.openai.setWidgetState` following each state change
- Initialize from `window.openai.widgetState` during component mount

**Mobile Layout Challenges**
- Reference `window.openai.displayMode` and `window.openai.maxHeight` for responsive adjustments
- Avoid fixed dimensions and interaction patterns dependent on hover events

## Discovery and Entry-Point Issues

**Tool Invocation Failures**
- Refine metadata descriptions using action-oriented language ("Use this when…")
- Update starter prompts and validate against core test scenarios

**Incorrect Tool Selection**
- Add distinguishing details between functionally similar tools
- Include constraint statements in descriptions; consider breaking larger tools into specialized alternatives

**Suboptimal Launcher Ranking**
- Refresh directory metadata entries
- Ensure visual assets and descriptions match user expectations

## Authentication Problems

**401 HTTP Errors**
- Include `WWW-Authenticate` header in error responses to initiate OAuth retry
- Validate issuer URLs and audience claim configurations

**Dynamic Client Registration Failures**
- Confirm authorization server exposes the `registration_endpoint` parameter
- Verify newly provisioned clients have login connections enabled

## Deployment Problems

**Ngrok Tunnel Timeout**
- Restart tunnel and confirm local server availability before sharing URLs
- Employ stable production hosting with integrated health monitoring

**Streaming Interruption Behind Proxies**
- Ensure load balancers and CDNs permit server-sent events and streaming responses
- Disable response buffering on intermediate layers

## Escalation Process

For unresolved issues:

1. Aggregate logs from server, component console, and ChatGPT interaction transcripts with screenshots
2. Document the exact prompt issued and any presented dialogs
3. Submit consolidated details to your OpenAI partner representative for internal reproduction and investigation