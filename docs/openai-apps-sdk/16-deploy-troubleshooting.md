# Troubleshooting Guide for Apps SDK

## Overview
This resource helps developers diagnose and resolve issues affecting server components, widgets, and ChatGPT integrations in Apps SDK applications.

## Diagnostic Approach

The guide recommends a layered troubleshooting strategy: identify whether problems originate in your backend server, frontend component, or the ChatGPT client itself.

## Server-Side Problems

Several common backend issues include:

- **Missing tool listings**: Verify your server runs and the `/mcp` endpoint is accessible. Update connector URLs if port configurations change.
- **Content rendering without components**: Ensure tool responses include "_meta["openai/outputTemplate"]" referencing an HTML resource marked as "text/html+skybridge" and free from CSP violations.
- **Schema validation failures**: Check that your data models align with advertised schemas. Regenerate type definitions after modifications.
- **Performance degradation**: Tool calls exceeding a few hundred milliseconds cause noticeable slowness. Optimize backend operations and implement caching strategies.

## Component and Widget Issues

Widget-specific troubleshooting covers:

- **Loading failures**: Examine browser console and MCP Inspector logs for Content Security Policy errors or missing resources. Ensure compiled JavaScript is inlined within HTML.
- **State persistence problems**: Call "window.openai.setWidgetState" after changes and rehydrate using "window.openai.widgetState" during initialization.
- **Mobile layout challenges**: Reference "window.openai.displayMode" and "window.openai.maxHeight" for responsive adjustments. Eliminate fixed dimensions and interaction patterns relying on hover states.

## Discovery and Tool Selection

Improve how tools appear and activate:

- **Tools not triggering**: Enhance metadata descriptions using "Use this when…" framing, refine starter prompts, and validate against typical user queries.
- **Incorrect tool selection**: Differentiate similar tools through additional context or exclusion criteria. Break oversized tools into focused, single-purpose variants.
- **Inconsistent launcher ranking**: Update directory metadata and confirm visual elements match user expectations.

## Authentication Issues

- **401 status responses**: Include "WWW-Authenticate" headers to signal OAuth initiation. Verify issuer and audience configuration accuracy.
- **Registration failures**: Confirm your authorization server publishes a "registration_endpoint" and enables login connections for new clients.

## Deployment Concerns

- **Tunnel instability**: Restart connections and confirm local services are active before sharing URLs. Deploy to production hosting with health monitoring.
- **Streaming interruptions**: Verify proxies and load balancers permit server-sent events and streaming responses without applying buffering policies.

## Escalation Path

When standard checks don't resolve issues, document logs from all relevant layers (server, component, tool transcripts) and screenshots showing the problem state, then contact your OpenAI representative with this information for investigation.
