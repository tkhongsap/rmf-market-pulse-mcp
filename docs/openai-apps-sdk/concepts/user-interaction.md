# User Interaction

How users find, engage with, activate and manage apps available in ChatGPT.

## Discovery

Discovery encompasses the various ways users and models learn about your app and its capabilities: natural-language prompts, directory browsing, and proactive entry points. The Apps SDK leverages tool metadata and usage history to make intelligent decisions. Effective discovery means your app appears when relevant and remains unobtrusive otherwise.

### Named Mention

When a user begins a prompt by mentioning your app's name, it automatically surfaces in the response. If the user omits the app name initially, it may still appear through in-conversation discovery suggestions.

### In-Conversation Discovery

When processing a user prompt, the model considers several factors:

- **Conversation context** – chat history, prior tool results, user memories, and stated tool preferences
- **Brand mentions and citations** – explicit brand requests or appearance in search results
- **Tool metadata** – names, descriptions, and parameter documentation from your MCP server
- **User linking state** – whether the user has authorized access or must connect first

To improve in-conversation discovery:

1. Write action-oriented tool descriptions like *"Use this when the user wants to view their kanban board"* rather than generic text
2. Create clear component descriptions in resource UI template metadata
3. Test your prompts regularly in ChatGPT developer mode, tracking precision and recall

When your tool matches user intent, the assistant handles arguments, displays confirmation if necessary, and renders components inline. If no linked tool fits, the model defaults to built-in capabilities.

### Directory

A browsable directory helps users discover apps outside conversations. Directory listings include:

- App name and icon
- Short and long descriptions
- Tags or categories
- Optional onboarding instructions or screenshots

## Entry Points

Once users link your app, ChatGPT surfaces it through multiple entry points.

### In-Conversation Entry

Linked tools remain active in the model's context. The assistant decides whether to invoke your tool based on conversation state and your provided metadata. Best practices include:

- Keep descriptions action-oriented for clearer disambiguation
- Return structured content referencing stable IDs for follow-up mutations or summaries
- Provide `_meta` hints for streamlined confirmation and rendering

Successful calls render components inline, inheriting the current theme, composer, and confirmation settings.

### Launcher

The launcher (accessible via the + button in the composer) represents high-intent selection. Consider:

- **Deep linking** – include starter prompts or entry arguments directing users to relevant tools
- **Context awareness** – the launcher ranks apps using current conversation signals, so align metadata with supported scenarios