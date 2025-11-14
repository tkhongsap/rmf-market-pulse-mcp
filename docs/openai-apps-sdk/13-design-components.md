# Design Components

## Overview

This page guides developers through planning and designing UI components for ChatGPT apps. The section emphasizes that "UI components are the human-visible half of your connector" and explains how proper planning ensures servers return appropriately structured data.

## Key Sections

### Why Components Matter

Components enable users to view/edit data inline, expand to fullscreen when necessary, and maintain synchronized context between text prompts and UI interactions.

### Available Component Examples

The documentation references a repository with reusable patterns:

- **List** - Dynamic collections with empty-state management
- **Map** - Geographical data with marker clustering
- **Album** - Media grids with fullscreen capabilities
- **Carousel** - Featured content with gesture support
- **Shop** - Product browsing with checkout options

Each includes code samples in the openai-apps-sdk-examples repository.

### Design Considerations

**User Interaction Clarification:**
- Read-only vs. editable functionality
- Single-shot vs. multi-turn persistence
- Inline vs. fullscreen presentation modes

**Data Requirements:**
- Structured JSON payloads for component parsing
- Initial state via `window.openai.toolOutput`
- Authentication context considerations

**Responsive Design:**
- Adaptive breakpoints for mobile/desktop
- Dark mode support and accessible color schemes
- Keyboard navigation focus states

**State Management:**
- Component state via `window.openai.setWidgetState`
- Server-side authoritative data storage
- Model message synchronization

**Observability:**
- Analytics instrumentation
- Tool-call ID logging
- Fallback error handling

The page concludes by directing readers to implementation guidance in the "Build a custom UX" section.

---

**Source URL:** https://developers.openai.com/apps-sdk/plan/components
**Extracted:** 2025-11-14
