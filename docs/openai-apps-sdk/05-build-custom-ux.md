# Build a Custom UX

## Overview

The Apps SDK enables developers to create custom UI components and app pages that render as React components within an iframe. These components communicate with ChatGPT through the `window.openai` API and display inline within conversations.

## Key API Bridge: `window.openai`

The `window.openai` interface provides essential functionality:

**Core Methods:**
- `callTool()` – Executes MCP tools and retrieves responses
- `sendFollowUpMessage()` – Inserts conversational prompts into the chat
- `requestDisplayMode()` – Switches between inline, picture-in-picture, or fullscreen layouts
- `setWidgetState()` – Persists and exposes component data to the model
- `openExternal()` – Navigates to external URLs

**Global Properties:**
- Theme, locale, and device information
- Layout constraints (maxHeight, displayMode, safeArea)
- Tool input/output data and widget state

## Helper Pattern: `useOpenAiGlobal`

The documentation recommends wrapping `window.openai` access in React hooks for testability. This pattern subscribes components to host events whenever globals change, keeping UI reactive to display mode shifts, theme changes, or subsequent tool invocations.

## State Management

Widget state persists within individual message instances and rehydrates for that specific widget. The system keeps state isolated—new conversations or main chat submissions create fresh widget instances. Payload recommendations suggest maintaining state under 4,000 tokens for optimal performance.

## Project Structure

Typical layout separates server code from frontend:
```
app/
  server/     # MCP implementation
  web/        # React component source
```

## Component Examples

The SDK provides reference implementations:
- **List** – Ranked cards with favorites and actions
- **Carousel** – Horizontal media scrollers
- **Map** – Mapbox integration with fullscreen support
- **Album** – Stacked gallery views
- **Video** – Player with overlay controls

## Building for Production

Components bundle via esbuild into single JavaScript modules that servers embed directly. The build process combines React, dependencies, and custom code into optimized output suitable for iframe delivery.

---

**Source URL:** https://developers.openai.com/apps-sdk/build/custom-ux
**Extracted:** 2025-11-14
