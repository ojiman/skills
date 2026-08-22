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
with a recommendation. It also has the agent periodically answer, unprompted:
*if we stopped right now, what would you actually have?*

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
    references/case-record.md
```

## Install

Install as an Agent Plugins plugin, or copy any directory under `skills/`
into your agent's skills directory. Skills here are invoked automatically from
their `description` — `complexity-budget` in particular is meant to fire
*before* new mechanism is built, so it does not depend on being called by name.

## 日本語

AI エージェントには「もう十分」というブレーキがない。成果物はつねに次の成果物を
正当化するので、連鎖は自然には止まらない。止められるのは利用者だけだが、数ステップ
進んだ時点で利用者は次のステップを評価する語彙を失っており、「わからないまま承認する」
状態になる。結果として、整合的でテストも通っているのに当初の目的を果たしていない
成果物の山ができる。

`complexity-budget` は、エージェントが**新しい種類の仕組み**を導入する前に必ず
立ち止まり、(1) それが新カテゴリであると明言し、(2) 作らなかった場合に何が壊れるかを
具体的に述べ、(3) 利用者自身の語彙で費用を説明し、(4) より小さい選択肢と推奨を提示する、
という手順を強制する。加えて「いま止めたら、あなたの手元に何が残るか」を定期的に
自己申告させる。

## License

MIT — see `LICENSE`.
