# Build a Custom UX

## Overview

Custom UI components transform structured tool results into user-friendly interfaces. These React components operate within an iframe, communicate with ChatGPT via the `window.openai` API, and render inline within conversations.

## Understanding the `window.openai` API

The `window.openai` interface serves as the connection point between your frontend and ChatGPT, managing data, state, and layout interactions.

### Key Interface Properties

**Global State Access:**
- `theme`: "light" or "dark" mode
- `locale`: User's language preference
- `userAgent`: Device type and capabilities
- `maxHeight`: Container height constraints
- `displayMode`: "inline", "pip", or "fullscreen"
- `toolInput/toolOutput`: Current tool data
- `widgetState`: Persisted component state

**Available Methods:**

The system provides functions including:
- `callTool()`: Execute MCP server tools directly
- `sendFollowUpMessage()`: Insert conversational prompts
- `requestDisplayMode()`: Negotiate container layouts
- `setWidgetState()`: Persist and expose state to ChatGPT
- `openExternal()`: Navigate to external links

### useOpenAiGlobal Hook Pattern

Wrap `window.openai` access in custom hooks for testability:

```typescript
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K
): OpenAiGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) return;
        onChange();
      };
      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai[key]
  );
}
```

### Widget State Management

Widget state serves dual purposes: preserving data across sessions and exposing information to the model. State persists only for its specific widget instance and message ID. New conversations or main chat submissions create fresh widget instances with empty state.

Keep payloads focused and under 4k tokens for optimal performance.

### Tool Invocation

Components can directly call MCP tools through `window.openai.callTool()`. Design tools to be idempotent and return updated structured content for model reasoning in subsequent turns.

### Navigation Support

Standard routing libraries (React Router with `BrowserRouter`) sync with ChatGPT's navigation controls automatically through Skybridge's iframe history mirroring.

## Project Structure

Separate component code from server logic using this layout:

```
app/
  server/            # MCP server (Python/Node)
  web/               # Component bundle
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js
```

Initialize with Node 18+ and install dependencies:

```bash
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

## Component Development

Entry files should mount to a `root` element and read initial data from `window.openai.toolOutput` or persisted state.

### Example Component Gallery

The Apps SDK includes reference implementations:

- **Pizza List**: Ranked cards with favorites and CTAs
- **Carousel**: Horizontal scrollers for media-heavy layouts
- **Map**: Mapbox integration with fullscreen inspection
- **Album**: Stacked gallery for deep dives
- **Video**: Scripted player with overlay controls

Each demonstrates bundling assets, API wiring, and state structuring.

### useWidgetState Hook

Synchronize host-persisted state with React component state:

```typescript
const [widgetState, setWidgetState] = useWidgetState<T>(defaultState);
```

This pattern keeps local state aligned with ChatGPT's persistence layer.

## Building and Deployment

Compile the component into a single JavaScript module:

```json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

The resulting `dist/component.js` embeds into server responses. During development, rebuild on code changes for hot-reloading.

---

**Related Documentation:**
- [MCP Server Setup](/apps-sdk/build/mcp-server)
- [User Authentication](/apps-sdk/build/auth)
- [GitHub Examples Repository](https://github.com/openai/openai-apps-sdk-examples)