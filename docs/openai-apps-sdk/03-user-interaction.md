# User Interaction

## Overview

This page describes how users discover, engage with, and manage apps available in ChatGPT, covering three main aspects: discovery mechanisms, entry points, and best practices for app developers.

## Discovery

Discovery encompasses the various ways users and the model learn about apps and their capabilities through natural language, browsing, and proactive features. Effective discovery requires proper metadata and usage history management.

### Named Mention

When users begin a prompt with your app's name, the system automatically surfaces it in responses. However, if the app name isn't mentioned upfront, it may still appear through in-conversation discovery mechanisms.

### In-Conversation Discovery

The model evaluates several factors when deciding whether to suggest your app:

- **Conversation context** – chat history, prior tool results, memories, and stated preferences
- **Brand mentions and citations** – explicit requests or appearance in search results
- **Tool metadata** – names, descriptions, and parameter documentation from your MCP server
- **User linking state** – whether the user has authorized your app

To improve discoverability, developers should:

1. Use action-oriented tool descriptions (for example: "Use this when the user wants to view their kanban board")
2. Include clear component descriptions in resource UI template metadata
3. Test prompts regularly and monitor precision and recall metrics

### Directory

Users can browse available apps in a dedicated directory featuring app names, icons, descriptions, tags, and optional onboarding materials.

## Entry Points

Once linked, apps appear through several surfaces:

### In-Conversation Entry

Linked tools remain active in the model's context. The assistant determines whether to invoke your tool based on conversation state and supplied metadata. Recommendations include maintaining action-oriented descriptions, returning structured content with stable identifiers, and providing metadata hints for streamlined confirmation and rendering.

### Launcher

Accessible via the composer's + button, the launcher represents a high-intent entry point for explicit app selection. Features include succinct labeling, icons, deep linking options, and context-aware ranking based on conversation signals.

---

**Source URL:** https://developers.openai.com/apps-sdk/concepts/user-interaction
**Extracted:** 2025-11-14
