# App Design Guidelines

## Overview

Apps extend ChatGPT's capabilities through "lightweight cards, carousels, fullscreen views, and other display modes that integrate seamlessly into ChatGPT's interface."

**Resource**: [Figma component library](https://www.figma.com/community/file/1560064615791108827/apps-in-chatgpt-components-templates)

## Best Practices

### Core Principles

- **Conversational**: Experiences should feel like natural extensions of ChatGPT
- **Intelligent**: Tools should be context-aware and anticipate user intent
- **Simple**: Each interaction focuses on a single clear action with minimal information
- **Responsive**: Tools should feel fast and lightweight
- **Accessible**: Designs must support users relying on assistive technologies

### Boundaries

"ChatGPT controls system-level elements such as voice, chrome, styles, navigation, and composer. Developers provide value by customizing content, brand presence, and actions inside the system framework."

### Good Use Cases

Apps should answer "yes" to most questions:

- Does this task fit naturally into conversation? (booking, ordering, scheduling, lookups)
- Is it time-bound or action-oriented? (short to medium duration with clear endpoints)
- Is the information valuable in the moment? (users can act immediately)
- Can it be summarized visually and simply? (one card, few details, clear CTA)
- Does it extend ChatGPT in an additive or differentiated way?

### Poor Use Cases

Avoid tools that:

- Display long-form or static content better suited for websites
- Require complex multi-step workflows exceeding inline/fullscreen modes
- Use space for ads, upsells, or irrelevant messaging
- Surface sensitive or private information in visible cards
- Duplicate ChatGPT's system functions

## Display Modes

### Inline

Appears directly in conversation flow before the model response. Every app initially appears inline.

**Layout Components**:
- Icon & tool call with app name and icon
- Lightweight display with embedded content
- Follow-up model-generated response suggesting edits or next steps

#### Inline Card

Single-purpose widgets for quick confirmations, simple actions, or visual aids.

**When to use**:
- Single action or decision
- Small amounts of structured data (maps, order summaries, status)
- Fully self-contained widgets (audio players, scorecards)

**Layout**:
- Title (for document-based content or items with parent elements)
- Expand button (for fullscreen with rich media or interactivity)
- Show more disclosure (for multiple results)
- Edit controls
- Primary actions (maximum two, at bottom)

**Interaction**:
- States persist edits
- Simple direct edits support quick modifications without model prompts
- Dynamic layout expands height up to mobile viewport

**Rules of thumb**:
- Maximum two primary actions per card
- No deep navigation, tabs, or drill-ins within cards
- No nested scrolling; auto-fit content
- No duplicative inputs replicating ChatGPT features

#### Inline Carousel

Side-by-side card sets for quick scanning and selection from multiple options.

**When to use**:
- Small lists of similar items (restaurants, playlists, events)
- Items with visual content exceeding simple row format

**Layout**:
- Image (always included)
- Title (typically included)
- Metadata (max two lines of supporting information)
- Badge (optional, for supporting context)
- Actions (single clear CTA per item)

**Rules of thumb**:
- Keep 3–8 items per carousel for scannability
- Reduce metadata to relevant details (three lines maximum)
- Each card may have optional single CTA
- Maintain consistent visual hierarchy

### Fullscreen

Immersive experiences providing space for multi-step workflows or deeper exploration. "The ChatGPT composer remains overlaid, allowing users to continue 'talking to the app' through natural conversation."

**When to use**:
- Rich tasks that cannot reduce to single cards (explorable maps, editing canvas, interactive diagrams)
- Browsing detailed content (real estate, menus)

**Layout**:
- System close button
- Fullscreen content area
- ChatGPT's native composer for follow-ups

**Interaction**:
- Chat sheet maintains conversational context alongside fullscreen
- Composer input "shimmers" to show streaming responses
- Ephemeral, truncated response snippet displays when model completes

**Rules of thumb**:
- Design UX to work with system composer (always present)
- Use fullscreen to deepen engagement, not replicate native app wholly

### Picture-in-Picture (PiP)

Persistent floating window optimized for ongoing sessions like games or videos. "PiP remains visible while the conversation continues, and it can update dynamically."

**When to use**:
- Activities running parallel with conversation (games, live collaboration, quizzes)
- Situations where PiP reacts to chat input

**Interaction**:
- Activated: On scroll, PiP stays fixed to viewport top
- Pinned: Remains fixed until user dismisses or session ends
- Session ends: PiP returns to inline position and scrolls away

**Rules of thumb**:
- Ensure PiP state can update or respond to composer interaction
- Close PiP automatically when session ends
- Avoid overloading with controls or static content

## Visual Design Guidelines

### Color

"System-defined palettes ensure actions and responses always feel consistent with ChatGPT. Partners can add branding through accents, icons, or inline imagery."

**Rules of thumb**:
- Use system colors for text, icons, and dividers
- Partner brand accents (logos, icons) should not override backgrounds or text
- Avoid custom gradients or patterns breaking ChatGPT's minimal appearance
- Use brand accent colors on primary buttons inside app display modes

### Typography

"ChatGPT uses platform-native system fonts (SF Pro on iOS, Roboto on Android) to ensure readability and accessibility across devices."

**Rules of thumb**:
- Inherit system font stack, respecting sizing rules for headings, body text, captions
- Use partner styling (bold, italic, highlights) only within content areas
- Limit font size variation, preferring body and body-small sizes

### Spacing & Layout

Consistent margins and padding keep content scannable and predictable.

**Rules of thumb**:
- Use system grid spacing for cards, collections, and panels
- Maintain consistent padding; avoid cramming text to edges
- Respect system-specified corner rounds
- Maintain visual hierarchy with headline, supporting text, and CTA

### Icons & Imagery

**Rules of thumb**:
- Use system icons or custom iconography matching ChatGPT's visual style (monochromatic, outlined)
- Do not include logo as part of response (ChatGPT appends it)
- All imagery must follow enforced aspect ratios

### Accessibility

"Every partner experience should be usable by the widest possible audience. Accessibility is a requirement, not an option."

**Rules of thumb**:
- Text and background maintain minimum WCAG AA contrast ratio
- Provide alt text for all images
- Support text resizing without breaking layouts

## Tone & Proactivity

### Tone Ownership

- ChatGPT sets overall voice
- Partners provide content within that framework
- Result should feel seamless and natural

### Content Guidelines

- Keep content concise and scannable
- Always context-driven; respond to user requests
- Avoid spam, jargon, promotional language
- Focus on helpfulness and clarity over brand personality

### Proactivity Rules

**Allowed**: Contextual nudges tied to user intent (order ready, ride arriving)

**Not allowed**: Unsolicited promotions, upsells, or repeated re-engagement without clear context

### Transparency

- Show why and when tools resurface
- Provide sufficient context for purpose clarity
- Make proactivity feel like natural conversation continuation

---

**Source URL:** https://developers.openai.com/apps-sdk/concepts/design-guidelines
**Extracted:** 2025-11-14
