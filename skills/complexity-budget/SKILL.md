---
name: complexity-budget
description: "Use when scope creep or over-engineering is making work grow beyond what the user asked for: before proposing or building an unrequested new category of mechanism such as a layer, gate, framework, abstraction, policy, config, generator, or review artifact; when a design, CI pipeline, review process, or spec is generating follow-up work; when the user says they have lost track of what is being built or asks whether this is too much; or at the start of an open-ended build that lacks a clear outcome and stop condition. Do not use merely because the user explicitly requested the mechanism as the deliverable."
license: MIT
---

# Complexity budget

## The failure mode this exists to prevent

An agent has no internal signal for "enough." Every artifact it produces
suggests a next artifact that would make the first one safer: a design doc
suggests a verification plan, a verification plan suggests CI gates, CI gates
suggest a selftest, a selftest suggests a gate that checks the selftest is
wired up. Each step is individually defensible. Nothing in the chain says
stop.

The user cannot supply the brake either, because by the time the chain is
three steps long they no longer have the vocabulary to evaluate step four.
They approve it — not because they judged it worth building, but because they
cannot see the ground to argue from. The result is a large, internally
coherent, well-tested body of work that does not do the thing the user asked
for on day one.

The cost is not wasted tokens. It is that the user loses the ability to
review, and once that is gone, every remaining safeguard is theatre.

**Complexity is spent on the user's behalf. Get the invoice signed before you
spend it, in a currency they can read.**

## Rule

Before introducing a **new category of mechanism** — not a new function in an
existing file, but a new kind of thing the user will have to reason about
later — stop and run the checkpoint below.

A new category of mechanism is anything that adds a noun to the project the
user did not say: a build gate, a manifest, a schema, a patch queue, a policy
layer, a code-generation step, a plugin system, a new config file, a new
review artifact, a new document that other documents must stay consistent
with.

**Operational test:** when the boundary is unclear, ask whether someone will
need to maintain, operate, approve, or keep the thing accurate independently
after the current task. If yes, treat it as a new category. If it is only
another test case, field on an existing type, entry in an existing list, or
commit, it is not. This is a judgment aid, not a replacement for the "adds a
noun" explanation.

Not a new category: another test case, another field on an existing type,
another entry in an existing list, another commit. Do not run the checkpoint
for these — a checkpoint on every edit is its own kind of noise, and it
trains the user to skim.

## Open-ended build start

At the start of an open-ended build, first check whether the requested outcome
and a stopping condition are already clear. If they are not, define them once:

- **Outcome:** the concrete deliverable the user will have.
- **Stop condition:** the observable condition that means the requested outcome
  is complete.
- **Out of scope:** work that will not be included in this task.

If the user has already made these clear, do not interrupt just to restate
them. This is a one-time boundary for the build, not a checkpoint on every
edit.

## Checkpoint

Four moves. Keep it short — under 150 words. If it needs more than that, the
mechanism is probably too big to introduce in one step.

**1. Name it as a new thing.**
Say plainly that this is a new category, not a continuation.
> "This adds a build-time manifest — a new file class we'd have to keep
> accurate forever."

**2. Say what happens if it is not built.**
Concretely, not as a risk category. "Correctness is not guaranteed" is not an
answer. "If we skip it, an upstream version bump silently changes behaviour
and nothing catches it until someone reports a bug in the field" is.
If the honest answer is "nothing much, it's just tidier" — say that, and
recommend skipping.

**3. Price it in the user's own vocabulary.**
Start with the words the user used when they described the goal. If they said
"remove features from the OSS extension," price it as "this is one more thing
between you and a working extension," not as "amortised verification cost."
If a necessary technical term has not appeared in the conversation, translate
it in one sentence, then use it consistently. Do not reword away a distinction
that the work actually needs.

**4. Offer a smaller option and a recommendation.**
Always at least two: the full mechanism, and the smallest thing that
addresses the same risk (often: write it down and check it by hand for now).
State which you would pick and why. Never present the full version as the
only option.

Then wait. Do not build past a checkpoint on the assumption it will be
approved.

The smaller option is not mandatory when a concrete requirement makes the
full mechanism necessary. For example, if a regulatory or security gate is
required, name the requirement and recommend the full mechanism; the
checkpoint prices the choice but does not pretend that required work is
optional.

## Standing progress report

On any task longer than a few steps, answer one question, unprompted, before
starting a genuinely new phase or a new category of mechanism:

> **If we stopped right now, what would the user actually have?**

Answer in terms of the user's original goal, not in terms of artifacts
produced. "Three CI gates and a design doc" is not an answer. "You would have
documentation and checks, but still no installable extension" is.

This is the single highest-value habit in this skill. It is the only routine
signal that reliably separates "we are making progress" from "we are making
artifacts," and the user usually cannot generate it themselves.

## When the user says "keep going"

Take it. A user who has been given the checkpoint above and says build it has
made an informed decision, and re-litigating it is its own failure mode. Run
the checkpoint once per mechanism, not repeatedly.

## Anti-patterns

- **Asking permission for everything.** This converts the user into a
  bottleneck and trains them to say yes without reading. Checkpoint at
  category boundaries only.
- **Framing the checkpoint so the answer is obvious.** "Should we skip the
  safety check?" is not a real choice. Present the smaller option as a
  genuine one, because it usually is.
- **Building it first, then asking.** Once the code exists, sunk cost decides.
- **Hiding the cost in the benefit.** "This will make future changes safer"
  is a benefit sentence pretending to be a cost sentence.

## Why the description of this skill matters

This skill has to fire *before* the mechanism is built, which is exactly the
moment when the agent has already convinced itself the mechanism is
necessary. If it fires afterwards it is worthless. Keep the trigger conditions
in the frontmatter description broad and concrete when editing this skill.

## Background

`references/case-record.md` — one documented case, in detail: what was asked
for, what got built, which of the four checkpoint moves were missing, and how
much of it was actually justified in hindsight. Read it if you want the
evidence behind the rule; it is not needed to apply the rule.
