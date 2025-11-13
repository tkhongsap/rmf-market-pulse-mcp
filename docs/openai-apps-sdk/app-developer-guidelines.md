# App Developer Guidelines

## Overview

The ChatGPT app ecosystem prioritizes trust. Successful apps must be "clearly valuable," respect privacy, behave predictably, remain safe for broad audiences, and demonstrate accountability through verified developers offering responsive support.

### Core Principles

A great ChatGPT app:

- **Delivers clear value** — substantially improves ChatGPT's capabilities for specific tasks
- **Protects privacy** — limits inputs to essentials; users control shared data
- **Operates predictably** — performs exactly as described without hidden behaviors
- **Ensures safety** — complies with OpenAI policies; handles unsafe requests responsibly
- **Maintains accountability** — comes from verified developers providing support

Two qualification tiers exist:

1. **Minimum standards** — required for directory listing and direct link sharing
2. **Enhanced distribution** — higher design standards for merchandising and proactive suggestions

## App Fundamentals

### Purpose and Originality

Apps must have clear purposes and deliver promised functionality. Developers should use only owned or properly licensed intellectual property. The platform rejects misleading designs, impersonation, spam, or static frames lacking interaction.

### Quality and Reliability

Apps require thorough testing across diverse scenarios before submission. They must demonstrate "stability, responsiveness, and low latency." Crashers, hangers, and inconsistent behavior face rejection. Beta or demo submissions are prohibited.

### Metadata

Clear, accurate naming and descriptions matter. Screenshots must reflect actual functionality. Tool titles should indicate whether they perform read-only or write operations.

### Authentication and Permissions

Authentication flows must be transparent. Users deserve clear notification of all permission requests, which should be "strictly limited to what is necessary for the app to function." Submissions require demo account credentials.

## Safety Requirements

### Usage Policies

Apps must comply with OpenAI's usage policies and remain current with evolving standards. Previously approved apps later found non-compliant face removal.

### Appropriateness

Apps must suit general audiences including ages 13–17. Apps may not explicitly target children under 13. Age-gated mature experiences will arrive with proper verification mechanisms.

### User Intent Respect

Experiences should directly address user requests. Avoid inserting unrelated content, redirecting interactions, or collecting unnecessary data.

### Fair Play

Descriptions and tool annotations must not discourage other app usage or interfere with fair discovery. "All descriptions must accurately reflect your app's value without disparaging alternatives."

### Third-Party Integration

- Obtain proper authorization before integrating external APIs or websites
- Don't scrape without permission or violate third-party terms of service
- Don't bypass API restrictions or rate limits

## Privacy Standards

### Privacy Policy Requirement

Submissions must include published privacy policies explaining data collection and usage. Users can review policies before installation.

### Data Collection Practices

**Minimization principle:** Collect only the minimum data required. Input schemas should be specific and task-linked. Avoid broad profile data or speculative fields.

**Prohibited sensitive data:** Payment information (PCI), health records (PHI), government identifiers, API keys, and passwords are off-limits.

**Data boundaries:**
- Avoid raw location fields in input schemas; obtain location through controlled channels
- Don't pull, reconstruct, or infer full chat logs; operate only on explicitly shared snippets

### Transparency and Control

- Avoid surveillance, tracking, or behavioral profiling unless explicitly disclosed
- Label all state-changing tools as write actions
- Surface data-sending actions (emails, uploads, posts) as write actions requiring confirmation

## Developer Verification

### Identity Verification

All submissions require verified individual or organizational identity. Misrepresentation or hidden behavior results in removal.

### Support Contacts

Provide accessible customer support information and keep it current.

## Post-Submission Policies

### Reviews and Checks

OpenAI may perform automated scans or manual reviews. Rejected or removed apps receive feedback and appeal opportunities.

### Maintenance and Removal

Inactive, unstable, or non-compliant apps face removal. "We may reject or remove any app from our services at any time and for any reason without notice, such as for legal or security concerns or policy violations."

### Re-submission Requirements

Once listed, tool names and descriptions are locked. Changes or additions require resubmission and review.

---

**Note:** Guidelines reflect early-preview standards and may evolve. Monetization details will follow when broader submission opens later.