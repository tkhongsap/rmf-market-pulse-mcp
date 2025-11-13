# Apps SDK Reference

## Overview

This reference document covers the API and SDK components for building apps that extend ChatGPT through the Apps SDK framework.

## `window.openai` Component Bridge

The component bridge enables custom UI interactions. For detailed implementation guidance, refer to the custom UX documentation.

## Tool Descriptor Parameters

### Standard Fields

Tool descriptions should include fields specified in the MCP specification for tools.

### `_meta` Fields on Tool Descriptors

Required metadata fields enhance tool functionality:

| Key | Location | Type | Limits | Purpose |
|-----|----------|------|--------|---------|
| `_meta["securitySchemes"]` | Tool descriptor | array | — | Backward compatibility for clients reading metadata |
| `_meta["openai/outputTemplate"]` | Tool descriptor | string (URI) | — | HTML component template resource URI |
| `_meta["openai/widgetAccessible"]` | Tool descriptor | boolean | default: false | Enable component-to-tool calls via client bridge |
| `_meta["openai/toolInvocation/invoking"]` | Tool descriptor | string | ≤64 chars | Status text during tool execution |
| `_meta["openai/toolInvocation/invoked"]` | Tool descriptor | string | ≤64 chars | Status text after tool completion |

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

### Annotations

Mark tools as read-only using annotations:

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `readOnlyHint` | boolean | Optional | Signals read-only status for model planning |

### Example Annotation

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

## Component Resource `_meta` Fields

Set these keys on resource templates to guide ChatGPT's rendering behavior:

| Key | Location | Type | Purpose |
|-----|----------|------|---------|
| `_meta["openai/widgetDescription"]` | Resource contents | string | Human-readable summary reducing redundant narration |
| `_meta["openai/widgetPrefersBorder"]` | Resource contents | boolean | Hint to render inside bordered card |
| `_meta["openai/widgetCSP"]` | Resource contents | object | CSP snapshot with domain arrays |
| `_meta["openai/widgetDomain"]` | Resource contents | string (origin) | Optional dedicated subdomain |

### Example Resource Registration

```javascript
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: componentHtml,
      _meta: {
        "openai/widgetDescription": "Interactive UI for zoo animals.",
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

Tool results support the following fields:

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `structuredContent` | object | Optional | Must match declared outputSchema |
| `content` | string or Content[] | Optional | Surfaced to model and component |
| `_meta` | object | Optional | Delivered only to component |

Only `structuredContent` and `content` appear in transcripts; `_meta` remains hidden from the model.

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

### Error Tool Result

Use this key for error handling:

| Key | Purpose | Type | Notes |
|-----|---------|------|-------|
| `_meta["mcp/www_authenticate"]` | Error result | string or string[] | RFC 7235 challenges for OAuth |

## `_meta` Fields Provided by Client

The client provides these fields during operations:

| Key | When Provided | Type | Purpose |
|-----|---------------|------|---------|
| `_meta["openai/locale"]` | Initialize + tool calls | string (BCP 47) | Requested locale for localization |
| `_meta["openai/userAgent"]` | Tool calls | string | User agent hint for analytics |
| `_meta["openai/userLocation"]` | Tool calls | object | Coarse location data (city, region, country, timezone, coordinates) |
| `_meta["openai/subject"]` | Tool calls | string | Anonymized user ID for rate limiting |

**Important:** Location and user agent hints are advisory; never rely on them for authorization decisions.

### Example Client Metadata Usage

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