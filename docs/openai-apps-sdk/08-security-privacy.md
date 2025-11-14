# Security & Privacy

## Overview
This page outlines security and privacy guidelines for OpenAI's Apps SDK, emphasizing responsible development practices when building ChatGPT applications.

## Key Principles

The documentation establishes three foundational approaches:

1. **Least privilege** – Request only necessary scopes, storage access, and network permissions
2. **Explicit user consent** – Ensure transparency when users authorize account linking or write actions
3. **Defense in depth** – Assume malicious inputs will occur; validate rigorously and maintain audit logs

## Data Handling Practices

Developers should implement these data management strategies:

- Include only required information in component properties, avoiding embedded secrets
- Establish clear data retention policies and honor deletion requests promptly
- Redact personally identifiable information from logs while preserving correlation IDs for troubleshooting

## Injection Prevention & Write Operations

To address prompt injection risks, the guidance recommends:

- Regularly review tool descriptions to discourage misuse
- Perform server-side validation regardless of model-provided inputs
- Require human approval for irreversible operations

## Network Security

Widgets operate within a sandboxed iframe with strict Content Security Policy restrictions, preventing access to APIs like `window.alert` or `navigator.clipboard`. Fetch requests must comply with CSP requirements. Server-side code follows standard hosting environment restrictions.

## Authentication Standards

Implement OAuth 2.1 with PKCE, verify scopes on each tool call, and respond with 401 status codes for invalid tokens. Avoid storing long-lived secrets when built-in identity is available.

## Operational Readiness

Conduct security reviews before launch, monitor for suspicious patterns, and maintain current dependencies to reduce supply chain vulnerabilities.

---

**Source URL:** https://developers.openai.com/apps-sdk/guides/security-privacy
**Extracted:** 2025-11-14
