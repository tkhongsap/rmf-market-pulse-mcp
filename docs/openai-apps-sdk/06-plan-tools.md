# Define Tools

Plan and define tools for your assistant.

## Tool-First Thinking

In Apps SDK, tools serve as the contract between your MCP server and the model. They specify what the connector can perform, how to invoke it, and what data returns. Effective tool design enables accurate discovery, dependable invocation, and foreseeable downstream UX.

Use the checklist below to convert your use cases into well-scoped tools before implementing the SDK.

## Draft the Tool Surface Area

Start from the user journey defined in your [use case research](/apps-sdk/plan/use-case):

- **One job per tool** – Each tool should handle a single read or write operation ("fetch_board", "create_ticket") rather than combining multiple functions. This allows the model to distinguish between options.
- **Explicit inputs** – Define the `inputSchema` structure now, specifying parameter names, data types, and enums. Document defaults and nullable fields to clarify what is optional.
- **Predictable outputs** – List the structured fields you will return, including machine-readable identifiers the model can reference in subsequent calls.

For tools requiring both read and write capabilities, create separate tools so ChatGPT can enforce confirmation workflows for write operations.

## Capture Metadata for Discovery

Discovery relies heavily on metadata. For each tool, prepare:

- **Name** – Action-oriented and distinct within your connector (`kanban.move_task`).
- **Description** – One or two sentences beginning with "Use this when…" so the model understands exactly when to select the tool.
- **Parameter annotations** – Describe each argument and highlight safe ranges or enumerations. This prevents malformed calls when user prompts lack clarity.
- **Global metadata** – Verify you have app-level name, icon, and descriptions prepared for the directory and launcher.

Later, incorporate these into your MCP server and iterate using the [Optimize metadata](/apps-sdk/guides/optimize-metadata) workflow.

## Model-Side Guardrails

Consider how the model should respond once a tool is linked:

- **Prelinked vs. link-required** – If your app functions anonymously, mark tools as available without authentication. Otherwise, ensure your connector enforces linking through the onboarding flow in [Authentication](/apps-sdk/build/auth).
- **Read-only hints** – Set the `readOnlyHint` annotation for tools that don't modify state so ChatGPT can bypass confirmation prompts when appropriate.
- **Result components** – Determine whether each tool should render a component, return JSON only, or both. Setting `_meta["openai/outputTemplate"]` on the tool descriptor advertises the HTML template to ChatGPT.

## Golden Prompt Rehearsal

Before implementation, validate your tool set against the prompts you collected earlier:

1. For every direct prompt, verify you have exactly one tool that clearly satisfies the request.
2. For indirect prompts, ensure the tool descriptions provide sufficient context for the model to select your connector instead of a built-in alternative.
3. For negative prompts, confirm your metadata will keep the tool hidden unless the user explicitly opts in (e.g., by naming your product).

Identify gaps or ambiguities now and refine the plan—modifying metadata before launch costs less than refactoring code afterward.

## Handoff to Implementation

When ready to implement, compile the following into a handoff document:

- Tool name, description, input schema, and expected output schema.
- Whether the tool should return a component, and which UI component should render it.
- Auth requirements, rate limits, and error handling expectations.
- Test prompts that should succeed (and ones that should fail).

Bring this plan into the [Set up your server](/apps-sdk/build/mcp-server) guide to translate it into code with your chosen MCP SDK.

---

**Navigation:** [Previous: Research use cases](/apps-sdk/plan/use-case) | [Next: Design components](/apps-sdk/plan/components)
