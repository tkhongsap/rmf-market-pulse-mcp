# Build a Custom UX

Build custom UI components & app page.

## Overview

UI components transform structured tool results into user-friendly interfaces. Apps SDK components are typically React components that run inside an iframe, communicate with the host via the `window.openai` API, and render inline with the conversation. This guide explains how to structure your component project, bundle it, and integrate it with your MCP server.

Reference the [examples repository on GitHub](https://github.com/openai/openai-apps-sdk-examples) for additional implementation patterns.

## Understand the `window.openai` API

`window.openai` serves as the bridge between your frontend and ChatGPT. Use this reference to understand how to manage data, state, and layout before diving into component scaffolding.

```typescript
declare global {
  interface Window {
    openai: API & OpenAiGlobals;
  }

  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
  }
}

type OpenAiGlobals<
  ToolInput extends UnknownObject = UnknownObject,
  ToolOutput extends UnknownObject = UnknownObject,
  ToolResponseMetadata extends UnknownObject = UnknownObject,
  WidgetState extends UnknownObject = UnknownObject
> = {
  theme: Theme;
  userAgent: UserAgent;
  locale: string;

  // layout
  maxHeight: number;
  displayMode: DisplayMode;
  safeArea: SafeArea;

  // state
  toolInput: ToolInput;
  toolOutput: ToolOutput | null;
  toolResponseMetadata: ToolResponseMetadata | null;
  widgetState: WidgetState | null;
};

type API<WidgetState extends UnknownObject> = {
  /** Calls a tool on your MCP. Returns the full response. */
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<CallToolResponse>;

  /** Triggers a followup turn in the ChatGPT conversation */
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;

  /** Opens an external link, redirects web page or mobile app */
  openExternal(payload: { href: string }): void;

  /** For transitioning an app from inline to fullscreen or pip */
  requestDisplayMode: (args: { mode: DisplayMode }) => Promise<{
    /**
     * The granted display mode. The host may reject the request.
     * For mobile, PiP is always coerced to fullscreen.
     */
    mode: DisplayMode;
  }>;

  setWidgetState: (state: WidgetState) => Promise<void>;
};

// Dispatched when any global changes in the host page
export const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";
export class SetGlobalsEvent extends CustomEvent<{
  globals: Partial<OpenAiGlobals>;
}> {
  readonly type = SET_GLOBALS_EVENT_TYPE;
}

export type CallTool = (
  name: string,
  args: Record<string, unknown>
) => Promise<CallToolResponse>;

export type DisplayMode = "pip" | "inline" | "fullscreen";

export type Theme = "light" | "dark";

export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SafeArea = {
  insets: SafeAreaInsets;
};

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type UserAgent = {
  device: { type: DeviceType };
  capabilities: {
    hover: boolean;
    touch: boolean;
  };
};
```

### useOpenAiGlobal

Many projects wrap `window.openai` access in hooks to maintain testable views. This example hook listens for host `openai:set_globals` events and allows React components to subscribe to individual global values:

```typescript
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K
): OpenAiGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) {
          return;
        }

        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai[key]
  );
}
```

This hook is crucial for making your component reactive to display mode, theme, and props changes from subsequent tool calls.

Read the tool input, output, and metadata:

```typescript
export function useToolInput() {
  return useOpenAiGlobal("toolInput");
}

export function useToolOutput() {
  return useOpenAiGlobal("toolOutput");
}

export function useToolResponseMetadata() {
  return useOpenAiGlobal("toolResponseMetadata");
}
```

### Persist component state, expose context to ChatGPT

"Widget state can be used for preserving data across user sessions, and exposing data to ChatGPT." Anything passed to `setWidgetState` will be shown to the model and hydrated into `window.openai.widgetState`.

Widget state is scoped to the specific widget instance on a single conversation message. When your component calls `window.openai.setWidgetState(payload)`, the host stores that payload under that widget's `message_id/widgetId` pair and rehydrates it only for that widget. The state does not travel across the whole conversation or between different widgets.

Follow-up turns maintain the same widget (and therefore the same state) only when the user submits through that widget's controls—inline follow-ups, PiP composer, or fullscreen composer. If the user types into the main chat composer, the request is treated as a new widget run with a fresh `widgetId` and empty `widgetState`.

Keep the payload focused and well under 4k [tokens](https://platform.openai.com/tokenizer) for optimal performance.

### Trigger server actions

`window.openai.callTool` allows the component to make MCP tool calls directly. Use this for direct manipulations (refresh data, fetch nearby restaurants). Design tools to be idempotent where possible and return updated structured content that the model can reason over in subsequent turns.

Your tool needs to be [marked as able to be initiated by the component](/apps-sdk/build/mcp-server###allow-component-initiated-tool-access).

```typescript
async function refreshPlaces(city: string) {
  await window.openai?.callTool("refresh_pizza_list", { city });
}
```

### Send conversational follow-ups

"Use `window.openai.sendFollowUpMessage` to insert a message into the conversation as if the user asked it."

```typescript
await window.openai?.sendFollowUpMessage({
  prompt: "Draft a tasting itinerary for the pizzerias I favorited.",
});
```

### Request alternate layouts

If the UI needs more space—like maps, tables, or embedded editors—request the host to change the container. "Use `window.openai.requestDisplayMode` to negotiate inline, PiP, or fullscreen presentations."

```typescript
await window.openai?.requestDisplayMode({ mode: "fullscreen" });
// Note: on mobile, PiP may be coerced to fullscreen
```

### Use host-backed navigation

The sandbox runtime mirrors the iframe's history into ChatGPT's UI. Use standard routing APIs—such as React Router—and the host will keep navigation controls in sync with your component.

Router setup (React Router's `BrowserRouter`):

```typescript
export default function PizzaListRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PizzaListApp />}>
          <Route path="place/:placeId" element={<PizzaListApp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

Programmatic navigation:

```typescript
const navigate = useNavigate();

function openDetails(placeId: string) {
  navigate(`place/${placeId}`, { replace: false });
}

function closeDetails() {
  navigate("..", { replace: true });
}
```

## Scaffold the component project

Now that you understand the `window.openai` API, it's time to scaffold your component project.

As best practice, maintain the component code separate from your server logic. A common layout is:

```
app/
  server/            # MCP server (Python or Node)
  web/               # Component bundle source
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js   # Build output
```

Create the project and install dependencies (Node 18+ recommended):

```bash
cd app/web
npm init -y
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

If your component requires drag-and-drop, charts, or other libraries, add them now. Keep the dependency set lean to reduce bundle size.

## Author the React component

Your entry file should mount a component into a `root` element and read initial data from `window.openai.toolOutput` or persisted state.

Reference example apps under the [examples page](./examples#pizzaz-list-source), such as the "Pizza list" app, which displays a list of pizza restaurants.

### Explore the Pizzaz component gallery

The [Apps SDK examples](/apps-sdk/build/examples) provide blueprint components for shaping your own UI:

- **Pizzaz List** – ranked card list with favorites and call-to-action buttons.
- **Pizzaz Carousel** – embla-powered horizontal scroller for media-heavy layouts.
- **Pizzaz Map** – Mapbox integration with fullscreen inspector and host state sync.
- **Pizzaz Album** – stacked gallery view for deep dives on a single place.
- **Pizzaz Video** – scripted player with overlays and fullscreen controls.

Each example demonstrates how to bundle assets, wire host APIs, and structure state for real conversations. Copy the one closest to your use case and adapt the data layer for your tool responses.

### React helper hooks

Using `useOpenAiGlobal` in a `useWidgetState` hook to keep host-persisted widget state aligned with your local React state:

```typescript
export function useWidgetState<T extends WidgetState>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void];
export function useWidgetState<T extends WidgetState>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void];
export function useWidgetState<T extends WidgetState>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void] {
  const widgetStateFromWindow = useWebplusGlobal("widgetState") as T;

  const [widgetState, _setWidgetState] = useState<T | null>(() => {
    if (widgetStateFromWindow != null) {
      return widgetStateFromWindow;
    }

    return typeof defaultState === "function"
      ? defaultState()
      : defaultState ?? null;
  });

  useEffect(() => {
    _setWidgetState(widgetStateFromWindow);
  }, [widgetStateFromWindow]);

  const setWidgetState = useCallback(
    (state: SetStateAction<T | null>) => {
      _setWidgetState((prevState) => {
        const newState = typeof state === "function" ? state(prevState) : state;

        if (newState != null) {
          window.openai.setWidgetState(newState);
        }

        return newState;
      });
    },
    [window.openai.setWidgetState]
  );

  return [widgetState, setWidgetState] as const;
}
```

These hooks simplify reading the latest tool output, layout globals, or widget state directly from React components while delegating persistence back to ChatGPT.

## Bundle for the iframe

Once you have finished writing your React component, build it into a single JavaScript module that the server can inline:

```json
// package.json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

Run `npm run build` to produce `dist/component.js`. If esbuild complains about missing dependencies, confirm you ran `npm install` in the `web/` directory and that your imports match installed package names (e.g., `@react-dnd/html5-backend` vs `react-dnd-html5-backend`).

## Embed the component in the server response

See the [Set up your server docs](/apps-sdk/build/mcp-server#) for instructions on embedding the component in your MCP server response.

Component UI templates are the recommended path for production.

During development you can rebuild the component bundle whenever your React code changes and hot-reload the server.

---

**Previous:** [Set up your server](/apps-sdk/build/mcp-server)

**Next:** [Authenticate users](/apps-sdk/build/auth)
