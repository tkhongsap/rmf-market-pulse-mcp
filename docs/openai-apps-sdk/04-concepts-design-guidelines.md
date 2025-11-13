# App Design Guidelines

## Overview

Apps are developer-built experiences integrated within ChatGPT. They extend functionality through lightweight cards, carousels, fullscreen views, and other display modes that maintain ChatGPT's clarity and trustworthiness.

**Resource**: [Figma component library](https://www.figma.com/community/file/1560064615791108827/apps-in-chatgpt-components-templates)

## Best Practices

### Principles

Apps succeed when they help users accomplish meaningful tasks conversationally. Key principles include:

- **Conversational**: Experiences integrate seamlessly into dialogue
- **Intelligent**: Tools understand context and anticipate intent
- **Simple**: Each interaction focuses on a single, clear action
- **Responsive**: Tools feel fast and lightweight
- **Accessible**: Designs support assistive technologies

### Boundaries

"ChatGPT controls system-level elements such as voice, chrome, styles, navigation, and composer." Developers customize content, branding, and actions within this framework.

### Good Use Cases

Ideal apps answer "yes" to most questions:

- Does the task fit naturally into conversation (booking, ordering, scheduling)?
- Is it time-bound with a clear start and end?
- Is information valuable and actionable in the moment?
- Can it be summarized simply with one card and clear call-to-action?
- Does it extend ChatGPT in a differentiated way?

### Poor Use Cases

Avoid tools that:

- Display long-form content better suited for websites
- Require complex multi-step workflows
- Feature advertisements or upsells
- Surface sensitive information directly in cards
- Duplicate ChatGPT system functions

## Display Modes

### Inline

Appears directly in conversation flow, showing app content above the model response.

**Inline Card Layout**:
- Title (for document-based content)
- Expand button for fullscreen access
- Show more for additional items
- Edit controls
- Maximum two primary actions at bottom

**Rules**:
- Limit to two actions maximum
- No deep navigation or tabs within cards
- No nested scrolling
- No duplicative inputs

**Inline Carousel**:
- Presents similar items side-by-side
- Each item includes image, title, metadata (max two lines), optional badge
- Single CTA per item
- Keep to 3–8 items for scannability

### Fullscreen

Immersive experiences for multi-step workflows or deep exploration. "The ChatGPT composer remains overlaid, allowing users to continue talking to the app through natural conversation."

**When to use**:
- Rich tasks that exceed single-card scope
- Browsing detailed content (real estate, menus)

**Rules**:
- Design UX to work with system composer
- Use fullscreen to deepen engagement, not replicate native apps

### Picture-in-Picture (PiP)

Persistent floating window for parallel activities like games or videos.

**When to use**:
- Activities running alongside conversation
- Widgets that react to chat input

**Rules**:
- Ensure state updates based on user interaction
- Close automatically when sessions end
- Avoid overloading with static content

## Visual Design Guidelines

### Color

System palettes ensure consistency. "Use system colors for text, icons, and spatial elements like dividers."

- Brand accents on logos and icons only
- Avoid custom gradients or patterns
- Use brand colors on primary buttons in app modes

### Typography

"ChatGPT uses platform-native system fonts (SF Pro on iOS, Roboto on Android)."

- Inherit system font stack
- Use partner styling only within content areas
- Limit font size variation

### Spacing & Layout

"Use system grid spacing for cards, collections, and inspector panels."

- Keep padding consistent
- Respect system corner rounds
- Maintain clear visual hierarchy

### Icons & Imagery

- Use system icons or monochromatic, outlined custom iconography
- Include alt text for all images
- Follow enforced aspect ratios

### Accessibility

- Maintain WCAG AA contrast ratios minimum
- Provide alt text for images
- Support text resizing without layout breaks

## Tone & Proactivity

### Content Guidelines

- Keep content concise and scannable
- Respond to user intent contextually
- Avoid spam, jargon, promotional language
- Prioritize helpfulness over brand personality

### Proactivity Rules

**Allowed**: Contextual nudges tied to user intent (order ready, ride arriving)

**Not allowed**: Unsolicited promotions, upsells, repeated re-engagement

### Transparency

"Always show why and when your tool is resurfacing" to maintain user control and trust in the system.
