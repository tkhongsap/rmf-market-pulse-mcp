# Security & Privacy

## Overview

This guide addresses security and privacy considerations for the Apps SDK, establishing foundational principles for treating connectors as production software with access to user data and external APIs.

## Core Principles

The documentation emphasizes three key tenets:

1. **Least Privilege** – Request only necessary scopes, storage access, and network permissions
2. **Explicit User Consent** – Ensure users understand account linking and write access implications; leverage ChatGPT confirmation prompts for potentially destructive operations
3. **Defense in Depth** – Assume prompt injection and malicious inputs will occur; validate comprehensively and maintain audit logs

## Data Handling Practices

The guide recommends:

- Including only essential data for the current prompt in structured content; avoid embedding secrets or tokens in component properties
- Publishing a clear retention policy and respecting user deletion requests promptly
- Redacting personally identifiable information before logging; store correlation IDs for debugging but avoid raw prompt text unless critical

## Mitigating Prompt Injection Risks

When using developer mode with full MCP access:

- Review tool descriptions regularly to discourage misuse through clear language like "Do not use to delete records"
- Validate all inputs server-side regardless of model-provided data
- Require human confirmation for irreversible operations
- Share injection testing prompts with QA teams to identify vulnerabilities early

## Network Security

Widgets operate within a sandboxed iframe with strict Content Security Policy restrictions, preventing access to privileged browser APIs. Standard fetch requests must comply with CSP guidelines. Server-side code follows hosting environment restrictions and standard outbound call practices (TLS verification, retries, timeouts).

## Authentication Standards

- Implement OAuth 2.1 with PKCE and dynamic client registration for external integrations
- Verify and enforce scopes on every tool call; reject expired or malformed tokens with `401` responses
- Avoid long-lived secrets with built-in identity; use provided auth context

## Operational Readiness

- Conduct security reviews before launch, particularly with regulated data
- Monitor for anomalous traffic and set alerts for authentication failures
- Maintain current third-party dependencies to address supply chain risks