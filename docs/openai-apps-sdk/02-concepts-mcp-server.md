# MCP Server Concepts

## What is MCP?

The Model Context Protocol (MCP) represents an open specification designed to link large language model clients with external tools and resources. According to the documentation, "An MCP server exposes **tools** that a model can call during a conversation, and return results given specified parameters."

The protocol enables servers to return metadata alongside tool results, including inline HTML that Apps SDK utilizes for rendering user interfaces. This architecture ensures ChatGPT can reason about your application similarly to how it processes built-in tools.

## Protocol Building Blocks

A functional MCP server for Apps SDK requires three core capabilities:

1. **List tools** – The server advertises supported tools, detailing their JSON Schema input/output contracts and optional annotations.

2. **Call tools** – When a model selects a tool, it transmits a `call_tool` request containing arguments aligned with user intent. Your server processes the action and returns structured content the model can interpret.

3. **Return components** – Tools can optionally reference embedded resources representing the interface to render in the ChatGPT client.

The protocol operates independently of transport mechanisms. Apps SDK supports both Server-Sent Events and Streamable HTTP, with Streamable HTTP being the recommended approach.

## Advantages of Apps SDK's MCP Standardization

Leveraging MCP provides several immediate benefits:

- **Discovery integration** – Tool metadata surfaces naturally to models, enabling language-based discovery and launcher ranking
- **Conversation awareness** – Structured content and component state persist throughout conversations
- **Multiclient support** – Self-describing format enables compatibility across platforms
- **Extensible authentication** – Built-in support for OAuth 2.1 flows and dynamic client registration

## Getting Started

The official documentation recommends exploring these resources:

- Model Context Protocol specification
- Official SDKs (Python and TypeScript implementations)
- MCP Inspector tool for local testing and debugging
