# Apps SDK Reference

## Overview

This reference guide documents the API and SDK components for OpenAI's Apps SDK, including the component bridge, tool descriptors, and metadata fields.

## window.openai Component Bridge

The `window.openai` component bridge enables custom UX implementations. Documentation is available in the [build a custom UX section](/apps-sdk/build/custom-ux).

## Tool Descriptor Parameters

Tool descriptions should include standard fields per the [Model Context Protocol specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool).

### Required `_meta` Fields

Tools must include these metadata fields:

| Field | Type | Limits | Purpose |
|-------|------|--------|---------|
| `_meta["securitySchemes"]` | array | — | Back-compatibility for legacy clients |
| `_meta["openai/outputTemplate"]` | string (URI) | — | Resource URI for component HTML template |
| `_meta["openai/widgetAccessible"]` | boolean | default `false` | Enable component→tool calls via bridge |
| `_meta["openai/toolInvocation/invoking"]` | string | ≤ 64 chars | Status text during tool execution |
| `_meta["openai/toolInvocation/invoked"]` | string | ≤ 64 chars | Status text after completion |

### Tool Registration Example

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

Mark tools as read-only using this annotation:

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `readOnlyHint` | boolean | Optional | Signals read-only status for model planning |

**Example:**

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

These metadata keys help ChatGPT frame rendered iframes without exposing data to other clients:

| Field | Type | Purpose |
|-------|------|---------|
| `_meta["openai/widgetDescription"]` | string | Human-readable summary shown to model |
| `_meta["openai/widgetPrefersBorder"]` | boolean | Hint for bordered card rendering |
| `_meta["openai/widgetCSP"]` | object | CSP snapshot with `connect_domains` and `resource_domains` |
| `_meta["openai/widgetDomain"]` | string (origin) | Optional dedicated subdomain |

**Resource Registration Example:**

```javascript
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: componentHtml,
      _meta: {
        "openai/widgetDescription": "Renders interactive UI for zoo animals.",
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
| `structuredContent` | object | Optional | Surfaced to model and component; must match `outputSchema` |
| `content` | string or `Content[]` | Optional | Surfaced to model and component |
| `_meta` | object | Optional | Delivered to component only; hidden from model |

**Tool Result Example:**

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
        allAnimalsById: Object.fromEntries(animals.map((a) => [a.id, a]))
      }
    };
  }
);
```

### Error Tool Results

Use this field for error handling:

| Field | Type | Purpose |
|-------|------|---------|
| `_meta["mcp/www_authenticate"]` | string or string[] | RFC 7235 challenges to trigger OAuth |

## Client-Provided `_meta` Fields

The client provides these fields during operations:

| Field | When Provided | Type | Purpose |
|-------|---------------|------|---------|
| `_meta["openai/locale"]` | Initialize + tool calls | string (BCP 47) | Requested locale |
| `_meta["openai/userAgent"]` | Tool calls | string | User agent hint for analytics |
| `_meta["openai/userLocation"]` | Tool calls | object | Coarse location hint |
| `_meta["openai/subject"]` | Tool calls | string | Anonymized user ID for rate limiting |

**Caution:** These are hints only; servers must never rely on them for authorization and must tolerate their absence.

**Locale-Aware Tool Example:**

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

---

**Source URL:** https://developers.openai.com/apps-sdk/reference
**Extracted:** 2025-11-14
