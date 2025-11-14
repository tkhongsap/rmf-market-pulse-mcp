# App Developer Guidelines

## Overview

The ChatGPT app ecosystem prioritizes trust through safety, utility, and privacy respect. According to the guidelines, "A good ChatGPT app makes ChatGPT substantially better at a specific task or unlocks a new capability."

### Core Principles

Successful apps demonstrate five essential qualities:

1. **Clear Value**: Meaningfully enhance ChatGPT's functionality
2. **Privacy Respect**: Limit inputs to necessary data only
3. **Predictable Behavior**: Operate exactly as described
4. **Safety**: Comply with OpenAI usage policies
5. **Accountability**: Verified developers provide responsive support

## App Fundamentals

### Purpose and Originality

Apps require clear purpose and reliable functionality. Developers must use only owned or authorized intellectual property, avoiding misleading designs, impersonation, or static unresponsive interfaces.

### Quality and Reliability

"Apps must behave predictably and reliably. Results should be accurate and relevant to user input." Comprehensive testing across diverse scenarios is mandatory before submission. Beta or demo submissions are rejected.

### Metadata Standards

App names, descriptions, and screenshots must accurately represent actual functionality. Tool titles should clarify read-only versus write capabilities.

### Authentication

Authentication flows must be transparent with clear permission requests limited to essential functionality. Demo account credentials with full features are required during submission.

## Safety Requirements

### Usage Policies Compliance

Apps must adhere to OpenAI's usage policies and remain compliant ongoing. Previously approved apps violating policies face removal.

### Appropriateness

Apps must suit general audiences, including ages 13-17, without explicitly targeting younger children.

### User Intent Respect

"Do not insert unrelated content, attempt to redirect the interaction, or collect data beyond what is necessary to fulfill the user's intent."

### Fair Play

Avoid discouraging alternative apps or diminishing fair discovery through misleading descriptions or tool annotations.

### Third-Party Integrations

Authorized access to external APIs is mandatory. Developers cannot scrape websites or bypass API restrictions without permission.

## Privacy Standards

### Privacy Policy Requirements

Clear, published privacy policies explaining data collection and usage are mandatory before submission.

### Data Collection Minimization

"Gather only the minimum data required to perform the tool's function." Avoid speculative fields or broad profile data collection.

### Sensitive Data Prohibition

Do not collect payment information, health data, government identifiers, API keys, or passwords.

### Data Boundaries

- Avoid raw location fields in schemas
- Cannot reconstruct full chat logs
- Operate only on explicitly shared content

### Transparency and Control

Mark write actions (create, modify, delete) clearly. Read-only tools must be side-effect-free. "Any action that sends data outside the current boundary must be surfaced to the client as a write action."

## Developer Verification

### Identity Verification

All submissions require verified individual or organizational identity. Misrepresentation results in program removal.

### Support Requirements

Provide accurate, current customer support contact information for end-user assistance.

## Post-Submission Policies

### Review Process

Automated scans or manual reviews assess policy compliance. Rejected apps receive feedback with potential appeal opportunities.

### Maintenance and Removal

Inactive, unstable, or non-compliant apps face removal. OpenAI reserves removal rights for legal, security, or policy concerns.

### Modification Resubmission

Changing tool names, signatures, or descriptions requires formal resubmission for review.

---

**Source URL:** https://developers.openai.com/apps-sdk/app-developer-guidelines
**Extracted:** 2025-11-14
