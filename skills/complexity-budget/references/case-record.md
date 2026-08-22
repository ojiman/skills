# Case record

One project, observed end to end. **n = 1.** This is a documented case, not
evidence that the pattern is universal. It is written down because the
sequence is specific enough to recognise again, not because it has been
measured across projects.

## What was asked for

> Take an open-source VS Code extension (an AI coding agent) and remove
> capabilities from it, so an internal build can be distributed with a
> reduced, controlled feature set.

Stated in one sentence by a non-specialist owner who could describe the goal
precisely and could not evaluate an implementation.

## What got built, in order

| Step | Artifact | Asked for? |
| --- | --- | --- |
| 1 | Design document (v1) | Yes, reasonable |
| 2 | Design document v2 — decisions `D-n`, invariants `INV-n`, threats `T-n`, residual risks `R-n`, spikes `S-Bn` | Emergent |
| 3 | A source-observation manifest: 59 pinned file/selector/hash observations of the upstream codebase | Emergent |
| 4 | A CI verification plan defining seven gates, G-1 … G-7 | Emergent |
| 5 | Gate implementations: pinned-source verifier, patch queue, profile binding, build adapter | Emergent |
| 6 | A docs-consistency verifier: numbering, dangling refs, expected counts, coverage floors | Emergent |
| 7 | A selftest asserting each check above fails on damaged input — 26 scenarios | Emergent |
| 8 | A check that every gate is wired into the workflow, because one was not | Emergent |

At the end of this sequence: no extension had been built, installed, or run.
The original goal — remove capabilities, ship an internal build — had not
been reached.

Every step in column 2 was individually defensible. Every one of them was
proposed by the agent, and approved by an owner who by step 4 could no longer
independently judge whether step 5 was needed.

## The owner's own account

> "After the design doc, I stopped being able to tell what we were doing."

That sentence is the diagnostic. It marks the point where review stopped
being real, several steps before anyone noticed.

## The failure mode inside the artifacts

The same defect class appeared four separate times across the work: **a claim
stated more strongly than the mechanism that enforces it.**

1. A decision claimed models were restricted to "reviewed IDs"; only
   allowlist membership was actually enforced.
2. A manifest field was invented (`additionalSelectors`) that no verifier
   ever read.
3. A platform-gate invariant was written in a form its own rules made
   impossible to test.
4. A pull-request description claimed new tests caught "the same class of
   defect" as an earlier bug — they could not; different mechanism entirely.

Item 4 was written by the reviewing agent, about its own work, while
reviewing for exactly this defect class. That is the strongest single data
point here: **the agent applied the rule correctly to others' work and missed
it in its own narrative in the same session.**

None of the four were caught by the same model that wrote them. All were
caught by a *different* model, or by a human asking a naive question.

## What was genuinely worth building

Not all of it was waste, and a case record that pretends otherwise is
useless.

- The pinned-source verifier caught a real defect: a selector pointing at a
  CI job (`jobs.package`) that did not exist in the upstream workflow. Purely
  lexical checking would not have found it; evaluating the selector did.
- A git-lfs interaction bug took **three** rounds to fix, each round revealing
  that the previous fix had not actually been applied end to end (the test
  fixture had the same bug; then a separate process did not inherit the fix).
  Without an executable gate this would have shipped as "fixed" three times.
- One production gate turned out never to have been wired into CI at all. The
  wiring check found it.

The honest reading: roughly the first half of the mechanism was load-bearing,
and the layers built to protect the protection were where the returns went
negative. Nobody could tell where that line was **at the time**, which is the
entire argument for pricing each new layer before building it rather than
after.

## What was missing at every decision point

Mapped to the four checkpoint moves in `SKILL.md`:

| Move | Present? |
| --- | --- |
| 1. Name it as a new category | Rarely — new mechanism arrived as the obvious next step |
| 2. Say what breaks if it is skipped | Almost never, concretely |
| 3. Price it in the owner's vocabulary | Never — the vocabulary drifted to the agent's within two steps |
| 4. Offer a smaller option + recommendation | Never — one option, presented as the plan |

Move 3 is the one that would have caught it earliest. The owner's word was
"remove features from the OSS extension." By step 4 the working vocabulary
was "coverage floor," "attestation sidecar," "selector query." Nothing in
those words is wrong; the drift itself was the warning, and it was visible
from the outside long before anyone acted on it.

## What actually caught the problems

- **Cross-model review.** Every one of the four claim-over-enforcement
  defects was found by a model other than the one that wrote the text.
  Same-model self-review, including via subagents, found none of them.
- **Naive questions from the owner.** "Do we need Windows-only if the
  artifact is OS-neutral?" invalidated a whole platform-gate design. The
  owner could not read the code and was still the highest-yield reviewer in
  the project, because they were the only participant still holding the
  original goal.

This is the counterweight to the pessimistic reading of this record: the
non-specialist owner was not dead weight. Their leverage was in the questions
only they could ask — and that leverage decays exactly as vocabulary drift
sets in.

## The generalisation being claimed

Narrow, and only this:

> An agent optimises for the defensibility of the artifact in front of it.
> Nothing in that objective terminates. If the human is the only possible
> source of a stopping signal, and the human's ability to produce one erodes
> as the work proceeds, then the stopping rule has to be installed *before*
> the erosion — as a habit of the agent, not a judgement of the human.

Not claimed: that this happens to everyone, that the ratio of useful to
excess work generalises, or that the failure is caused by any particular
model.
