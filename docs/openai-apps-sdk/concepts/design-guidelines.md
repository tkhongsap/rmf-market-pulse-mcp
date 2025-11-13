# App Design Guidelines

## Overview

Apps are developer-built experiences integrated into ChatGPT that extend functionality through lightweight cards, carousels, and fullscreen views. They maintain conversational flow while adding value without disrupting the interface.

**Resource**: Access the Figma component library for design templates and components.

## Best Practices

### Core Principles

- **Conversational**: Experiences should seamlessly integrate into ChatGPT's flow and UI
- **Intelligent**: Tools leverage conversation context to anticipate user needs
- **Simple**: Each interaction focuses on a single clear action with minimal information
- **Responsive**: Fast, lightweight tools enhance rather than overwhelm conversation
- **Accessible**: Designs support users with assistive technology needs

### Boundaries

ChatGPT controls system-level elements (voice, chrome, styles, navigation, composer). Developers customize content, branding, and actions within this framework.

### Evaluating Use Cases

**Good fits**: "Does this task fit naturally into conversation?" Examples include booking, ordering, scheduling, and quick lookups that are time-bound and action-oriented with clear visual summaries.

**Avoid**: Long-form static content, complex multi-step workflows, ads, sensitive information displays, or duplicating ChatGPT's system functions.

## Display Modes

### Inline

Appears directly in conversation flow before model responses.

**Components**:
- Icon and tool label
- Lightweight embedded content
- Model-generated follow-up suggestions

**Inline Cards**: Single-purpose widgets for confirmations, actions, or visual aids
- Maximum two primary actions
- Auto-fit content without nested scrolling
- No deep navigation or multiple views

**Inline Carousels**: Side-by-side card sets for comparing similar items
- 3–8 items per carousel
- Consistent visual hierarchy
- Single optional CTA per card

### Fullscreen

Immersive experiences for multi-step workflows and rich exploration, with ChatGPT's composer remaining accessible for continued conversation.

**Best for**: Complex tasks, explorable maps, editing canvases, detailed content browsing

**Key feature**: Conversational context persists alongside fullscreen content

### Picture-in-Picture (PiP)

Persistent floating window for parallel activities like games or live sessions that can update based on chat input.

**Best for**: Activities running alongside conversation (games, collaboration, live data)

## Visual Design Guidelines

### Color

- Use system-defined palettes for text, icons, and dividers
- Apply brand accent colors to primary buttons and badges only
- Avoid custom gradients or background color overrides

### Typography

- Inherit platform-native system fonts (SF Pro on iOS, Roboto on Android)
- Use system sizing for headings and body text
- Avoid custom fonts and excessive size variation

### Spacing & Layout

- Apply consistent grid spacing and padding
- Maintain visual hierarchy with headline, supporting text, and CTA
- Respect system corner radius specifications

### Icons & Imagery

- Use monochromatic, outlined system icons or compatible custom iconography
- Don't include logos within responses (ChatGPT appends branding)
- Maintain enforced aspect ratios for all imagery

### Accessibility Requirements

- Maintain WCAG AA contrast ratios for text and backgrounds
- Provide alt text for all images
- Support text resizing without layout breakage

## Tone & Proactivity

### Communication Strategy

ChatGPT establishes overall voice; partners provide contextual content within that framework. Content should remain concise, relevant, and free of jargon or promotional language.

### Proactivity Guidelines

**Permitted**: Context-driven nudges tied to user intent (order readiness, delivery updates)

**Prohibited**: Unsolicited promotions, upsells, or re-engagement attempts without clear context

**Transparency requirement**: Always indicate why and when tools resurface information.