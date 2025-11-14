# MCP Server

## Overview

"The Model Context Protocol (MCP) is an open specification for connecting large language model clients to external tools and resources." An MCP server exposes tools that models can invoke during conversations and return results based on specified parameters.

## Key Components

The protocol operates through three essential capabilities:

1. **Tool Discovery** – servers advertise supported tools with JSON Schema contracts and optional metadata annotations
2. **Tool Execution** – when selected, the model sends a `call_tool` request with user-intent arguments; servers execute actions and return structured content
3. **Component Rendering** – tools can reference embedded resources representing interfaces rendered in the ChatGPT client

## Technical Details

The protocol is transport-agnostic, supporting Server-Sent Events or Streamable HTTP delivery. The documentation recommends Streamable HTTP for Apps SDK implementations.

## Benefits of MCP Integration

Using MCP with Apps SDK provides:

- **Discovery** – natural-language tool discovery matching first-party connectors
- **Conversation Context** – structured content flows through conversations; models can reference IDs across turns
- **Cross-Platform Support** – self-describing protocol works on ChatGPT web and mobile without custom code
- **Authentication** – built-in OAuth 2.1 flows and dynamic client registration support

## Getting Started Resources

- Model Context Protocol specification documentation
- Official SDKs (Python with FastMCP module; TypeScript)
- MCP Inspector tool for local debugging

---

**Source URL:** https://developers.openai.com/apps-sdk/concepts/mcp-server
**Extracted:** 2025-11-14
