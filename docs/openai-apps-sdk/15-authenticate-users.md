# Authenticate Users

## Overview
The Apps SDK authentication guide explains how to implement OAuth 2.1 flows for MCP servers that need to authenticate ChatGPT users before exposing sensitive data or write operations.

## Key Components

The system requires three participants:
- **Resource server**: Your MCP server that validates access tokens
- **Authorization server**: Your identity provider (Auth0, Okta, Cognito, etc.)
- **Client**: ChatGPT acting on the user's behalf

## Core Requirements

Your implementation must:

1. **Host protected resource metadata** at a `.well-known/oauth-protected-resource` endpoint declaring your resource identifier, supported authorization servers, and available scopes

2. **Publish OAuth discovery metadata** from your authorization server (OAuth 2.0 or OpenID Connect format) that includes authorization, token, and registration endpoints

3. **Echo the `resource` parameter** throughout the OAuth flow so tokens are bound to your specific server

4. **Advertise PKCE support** by including `S256` in `code_challenge_methods_supported`

## OAuth Flow Steps

1. ChatGPT queries your server's protected resource metadata
2. ChatGPT registers dynamically with your authorization server to get a `client_id`
3. User authenticates and grants requested scopes
4. ChatGPT exchanges authorization code for an access token
5. Your server verifies the token before executing each tool

## Token Verification

When tools receive requests, you must:
- Validate the JWT signature using published signing keys
- Confirm issuer (`iss`) and audience (`aud`) match expectations
- Check token expiration and validity dates
- Enforce required scopes
- Return `401 Unauthorized` with `WWW-Authenticate` challenges on failure

## Signaling Authentication to ChatGPT

Use `securitySchemes` arrays on tools to declare support:
- `noauth`: Callable anonymously
- `oauth2`: Requires OAuth with specified scopes

For runtime re-authentication (expired tokens, missing scopes), respond with `_meta["mcp/www_authenticate"]` to trigger ChatGPT's OAuth flow refresh.

## Provider Support

Stytch and Auth0 both offer MCP-specific configuration guides. Any OAuth 2.1 provider supporting dynamic client registration can work if properly configured.

---

**Source URL:** https://developers.openai.com/apps-sdk/build/auth
**Extracted:** 2025-11-14
