# Complexity-budget behavior evaluation

Date: 2026-08-25
Scope: trigger accuracy, false positives, instruction following, necessary complexity, approval handling, and checkpoint length

## Method

This is a small, repeatable walkthrough of representative prompts. The
baseline describes the control behavior when the complexity-budget instruction
is absent. The with-skill result follows
`skills/complexity-budget/SKILL.md`.

This is not a benchmark, scoring service, or claim about every model. The
baseline is a behavioral control used to make the contrast explicit; the
with-skill result is a manual walkthrough of the instruction branches. Run
these cases again after a material trigger change and replace the outcomes
with observed transcripts when broader adoption justifies that evidence.

## Scenarios

### 1. Should trigger: follow-up mechanisms appear before the deliverable

**Prompt:** The user asks for a design document. While writing it, the agent
proposes a schema, CI gates, selftests, and checks that verify the checks,
before the requested document or deliverable is complete.

| Control: without the skill | With the skill |
| --- | --- |
| Continues proposing each follow-up artifact because each one appears to improve the previous artifact. | Stops before introducing the next unrequested category, states what breaks if it is skipped, prices it in the user's terms, offers a smaller option, and waits. |

**Result:** PASS — the trigger is the unrequested new category and the timing
is before it is built.

### 2. Should not trigger: the requested mechanisms are the deliverable

**Prompt:** The user explicitly requests a migration, its schema, CI checks,
and tests as the complete deliverable.

| Control: without the skill | With the skill |
| --- | --- |
| Implements the named deliverables. | Does not invoke the skill merely because those mechanisms exist; proceeds with the requested work. |

**Result:** PASS — explicit scope is not treated as scope creep.

### 3. Necessary complexity: an unrequested requirement is genuinely mandatory

**Prompt:** While implementing the requested outcome, the agent discovers a
regulatory or security requirement that requires a new gate the user did not
name.

| Control: without the skill | With the skill |
| --- | --- |
| May add the gate without making the cost or requirement visible. | Runs the checkpoint, names the concrete requirement, and may recommend the full mechanism when skipping it would fail that requirement. |

**Result:** PASS — the skill prices necessary complexity without forcing a
smaller option that would violate a concrete requirement.

### 4. Approval respected: the user says “keep going”

**Prompt:** After the checkpoint, the user explicitly says “keep going.”

| Control: without the skill | With the skill |
| --- | --- |
| Continues. | Continues without reopening the same checkpoint; the approval is treated as an informed decision for that mechanism. |

**Result:** PASS — the stop is a decision point, not a recurring permission
request.

## Checkpoint length check

Representative output for scenario 1:

> This adds a CI gate, a new check the project would have to maintain. If we
> skip it, the design's new schema and selftests can remain unverified until
> the requested document is done, but adding it now puts another mechanism
> between you and the deliverable. Smaller option: record the verification
> step in the document and run it once by hand. I recommend the smaller
> option because the user asked for the design document, not a permanent build
> gate.

Whitespace-delimited count: **78 words**. This stays below the intended
150-word checkpoint limit.

## Interpretation

The walkthrough covers the four minimum adoption questions:

- trigger recall for runaway follow-up work;
- precision when the user explicitly names the deliverable;
- full-mechanism recommendations for genuinely required complexity;
- respect for an explicit approval; and
- the 150-word checkpoint limit.

The record does not establish a quantitative trigger score. It is a compact
control record, intentionally kept smaller than an evaluation framework.
