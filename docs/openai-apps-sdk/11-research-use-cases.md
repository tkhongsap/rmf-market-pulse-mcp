# Research Use Cases

## Overview

This page guides developers through identifying and prioritizing use cases for Apps SDK applications before implementation begins.

## Key Sections

### Why Start with Use Cases

The foundation emphasizes that successful Apps SDK apps require understanding what users want to accomplish. Since "discovery in ChatGPT is model-driven," aligning tool metadata and descriptions with user prompts determines whether the assistant selects your app. This planning phase helps map which tasks the model should recognize and what outcomes the app can deliver.

### Gather Inputs

Three research areas inform use case development:

- **User research**: Interviews and support tickets reveal jobs-to-be-done, terminology, and current data sources
- **Prompt sampling**: Document both direct requests ("show my Jira board") and indirect intents ("what blocks our launch?")
- **System constraints**: Note compliance requirements, offline data, or rate limits affecting tool design

Developers should document user personas, context for reaching ChatGPT, and define success criteria for each scenario.

### Define Evaluation Prompts

Creating a test set enables decision-boundary refinement. For each use case:

1. Author minimum five direct prompts referencing product names or expected verbs
2. Draft five indirect prompts where users state goals without naming the tool
3. Add negative prompts that should not trigger the app

These become benchmarks during the metadata optimization phase.

### Scope Minimum Lovable Feature

For each use case, determine:

- Information required for inline display
- Which actions need write access and confirmation gates
- State persistence requirements between conversation turns

Rank scenarios by user impact and development effort, typically shipping one priority scenario before expanding.

### Translate Use Cases Into Tooling

Document the tool contract including parameters (keeping explicit with enums), outputs (structured content with IDs and timestamps), and component intent (viewer, editor, or workspace). Stakeholder review—particularly legal teams—validates requirements before building.

### Prepare for Iteration

Plan for post-launch refinement:

- Weekly review of prompt accuracy logs
- Early tester feedback collection in developer mode
- Analytics tracking for tool calls and component interactions

---

**Next Step**: [Define tools](/apps-sdk/plan/tools)

---

**Source URL:** https://developers.openai.com/apps-sdk/plan/use-case
**Extracted:** 2025-11-14
