# Deploy Your App

Learn how to deploy your MCP server

## Deployment Options

Once you have a working MCP server and component bundle, host them behind a stable HTTPS endpoint. Several deployment platforms work well with Apps SDK:

- **Managed containers** – Fly.io, Render, or Railway offer quick deployment and automatic TLS
- **Cloud serverless** – Google Cloud Run or Azure Container Apps provide scale-to-zero capabilities, though cold starts may affect streaming HTTP
- **Kubernetes** – suitable for teams running existing clusters, requiring an ingress controller that supports server-sent events

Key requirements: ensure `/mcp` remains responsive, supports streaming responses, and returns appropriate HTTP status codes for errors.

## Local Development

During development, expose your local server to ChatGPT using a tunnel like ngrok:

```
ngrok http 2091
# https://<subdomain>.ngrok.app/mcp → http://127.0.0.1:2091/mcp
```

Keep the tunnel running while iterating. When modifying code:

1. Rebuild the component bundle (`npm run build`)
2. Restart your MCP server
3. Refresh the connector in ChatGPT settings to pull latest metadata

## Environment Configuration

- **Secrets** – store API keys or OAuth secrets outside your repository using platform-specific secret managers and environment variables
- **Logging** – track tool-call IDs, request latency, and error payloads for debugging user issues in production
- **Observability** – monitor CPU, memory, and request counts to properly size your deployment

## Dogfood and Rollout

Before launching broadly:

1. **Gate access** – restrict your connector to developer mode or experiment flags until confident in stability
2. **Run golden prompts** – test discovery prompts from planning phase and measure precision/recall changes
3. **Capture artifacts** – record screenshots showing the component in MCP Inspector and ChatGPT

When ready for production, update directory metadata, verify auth and storage configuration, and publish change notes in Release Notes.

## Next Steps

- Connect your deployed endpoint following [Connect from ChatGPT](/apps-sdk/deploy/connect-chatgpt)
- Validate tooling using the [Test your integration](/apps-sdk/deploy/testing) guide
- Maintain a troubleshooting playbook via [Troubleshooting](/apps-sdk/deploy/troubleshooting) for support teams
