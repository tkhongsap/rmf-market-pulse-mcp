# Model Context Protocol (MCP) Guide

## What is MCP?

The Model Context Protocol represents "an open specification for connecting large language model clients to external tools and resources." MCP servers expose tools that models can invoke during conversations, returning results based on specified parameters along with optional metadata and inline HTML for UI rendering.

Within the Apps SDK framework, MCP serves as the foundational layer synchronizing servers, models, and interfaces. By standardizing wire format, authentication, and metadata, it enables ChatGPT to process your application similarly to built-in tools.

## Core Protocol Components

A functional MCP server for Apps SDK requires three essential capabilities:

1. **Tool Discovery** – Your server announces supported tools, complete with JSON Schema definitions for inputs/outputs and optional metadata annotations.

2. **Tool Invocation** – When a model selects a tool, it transmits a `call_tool` request containing arguments matching user intent. Your server processes the action and returns structured, parseable content.

3. **Component Rendering** – Beyond structured tool responses, each tool's metadata can reference an embedded resource representing the ChatGPT-renderable interface.

The specification remains transport-independent, supporting Server-Sent Events or Streamable HTTP. Apps SDK accommodates both, though Streamable HTTP is recommended.

## Strategic Advantages

Implementing through MCP provides immediate benefits:

- **Native Discovery** – Tool metadata flows into model reasoning identically to first-party connectors, supporting natural-language exploration
- **Conversation Context** – Structured results and component states persist across exchanges; models reference prior IDs in subsequent turns
- **Cross-Platform Compatibility** – Self-describing protocol ensures your connector functions uniformly across ChatGPT web and mobile
- **Flexible Authentication** – Specification encompasses protected resource metadata, OAuth 2.1, and dynamic registration for access control

## Learning Resources

Recommended starting points include the official specification, Python and TypeScript SDKs, and the MCP Inspector for local testing before exploring the server setup guide.