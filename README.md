# ojiman/skills

An [Agent Plugins 1.0.0](https://agent-plugins.org/) plugin: a small personal
collection of Agent Skills, each one written up from something that actually
went wrong on a real project.

| Skill | What it does |
| --- | --- |
| [`complexity-budget`](skills/complexity-budget/SKILL.md) | Makes the agent price a new mechanism, in your vocabulary, *before* building it |

## complexity-budget

**The problem:** an AI agent has no internal signal for "enough." Each
artifact it produces suggests a next artifact that would make the first one
safer, and every step in that chain is individually defensible. The user is
the only possible brake — but by the time the chain is a few steps long, they
no longer have the vocabulary to evaluate the next step, so they approve it
without really reviewing it. What comes out is a large, coherent, well-tested
body of work that does not yet do the thing that was asked for.

**What the skill does:** it makes the agent stop and price each *new category
of mechanism* before building it — name it as new, say concretely what breaks
if it is skipped, price it in the user's own words, and offer a smaller option
with a recommendation. It also has the agent answer, unprompted, before a new
phase or mechanism and when intermediate artifacts accumulate without changing
what the user would have if we stopped:
*if we stopped right now, what would you actually have?*

At the start of an open-ended build with no clear outcome or stop condition,
it defines the Outcome, Stop condition, and Out of scope once.

Guardrails in agentic coding are usually discussed as a security topic. This
one is a productivity guardrail with the same shape: the risk is not that the
agent does something malicious, it is that the human quietly stops being able
to review — and once that is gone, every remaining safeguard is theatre.

`skills/complexity-budget/references/case-record.md` is the single project the
rule was derived from, written up honestly — including which parts of the
excess complexity turned out to be load-bearing after all, and the fact that
n = 1.

## Layout

```
plugin.json
skills/
  complexity-budget/
    SKILL.md
    references/behavior-evaluation.md
    references/case-record.md
```

A skill is only recognised in a *direct* subdirectory of `skills/`, and the
`name` in its `SKILL.md` frontmatter must match that directory's name.

## Install

Install as an Agent Plugins plugin, or copy any directory under `skills/`
into your agent's skills directory. Skills here are invoked automatically from
their `description` — `complexity-budget` in particular is meant to fire
*before* new mechanism is built, so it does not depend on being called by name.

## Checks

```bash
node .github/validate-plugin.mjs
```

Checks `plugin.json` and every `SKILL.md` against a hand-picked subset of
Agent Plugins 1.0.0 and the Agent Skills specification — not full schema
conformance: `$schema`, name rules, `name` matching its directory,
description presence and length, frontmatter values that a real YAML parser
would reject or silently truncate, and any `SKILL.md` sitting at a depth
where no client will find it. No dependencies. Exit code `1` means it found
something.

It exists because these failures are silent. A renamed directory or a missing
description does not raise an error anywhere — the skill simply never loads
and never fires, and the only symptom is that nothing happens.

The same command runs in CI on every push and pull request
(`.github/workflows/validate.yml`). CI adds no check that cannot be
reproduced locally by running the line above.

## License

MIT — see `LICENSE`.
