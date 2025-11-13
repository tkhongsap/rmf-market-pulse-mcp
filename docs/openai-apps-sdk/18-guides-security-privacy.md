# Security & Privacy

Security and privacy considerations for Apps SDK.

## Principles

Apps SDK provides access to user information, external APIs, and modification capabilities. Treat every integration as production-grade software by following these guidelines:

- **Least privilege** — Request only the permissions, storage access, and network capabilities required for functionality.
- **Explicit user consent** — Ensure users understand when connecting accounts or authorizing changes. Utilize ChatGPT's built-in confirmation features for potentially irreversible actions.
- **Defense in depth** — Anticipate prompt injection attempts and malicious inputs reaching your backend. Validate all inputs and maintain comprehensive audit records.

## Data Handling

- **Structured content** — Include only data necessary for the current operation. Avoid embedding credentials or tokens in component properties.
- **Storage** — Define retention periods for user information and publish your retention policy. Honor deletion requests without delay.
- **Logging** — Exclude personally identifiable information from log files. Retain correlation IDs for troubleshooting while avoiding raw prompt text storage unless essential.

## Prompt Injection and Write Actions

Developer mode grants complete MCP capabilities, including modification tools. Reduce exposure through:

- Regularly reviewing tool descriptions to discourage misuse (e.g., "Do not use to delete records").
- Validating all inputs server-side regardless of model-provided values.
- Requiring human approval for irreversible operations.

Collaborate with QA teams to test injection vulnerabilities systematically.

## Network Access

Widgets execute within sandboxed iframes with restrictive Content Security Policy. They cannot invoke privileged browser functions like `window.alert`, `window.prompt`, `window.confirm`, or `navigator.clipboard`. Standard HTTP requests must comply with CSP restrictions. Contact your OpenAI partner for domain allow-listing requests.

Backend code operates without network restrictions beyond hosting-layer controls. Implement standard security practices for outbound communications (certificate verification, retry logic, connection timeouts).

## Authentication & Authorization

- Implement OAuth 2.1 with PKCE and dynamic client registration for external account connections.
- Validate and enforce permissions on each tool invocation. Return `401` responses for expired or invalid tokens.
- For native identity systems, avoid long-lived secret storage; use supplied auth context instead.

## Operational Readiness

- Conduct security assessments before launch, particularly when handling sensitive or regulated information.
- Track unusual traffic and establish notifications for repeated errors or failed authentication events.
- Update third-party packages (frameworks, libraries, build systems) regularly to address supply chain vulnerabilities.

Security and privacy form the foundation of user confidence. Incorporate them throughout planning, development, and deployment phases.
