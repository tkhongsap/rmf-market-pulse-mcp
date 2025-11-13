# Define Tools

## Overview

This guide helps developers plan and structure tools for ChatGPT apps before implementation. Tools form the contract between your MCP server and the model, describing capabilities and data flows.

## Tool-First Thinking

Well-designed tools enable accurate discovery, reliable invocation, and predictable user experiences. The guide emphasizes planning before coding.

## Draft the Tool Surface Area

Key principles for scoping tools:

- **Single responsibility**: Each tool handles one action ("fetch_board" or "create_ticket"), not multiple operations
- **Explicit inputs**: Define inputSchema with parameter names, types, enums, defaults, and nullable fields
- **Predictable outputs**: Return structured fields with machine-readable identifiers for follow-up calls

Separate read and write operations so ChatGPT can enforce confirmation flows appropriately.

## Capture Metadata for Discovery

Discovery depends heavily on metadata. Document:

- **Name**: Action-oriented and unique within your connector
- **Description**: Start with "Use this when…" to clarify selection criteria
- **Parameter annotations**: Describe each argument with safe ranges or enumerations
- **Global metadata**: Prepare app-level name, icon, and descriptions for directories

## Model-Side Guardrails

Consider model behavior expectations:

- **Authentication**: Determine if tools work anonymously or require linking
- **Read-only hints**: Mark non-mutating tools with `readOnlyHint` to skip confirmations
- **Result components**: Decide on component rendering versus JSON-only responses

## Golden Prompt Rehearsal

Validate tools against captured user prompts:

1. Confirm each direct prompt has one clearly matching tool
2. Ensure indirect prompts contain sufficient context for tool selection
3. Verify negative prompts keep tools hidden unless explicitly requested

## Handoff to Implementation

Prepare documentation including tool names, descriptions, schemas, UI requirements, auth needs, rate limits, and test prompts before coding begins.