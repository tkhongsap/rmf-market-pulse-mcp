# Deploy Your App

## Overview

The documentation explains how to host an MCP server and component bundle behind a stable HTTPS endpoint after development is complete.

## Deployment Options

Several hosting platforms are recommended, each suited to different needs:

**"Managed containers – Fly.io, Render, or Railway for quick spin-up and automatic TLS"** work well for teams needing straightforward deployment. For applications requiring automatic scaling, **"Google Cloud Run or Azure Container Apps"** offer serverless alternatives, though cold starts may affect streaming performance. Kubernetes deployments are viable for organizations with existing cluster infrastructure, provided the ingress controller supports server-sent events.

Critical requirements apply across all platforms: the `/mcp` endpoint must remain responsive, support streaming, and return proper HTTP status codes.

## Local Development Workflow

During iteration, developers can expose local servers using tunnels like ngrok, mapping traffic from a public HTTPS URL to localhost. The development cycle involves rebuilding component bundles, restarting the server, and refreshing connector metadata in ChatGPT settings.

## Configuration Best Practices

Three areas warrant attention:

- **Secrets management** requires storing credentials in platform-specific managers rather than repositories
- **Logging** should capture tool-call IDs, latency metrics, and error details for troubleshooting
- **Observability** monitors resource consumption and request volumes to guide sizing decisions

## Pre-Launch Validation

Before broad release, teams should gate access through developer mode, exercise discovery prompts documented during planning, and preserve visual artifacts from testing environments like MCP Inspector.

---

**Source URL:** https://developers.openai.com/apps-sdk/deploy
**Extracted:** 2025-11-14
