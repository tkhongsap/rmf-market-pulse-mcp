# Apps SDK Reference

## Overview

API and SDK reference documentation for the OpenAI Apps SDK, covering component bridges, tool descriptors, and integration patterns.

## `window.openai` Component Bridge

For details on implementing custom user interfaces, see the [build a custom UX](/apps-sdk/build/custom-ux) guide.

## Tool Descriptor Parameters

Standard tool descriptions should include fields specified in the [Model Context Protocol tool specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool).

### Meta Fields on Tool Descriptors

Required `_meta` fields include:

| Field | Type | Purpose |
|-------|------|---------|
| `securitySchemes` | array | Backward-compatible security scheme mirror |
| `openai/outputTemplate` | string (URI) | HTML template resource location |
| `openai/widgetAccessible` | boolean | Enable component-to-tool bridge calls |
| `openai/toolInvocation/invoking` | string (≤64 chars) | Status text during tool execution |
| `openai/toolInvocation/invoked` | string (≤64 chars) | Status text after completion |

### Example Tool Registration

```javascript
server.registerTool(
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"]
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] }
    ],
    _meta: {
      securitySchemes: [
        { type: "noauth" },
        { type: "oauth2", scopes: ["search.read"] }
      ],
      "openai/outputTemplate": "ui://widget/story.html",
      "openai/toolInvocation/invoking": "Searching…",
      "openai/toolInvocation/invoked": "Results ready"
    }
  },
  async ({ q }) => performSearch(q)
);
```

### Tool Annotations

Use the `readOnlyHint` annotation to label read-only operations:

```javascript
server.registerTool(
  "list_saved_recipes",
  {
    title: "List saved recipes",
    description: "Returns the user's saved recipes without modifying them.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true }
  },
  async () => fetchSavedRecipes()
);
```

## Component Resource Meta Fields

Configure resource templates with these `_meta` keys:

| Field | Type | Purpose |
|-------|------|---------|
| `openai/widgetDescription` | string | Human-readable summary for the model |
| `openai/widgetPrefersBorder` | boolean | Hint for bordered card rendering |
| `openai/widgetCSP` | object | CSP configuration with domain arrays |
| `openai/widgetDomain` | string (origin) | Optional custom subdomain |

### Example Resource Registration

```javascript
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: componentHtml,
      _meta: {
        "openai/widgetDescription": "Renders an interactive UI showcasing the zoo animals returned by get_zoo_animals.",
        "openai/widgetPrefersBorder": true,
        "openai/widgetCSP": {
          connect_domains: [],
          resource_domains: ["https://persistent.oaistatic.com"],
        },
        "openai/widgetDomain": "https://chatgpt.com",
      },
    },
  ],
}));
```

## Tool Results

Tool results support these fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `structuredContent` | object | Optional | Must match declared `outputSchema` |
| `content` | string or `Content[]` | Optional | Visible to model and component |
| `_meta` | object | Optional | Component-only metadata, hidden from model |

Only `structuredContent` and `content` appear in conversation transcripts. Use `_meta` for component hydration data.

### Example Tool Result

```javascript
server.registerTool(
  "get_zoo_animals",
  {
    title: "get_zoo_animals",
    inputSchema: { count: z.number().int().min(1).max(20).optional() },
    _meta: { "openai/outputTemplate": "ui://widget/widget.html" }
  },
  async ({ count = 10 }) => {
    const animals = generateZooAnimals(count);

    return {
      structuredContent: { animals },
      content: [{ type: "text", text: `Here are ${animals.length} animals.` }],
      _meta: {
        allAnimalsById: Object.fromEntries(animals.map((animal) => [animal.id, animal]))
      }
    };
  }
);
```

### Error Tool Results

Return authentication errors with:

| Field | Type | Purpose |
|-------|------|---------|
| `_meta["mcp/www_authenticate"]` | string or array | RFC 7235 OAuth challenges |

## Client-Provided Meta Fields

The client includes these `_meta` fields:

| Field | Context | Type | Purpose |
|-------|---------|------|---------|
| `openai/locale` | Initialize + calls | string (BCP 47) | Requested locale preference |
| `openai/userAgent` | Tool calls | string | User agent hint for analytics |
| `openai/userLocation` | Tool calls | object | Coarse location data (city, region, country, timezone, coordinates) |
| `openai/subject` | Tool calls | string | Anonymized user ID for rate limiting |

**Note:** Location and user agent data are hints only. Servers must never rely on them for authorization and should tolerate their absence.

### Example Usage

```javascript
server.registerTool(
  "recommend_cafe",
  {
    title: "Recommend a cafe",
    inputSchema: { type: "object" }
  },
  async (_args, { _meta }) => {
    const locale = _meta?.["openai/locale"] ?? "en";
    const location = _meta?.["openai/userLocation"]?.city;

    return {
      content: [{ type: "text", text: formatIntro(locale, location) }],
      structuredContent: await findNearbyCafes(location)
    };
  }
);
```
