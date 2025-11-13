# Optimize Metadata

## Why metadata matters

Metadata guides ChatGPT's decision to invoke your connector. According to the guide, "Well-crafted names, descriptions, and parameter docs increase recall on relevant prompts and reduce accidental activations." Treat this information similarly to marketing copy requiring ongoing refinement.

## Gather a golden prompt set

Before tuning metadata, compile labeled examples:

- **Direct prompts** – users explicitly reference your product or data source
- **Indirect prompts** – users describe desired outcomes without naming your tool
- **Negative prompts** – instances where built-in tools or competing connectors should handle requests

Document expected behavior for each test case to enable regression testing later.

## Draft metadata that guides the model

For each tool, provide:

- **Name** – combine domain with action (e.g., `calendar.create_event`)
- **Description** – begin with "Use this when…" and specify exclusions like "Do not use for reminders"
- **Parameter documentation** – explain arguments, include examples, use enums for restricted values
- **Read-only hint** – mark tools that never modify state with `readOnlyHint: true` so ChatGPT streamlines confirmation

Supply app-level metadata including descriptions, icons, starter prompts, and sample conversations showcasing primary use cases.

## Evaluate in developer mode

1. Connect your connector in ChatGPT developer mode
2. Test against your golden prompt set, documenting tool selection, argument values, and component rendering
3. Measure precision (correct tool invoked?) and recall (tool invoked when appropriate?)

Revise descriptions emphasizing intended scenarios when the model selects incorrectly.

## Iterate methodically

- Modify single metadata fields individually for clear attribution
- Maintain revision logs with timestamps and test outcomes
- Share changes with reviewers before deployment
- Repeat evaluation after each revision, prioritizing precision on negative prompts

## Production monitoring

After launch:

- Weekly review of tool-call analytics; spikes in "wrong tool" confirmations signal metadata issues
- Incorporate user feedback into description updates
- Schedule periodic prompt replays, especially after adding tools or modifying structured fields

The guide emphasizes treating metadata as "a living asset" requiring intentional wording and continuous evaluation.