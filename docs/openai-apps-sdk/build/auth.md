# Authentication for Apps SDK

## Overview

Apps SDK applications requiring user-specific data or write operations need authentication implementation. Organizations can integrate custom authorization servers to connect with existing backends or facilitate inter-user data sharing.

## OAuth 2.1 Implementation

### Architecture Components

The authentication system comprises three elements:

- **Resource server**: Your MCP server exposing tools and validating access tokens per request
- **Authorization server**: Your identity provider (Auth0, Okta, Cognito, or custom) issuing tokens and publishing discovery metadata
- **Client**: ChatGPT acting as the user agent with support for dynamic client registration and PKCE

### Required Specifications

Your implementation must satisfy these MCP authorization spec requirements:

#### Protected Resource Metadata

Host HTTPS endpoint at `GET https://your-mcp.example.com/.well-known/oauth-protected-resource` returning metadata like:

```json
{
  "resource": "https://your-mcp.example.com",
  "authorization_servers": [
    "https://auth.yourcompany.com"
  ],
  "scopes_supported": ["files:read", "files:write"],
  "resource_documentation": "https://yourcompany.com/docs/mcp"
}
```

Critical fields:
- `resource`: canonical HTTPS identifier sent as OAuth query parameter
- `authorization_servers`: issuer URLs for identity provider discovery
- `scopes_supported`: helps ChatGPT explain permission requests

Return `401 Unauthorized` with `WWW-Authenticate` header containing the metadata URL for unauthenticated requests.

#### Authorization Server Discovery

Publish OAuth 2.0 or OpenID Connect metadata at standard locations:
- `https://auth.yourcompany.com/.well-known/oauth-authorization-server`
- `https://auth.yourcompany.com/.well-known/openid-configuration`

Response must include:

```json
{
  "issuer": "https://auth.yourcompany.com",
  "authorization_endpoint": "https://auth.yourcompany.com/oauth2/v1/authorize",
  "token_endpoint": "https://auth.yourcompany.com/oauth2/v1/token",
  "registration_endpoint": "https://auth.yourcompany.com/oauth2/v1/register",
  "jwks_uri": "https://auth.yourcompany.com/oauth2/v1/keys",
  "code_challenge_methods_supported": ["S256"],
  "scopes_supported": ["files:read", "files:write"]
}
```

Essential fields:
- `code_challenge_methods_supported`: must include `S256` for PKCE
- `registration_endpoint`: enables dynamic client registration

#### Resource Parameter Handling

ChatGPT appends `resource=https%3A%2F%2Fyour-mcp.example.com` to authorization and token requests. Configure your authorization server to copy this value into access token claims (typically `aud`) so your MCP server verifies token audience matching.

### OAuth Flow Sequence

1. ChatGPT retrieves protected resource metadata from your MCP server
2. ChatGPT registers dynamically with your authorization server via `registration_endpoint`, obtaining a `client_id`
3. Upon first tool invocation, ChatGPT launches authorization code + PKCE flow; user authenticates and consents
4. ChatGPT exchanges authorization code for access token, attaching it to MCP requests (`Authorization: Bearer <token>`)
5. Your server verifies token on each request before executing the tool

### Token Verification

Assume all tokens are untrusted. Implement these verification steps:

- Fetch signing keys from your authorization server (JWKS) and verify token signature and issuer
- Reject expired or premature tokens (`exp`/`nbf` claims)
- Confirm token was minted for your server (`aud` claim) and contains required scopes
- Run app-specific policy checks; return `401 Unauthorized` with `WWW-Authenticate` header on failure

Both Python and TypeScript MCP SDKs provide helper utilities for token verification without building from scratch.

## Security Scheme Declaration

Declare `securitySchemes` arrays on tools to signal OAuth availability:

**Example (Public + Optional Auth):**

```typescript
server.registerTool(
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"],
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] },
    ],
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Results for ${input.q}` }],
      structuredContent: {},
    };
  }
);
```

**Example (Auth Required):**

```typescript
server.registerTool(
  "create_doc",
  {
    title: "Create Document",
    description: "Make a new doc in your account.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
    },
    securitySchemes: [{ type: "oauth2", scopes: ["docs.write"] }],
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Created doc: ${input.title}` }],
      structuredContent: {},
    };
  }
);
```

Available scheme types:
- `noauth`: callable anonymously
- `oauth2`: requires access token with specified scopes

## Re-authentication Triggers

Return `mcp/www_authenticate` in response metadata when tokens expire, lack required scopes, or become invalid:

```typescript
import { ToolError } from "@modelcontextprotocol/sdk/server/tool-error";

throw new ToolError("Authentication required", {
  _meta: {
    "mcp/www_authenticate":
      'Bearer resource_metadata="https://your-mcp.example.com/.well-known/oauth-protected-resource", scope="files:read"'
  },
});
```

This signals ChatGPT to immediately re-run the OAuth flow for account linking or permission upgrades.

## Recommended Identity Providers

- **Auth0**: Configuration guide available in OpenAI MCPKit repository
- **Stytch**: Comprehensive MCP guides and Apps SDK-specific documentation

## Testing & Rollout Strategy

- Start with development tenant issuing short-lived tokens for rapid iteration
- Gate access to trusted testers before broad rollout
- Use MCP Inspector Auth settings to debug OAuth flow steps
- Plan for token revocation, refresh, and scope changes with helpful error messaging