# App Developer Guidelines

## Overview

The ChatGPT app ecosystem prioritizes trust through safety, utility, and privacy respect. Guidelines establish baseline requirements for app directory listing, with enhanced standards detailed in design guidelines for improved distribution.

A successful ChatGPT app demonstrates these characteristics:

- **Clear value**: Substantially improves ChatGPT's capabilities or enables new features
- **Privacy respect**: Collects only necessary inputs; users control shared data
- **Predictable behavior**: Functions exactly as described without surprises
- **Broad safety**: Complies with OpenAI usage policies; appropriate for all users
- **Accountability**: Verified developers provide responsive support

## App Fundamentals

### Purpose and Originality

Apps must serve distinct purposes and deliver promised functionality. Developers must own or possess permission for all intellectual property. The platform rejects misleading designs, impersonation, spam, and static content. Apps cannot suggest OpenAI endorsement.

### Quality and Reliability

Apps require predictable, reliable performance with accurate, relevant results. Error handling must include clear messaging and fallback options. Extensive testing across scenarios ensures stability, responsiveness, and low latency. Submissions showing crashes, hangs, or inconsistent behavior—including beta or demo versions—face rejection.

### Metadata

Titles and descriptions must be clear and accurate. Screenshots demonstrate genuine functionality only. Tool annotations clarify purpose and indicate whether operations modify data.

### Authentication and Permissions

Authentication flows demand transparency and explicitness. Users receive clear notification of all requested permissions, strictly limited to functional necessity. Submissions must include fully-featured demo account credentials.

## Safety

### Usage Policies

Developers must comply with "[OpenAI usage policies](https://openai.com/policies/usage-policies/)" and maintain current awareness of evolving requirements. Previously approved apps violating policies face removal.

### Appropriateness

Apps must suit general audiences, including ages 13–17. Apps cannot explicitly target children under 13. Mature content support awaits appropriate age verification systems.

### Respect User Intent

Apps must directly address user requests without inserting unrelated content, redirecting interactions, or collecting unnecessary data.

### Fair Play

Apps cannot include descriptions or annotations discouraging competing apps or interfering with fair discovery. All descriptions must accurately reflect value without disparaging alternatives.

### Third-Party Content and Integrations

- **Authorized access**: Avoid scraping websites or integrating APIs without proper authorization and compliance with terms of service
- **Circumvention prevention**: Do not bypass API restrictions, rate limits, or access controls

## Privacy

### Privacy Policy

Submissions require clear, published privacy policies detailing data collection and usage. Users review policies before installation. Developers must follow stated policies consistently.

### Data Collection

**Minimization**: Gather only minimum data for tool functionality. Input fields should be specific, narrowly scoped, and task-linked. Avoid speculative fields or broad profile data.

**Sensitive data restrictions**: Do not collect payment card information, protected health information, government identifiers, API keys, or passwords.

**Data boundaries**:
- Avoid raw location fields in input schemas. Obtain location through controlled client channels
- Apps cannot reconstruct full chat logs from clients or elsewhere; operate only on explicit snippets clients provide

### Transparency and User Control

- **Data practices**: Avoid surveillance, tracking, or behavioral profiling unless explicitly disclosed and aligned with policies
- **Action labels**: Mark data-modifying tools as write actions; read-only tools remain side-effect-free
- **Exfiltration prevention**: Actions sending data outside current boundaries (messages, emails, file uploads) require client confirmation

## Developer Verification

### Verification Requirements

Submissions require verified individual or organizational identity. Misrepresentation, hidden behavior, or system manipulation results in program removal.

### Support Contact

Provide accurate, current customer support contact information for end-user assistance.

## After Submission

### Reviews and Checks

Automated scans and manual reviews assess policy compliance. Rejected or removed apps receive feedback and appeal opportunities.

### Maintenance and Removal

Inactive, unstable, or non-compliant apps face removal. OpenAI may reject or remove apps for legal, security, or policy concerns without notice.

### Resubmission for Changes

Tool names, signatures, and descriptions become locked after directory listing. Changes or additions require resubmission and review.

---

ChatGPT apps represent powerful opportunities to deliver valuable experiences to global audiences while maintaining ecosystem trust through developer accountability and user protection.
