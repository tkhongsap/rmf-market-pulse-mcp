# Test Your Integration

## Overview

This page covers testing strategies for Apps SDK applications, focusing on validating tool correctness, component UX, and discovery precision before exposing connectors to users.

## Unit test your tool handlers

The documentation recommends exercising each tool function directly with representative inputs. Key testing areas include:

- Schema validation and error handling
- Edge cases such as empty results or missing IDs
- Authentication flows if tokens are issued or account linking is required
- Test fixtures maintained close to MCP code to stay current as schemas change

## Use MCP Inspector during development

"The MCP Inspector is the fastest way to debug your server locally." The process involves:

1. Running your MCP server
2. Launching the inspector via `npx @modelcontextprotocol/inspector@latest`
3. Entering your server URL (example: `http://127.0.0.1:2091/mcp`)
4. Clicking **List Tools** and **Call Tool** to inspect requests and responses

The inspector renders components inline, surfaces errors immediately, and allows screenshot capture for launch reviews.

## Validate in ChatGPT developer mode

After your connector is accessible over HTTPS:

- Link it in **Settings → Connectors → Developer mode**
- Test with golden prompt sets (direct, indirect, negative cases)
- Record tool selection accuracy, argument passing, and confirmation prompt behavior
- Test mobile layouts using ChatGPT iOS or Android apps

## Connect via the API Playground

For raw logs or UI-free testing:

1. Open the API Playground
2. Choose **Tools → Add → MCP Server**
3. Provide your HTTPS endpoint
4. Issue test prompts and inspect JSON request/response pairs

## Regression checklist before launch

- Tool list matches documentation; unused prototypes removed
- Structured content aligns with declared `outputSchema` for all tools
- Widgets render without console errors and restore state correctly
- OAuth or custom auth flows return valid tokens and reject invalid ones with meaningful error messages
- Discovery functions as expected across golden prompts without triggering on negative cases

Documentation recommends capturing findings in a document to compare results across releases.

---

**Source URL:** https://developers.openai.com/apps-sdk/deploy/testing
**Extracted:** 2025-11-14
