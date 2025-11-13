# OpenAI Apps SDK Documentation

This directory contains the complete extracted documentation from the OpenAI Apps SDK website (https://developers.openai.com/apps-sdk).

## Documentation Structure

The documentation is organized into 20 markdown files covering all aspects of the Apps SDK:

### Getting Started
- **00-index.md** - Main Apps SDK overview and introduction
- **01-quickstart.md** - Build and connect your first app to ChatGPT

### Core Concepts
- **02-concepts-mcp-server.md** - Understanding MCP (Model Context Protocol) servers
- **03-concepts-user-interaction.md** - How users discover and interact with apps
- **04-concepts-design-guidelines.md** - Design principles and best practices

### Plan Phase
- **05-plan-use-case.md** - Research and identify use cases
- **06-plan-tools.md** - Define and plan tools for your assistant
- **07-plan-components.md** - Design UI components

### Build Phase
- **08-build-mcp-server.md** - Set up your MCP server
- **09-build-custom-ux.md** - Build custom UI components
- **10-build-auth.md** - Authenticate users with OAuth 2.1
- **11-build-state-management.md** - Manage state across components
- **12-build-examples.md** - Example implementations and patterns

### Deploy Phase
- **13-deploy.md** - Deploy your app to production
- **14-deploy-connect-chatgpt.md** - Connect your app from ChatGPT
- **15-deploy-testing.md** - Test your integration
- **16-deploy-troubleshooting.md** - Troubleshooting guide

### Guides
- **17-guides-optimize-metadata.md** - Optimize tool metadata for discovery
- **18-guides-security-privacy.md** - Security and privacy considerations

### Resources
- **19-reference.md** - API and SDK reference documentation
- **20-app-developer-guidelines.md** - App submission guidelines and policies

## Key Concepts

### MCP Server
The Model Context Protocol (MCP) is the foundation of Apps SDK, enabling ChatGPT to communicate with your backend services through standardized tool definitions.

### Window.openai API
The `window.openai` object serves as the bridge between your UI components and ChatGPT, providing:
- Tool input/output access
- State management
- Display mode control
- Follow-up message capabilities

### Tool Discovery
ChatGPT discovers and selects tools based on metadata you provide:
- Tool names and descriptions
- Parameter schemas
- Security requirements
- Output templates

### Authentication
Apps SDK supports OAuth 2.1 with PKCE for user authentication, including:
- Dynamic client registration
- Protected resource metadata
- Token verification

## Documentation Source

All documentation was extracted from the official OpenAI Apps SDK website on November 13, 2025.

Source: https://developers.openai.com/apps-sdk

## Related Resources

- [OpenAI Apps SDK Examples Repository](https://github.com/openai/openai-apps-sdk-examples)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Inspector Tool](https://modelcontextprotocol.io/docs/tools/inspector)
