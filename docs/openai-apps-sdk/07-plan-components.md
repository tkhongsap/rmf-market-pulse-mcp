# Design Components

Plan and design UI components that users can interact with.

## Why Components Matter

UI components serve as the user-facing interface for your connector. They enable users to view or modify data directly, expand to fullscreen when necessary, and maintain synchronized context between text prompts and UI interactions. Early component planning ensures your MCP server delivers appropriately structured data and component metadata from the start.

## Explore Sample Components

Reusable examples are available in the [openai-apps-sdk-examples repository](https://github.com/openai/openai-apps-sdk-examples) to demonstrate common design patterns. The pizzaz gallery showcases default surfaces currently available:

### List
Displays dynamic collections with empty-state handling. [View implementation details](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-list).

### Map
Displays geographic data with marker clustering and detail panes. [View implementation details](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz).

### Album
Presents media galleries with fullscreen functionality. [View implementation details](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-albums).

### Carousel
Features content with swipe interaction support. [View implementation details](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-carousel).

### Shop
Illustrates product browsing with purchase options. [View implementation details](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-shop).

## Clarify User Interaction

For each use case, determine what users must view and control:

- **Read-only versus interactive** – Choose whether components display information only (charts, dashboards) or support modifications (forms, task boards)
- **Single interaction versus iterative** – Will users complete tasks in one step, or should state carry through multiple exchanges?
- **Embedded versus expanded** – Decide if the default card layout suffices or if fullscreen viewing is beneficial

Document the data fields, interactive elements, and empty-state designs needed for stakeholder review.

## Map Data Requirements

Components should receive complete information from the tool response. During planning:

- **Structured data** – Define the JSON format the component will process
- **Initial state** – Use `window.openai.toolOutput` for initial render data; use `callTool` return values for subsequent updates; apply `window.openai.setWidgetState` to cache state for re-rendering
- **Authentication details** – Indicate whether components display account information or require user authentication first

Integrating this data through MCP responses simplifies implementation compared to adding custom APIs later.

## Design for Responsive Layouts

Components operate within iframes on desktop and mobile platforms. Account for:

- **Flexible breakpoints** – Establish maximum widths and ensure layouts adapt smoothly on smaller devices
- **Accessible design** – Support system dark mode preferences and provide keyboard navigation indicators
- **Transition states** – Maintain navigation visibility when users open components from the launcher or expand to fullscreen

Establish CSS variables, typography standards, and icon systems early for consistency.

## Define State Management

Since components and the chat interface share conversation state, clarify storage responsibilities:

- **Component-level state** – Use `window.openai.setWidgetState` to preserve data the host should maintain (selected items, scroll position, form data)
- **Backend state** – Store authoritative data in your infrastructure or built-in storage; determine how to integrate server updates into component state following tool invocations
- **Conversation history** – Consider what human-readable messages components send via `sendFollowUpMessage` to maintain meaningful transcripts

Documenting state flows prevents synchronization complications during development.

## Plan Instrumentation and Debugging

Embedded experiences require intentional monitoring for troubleshooting. Plan for:

- **Event tracking** – Log component initialization, interactions, and validation results
- **Request tracing** – Record tool-call identifiers with component telemetry for end-to-end issue diagnosis
- **Error handling** – Implement fallbacks when components fail to load (display JSON data and offer retry options)

With these preparations complete, proceed to [Build a custom UX](/apps-sdk/build/custom-ux) for implementation guidance.

---

**Previous:** [Define tools](/apps-sdk/plan/tools)
