# Define Tools

## Overview
This guide covers planning and defining tools for ChatGPT applications using the Apps SDK. Tools serve as the contract between your MCP server and the model, describing capabilities, invocation methods, and return data.

## Key Principles

### Tool-First Thinking
Tools describe what connectors can do and how models should use them. Quality tool design ensures accurate discovery, reliable invocation, and predictable user experiences.

### Draft the Tool Surface Area
- **One job per tool**: Focus each tool on a single action like "fetch_board" or "create_ticket" rather than combining multiple operations
- **Explicit inputs**: Define `inputSchema` with parameter names, data types, and enums; document defaults and nullable fields
- **Predictable outputs**: Enumerate structured return fields, including identifiers the model can reuse in follow-up calls
- Create separate tools for read and write operations to respect confirmation flows

## Capture Metadata for Discovery

For each tool, prepare:
- **Name**: Action-oriented and unique within your connector
- **Description**: One or two sentences starting with "Use this when…"
- **Parameter annotations**: Describe each argument with safe ranges or enumerations
- **Global metadata**: Include app-level name, icon, and descriptions for directories and launchers

## Model-Side Guardrails

Consider how the model should behave:
- **Authentication**: Decide whether tools require linking or work anonymously
- **Read-only hints**: Set `readOnlyHint` annotations for non-mutating tools to skip confirmation prompts
- **Result components**: Determine if tools should render components, return JSON only, or both using `_meta["openai/outputTemplate"]`

## Golden Prompt Rehearsal

Validate your tool set against captured user prompts:
1. Confirm each direct prompt has exactly one corresponding tool
2. Ensure tool descriptions help the model select your connector over built-in alternatives
3. Verify metadata prevents tools from appearing unless explicitly requested

## Implementation Handoff

Compile documentation including:
- Tool name, description, input/output schemas
- Component requirements
- Authentication, rate limits, error handling expectations
- Test prompts (success and failure cases)

---

**Source URL:** https://developers.openai.com/apps-sdk/plan/tools
**Extracted:** 2025-11-14
