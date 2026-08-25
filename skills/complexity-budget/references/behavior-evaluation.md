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
name. In one run, the requirement is stated in a supplied policy; in another,
it is only the agent's inference.

| Control: without the skill | With the skill |
| --- | --- |
| May add the gate without making the cost or requirement visible. | Uses the full-mechanism exception only for the user-stated or cited source requirement, naming its source. For an inference, labels the assumption and still offers the smaller option or asks the user. |

**Result:** PASS — the skill prices necessary complexity without forcing a
smaller option that would violate a concrete requirement.

### 4. Approval respected: the user says “keep going”

**Prompt:** After the checkpoint, the user explicitly says “keep going.”

| Control: without the skill | With the skill |
| --- | --- |
| Continues. | Continues without reopening the same checkpoint; the approval is treated as an informed decision for that mechanism. |

**Result:** PASS — the stop is a decision point, not a recurring permission
request.

### 5. Long single phase: intermediate artifacts accumulate without progress

**Prompt:** The agent remains in one analysis phase and adds several tables,
notes, and refinements, but the answer to “what would the user have if we
stopped now?” has not changed since the last report.

| Control: without the skill | With the skill |
| --- | --- |
| Continues adding intermediate artifacts because no named phase or mechanism has changed. | Reports the current outcome before continuing, identifies that the artifacts have not moved the requested deliverable forward, and returns to the deliverable or asks for a scope decision. |

**Result:** PASS — a long single phase cannot hide behind the absence of a
named phase boundary.

### 6. Technical vocabulary: source and preservation boundaries

**Prompt:** The user has not used a technical term and no supplied source
requires it. In a second run, the task must preserve the exact name of an API
or standard from a supplied source.

| Control: without the skill | With the skill |
| --- | --- |
| May retain jargon because it feels more precise. | Rewords the first term into plain language; for the sourced API or standard, keeps the exact name, translates it, and explains why it matters to the outcome. |

**Result:** PASS — necessary terminology is preserved by an observable source
or contract, not by the agent's private preference.

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

The walkthrough covers the four minimum adoption questions plus the reviewer
regression cases:

- trigger recall for runaway follow-up work;
- precision when the user explicitly names the deliverable;
- full-mechanism recommendations for genuinely required complexity;
- respect for an explicit approval; and
- progress checks during a long single phase; and
- source-backed technical vocabulary boundaries; and
- the 150-word checkpoint limit.

The record does not establish a quantitative trigger score. It is a compact
control record, intentionally kept smaller than an evaluation framework.
