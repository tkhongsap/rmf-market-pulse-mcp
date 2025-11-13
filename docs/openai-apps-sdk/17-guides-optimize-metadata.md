# Optimize Metadata

## Why metadata matters

According to the page, "ChatGPT decides when to call your connector based on the metadata you provide." Well-crafted names, descriptions, and parameter documentation increase the likelihood that users will discover your tool and reduce unintended activations. The guidance suggests treating metadata as carefully as product marketing copy.

## Gather a golden prompt set

Before refining metadata, develop a labeled test dataset including:

- **Direct prompts** – users explicitly mention your product or data source
- **Indirect prompts** – users describe desired outcomes without naming your tool
- **Negative prompts** – requests that should use built-in tools or competitors

Document expected behavior for each test case to enable regression testing.

## Draft metadata that guides the model

Key recommendations for each tool:

- **Name** – combine domain with action (e.g., `calendar.create_event`)
- **Description** – begin with "Use this when…" and specify limitations
- **Parameter docs** – explain each argument with examples and enumerated options
- **Read-only hint** – set `readOnlyHint: true` for non-mutating operations

Supply polished descriptions, icons, and starter prompts at the app level.

## Evaluate in developer mode

Test your connector against the golden prompt set, recording which tools were selected, what arguments were passed, and whether components rendered properly.

## Iterate methodically

Adjust one metadata field at a time to isolate improvements. Maintain a revision log with test results and share changes with reviewers before deployment.

## Production monitoring

Monitor tool-call analytics weekly. Update descriptions based on user feedback and run periodic prompt replays after adding new tools.
