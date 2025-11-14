# Troubleshooting

## Overview

The documentation provides guidance for resolving issues across different layers of Apps SDK applications: server infrastructure, widget components, and ChatGPT client interactions.

## Key Problem Categories

**Server-side challenges** include missing tool listings, missing components despite structured content, schema validation errors, and sluggish response times. Users should verify MCP endpoint connectivity, confirm output template registration with proper MIME types, and ensure model schemas align with advertised specifications.

**Widget rendering problems** encompass loading failures, state persistence issues, and mobile layout difficulties. The guide recommends checking browser console for CSP violations, implementing `window.openai.setWidgetState` calls after updates, and respecting viewport constraints via `displayMode` and `maxHeight` properties.

**Discovery issues** arise when tools don't trigger appropriately or incorrect tools get selected. Solutions involve refining tool descriptions using action-oriented language, clarifying distinctions between similar capabilities, and optimizing directory metadata.

**Authentication failures** typically manifest as 401 errors or dynamic registration breakdowns. The documentation advises including `WWW-Authenticate` headers in error responses and validating OAuth endpoint configurations.

## Escalation Process

When standard troubleshooting steps fail, developers should compile diagnostic information including server logs, component console errors, and ChatGPT transcript records before contacting OpenAI partner support.

---

**Source URL:** https://developers.openai.com/apps-sdk/deploy/troubleshooting
**Extracted:** 2025-11-14
