# Research Use Cases

## Overview

This section guides developers through identifying and prioritizing Apps SDK use cases before building—a critical first step for successful ChatGPT app integration.

## Why Start with Use Cases

The discovery mechanism in ChatGPT is model-driven. The assistant selects your app when "tool metadata, descriptions, and past usage align with the user's prompt and memories." This requires understanding the specific tasks users want to accomplish and the outcomes your app delivers.

## Key Research Activities

### Gather Inputs

Begin with research across three dimensions:

- **User interviews and support requests** – Document the jobs users need done, the language they use, and their current data sources
- **Prompt sampling** – Collect both explicit requests ("show my Jira board") and implied needs ("what's blocking our launch?")
- **System constraints** – Identify compliance rules, offline data requirements, or rate limits affecting later tool design

Document each scenario with the user persona, context, and a single-sentence success definition.

### Define Evaluation Prompts

Create a "golden set" of test prompts for iteration:

1. Write at least five direct prompts referencing your product or expected terminology
2. Draft five indirect prompts where users state goals without naming tools
3. Add negative test cases that should *not* trigger your app to measure precision

This set supports the metadata optimization process while preventing overfitting.

### Scope the Minimum Lovable Feature

For each use case, decide:

- What information needs inline visibility to answer or enable action
- Which operations require write access and confirmation gates
- What state persists between conversation turns (filters, selections, drafts)

Prioritize based on impact and effort; ship one high-confidence scenario first.

### Translate to Tools

Draft the tool contract with:

- **Inputs**: Safe parameters with explicit enums for constrained options
- **Outputs**: Structured content including machine-readable fields (IDs, timestamps, status)
- **Component intent**: Whether you need viewers, editors, or multiturn workspaces

Stakeholder review—especially legal and compliance—prevents costly redesigns later.

## Iteration Planning

Schedule regular review cycles:

- Weekly prompt accuracy logging
- Early tester feedback from developer mode
- Analytics on tool calls and component interactions

These artifacts inform roadmaps, changelogs, and success metrics post-launch.

---

**Next step:** [Define Tools](/apps-sdk/plan/tools)