# Optimize Metadata

## Overview
This guide helps developers improve ChatGPT connector discovery through strategic metadata crafting.

## Key Sections

### Why Metadata Matters
According to the documentation, "ChatGPT decides when to call your connector based on the metadata you provide." Well-designed names, descriptions, and parameter documentation increase relevance and reduce unintended activations.

### Building a Golden Prompt Dataset
The guide recommends assembling a labeled test collection containing:
- Prompts explicitly naming your product
- Requests describing desired outcomes without naming your tool
- Cases where built-in or alternative tools should handle requests

Document expected behavior for each scenario to enable regression testing.

### Metadata Best Practices
For each tool, provide:
- **Name**: Combine domain with action (e.g., `calendar.create_event`)
- **Description**: Begin with "Use this when…" and specify prohibited uses
- **Parameter documentation**: Include argument descriptions, examples, and enums
- **Read-only annotation**: Mark non-mutating tools with `readOnlyHint: true`

App-level metadata should include descriptions, icons, and sample prompts showcasing primary use cases.

### Evaluation Process
1. Connect your tool in developer mode
2. Test against your golden prompt set
3. Record tool selection, passed arguments, and component rendering
4. Measure precision (correct tool selected) and recall (tool runs when appropriate)

### Iteration Strategy
Modify one metadata field at a time. Maintain revision logs with timestamps and test results. Prioritize high precision on negative test cases before optimizing recall.

### Ongoing Maintenance
Monitor tool-call analytics weekly. Update descriptions based on user feedback and misconceptions. Periodically replay prompts, especially after adding tools or modifying structured fields.

---

**Source URL:** https://developers.openai.com/apps-sdk/guides/optimize-metadata
**Extracted:** 2025-11-14
