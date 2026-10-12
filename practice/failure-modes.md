# Why capable agents still fail

A strong model in a good harness can still produce bad outcomes. When that happens, the instinct is to blame the model and wait for the next release. Most of the time the cause is closer to home: the *work* was not set up in a way an agent could succeed at.

This page catalogues eight failure patterns that show up again and again, with the symptom to look for and the harness-side fix. None requires a smarter model.

## The eight patterns at a glance

| # | Pattern | What you see | Root cause | Fix lives in |
|---|---------|--------------|------------|--------------|
| 1 | Under-specified task | A plausible solution to the wrong problem | The agent had to guess what "done" means | The task spec |
| 2 | Knowledge outside the repo | It breaks a convention "everyone knows" | The convention lives in heads and chat threads | [Repo as system of record](repo-as-system-of-record.md) |
| 3 | Instruction overload | It ignores a rule that is written down | The rule is line 1,400 of a giant file | [Memory](../guide/05-memory-and-skills.md) |
| 4 | Lost continuity | Session 3 redoes or undoes session 2 | Nothing durable carried state across | [Long-running work](long-running-work.md) |
| 5 | Overreach | Asked for one fix, it refactored the module | No stated scope, no boundary | Task spec; [guardrails](../guide/03-guardrails.md) |
| 6 | Under-finishing | Half of five features, none working | It tried everything at once | One unit of work at a time |
| 7 | Premature victory | "All done!" and the tests fail | "Done" was an opinion, not a check | [Evaluation](../guide/09-evaluation.md) |
| 8 | Dirty state | The next session starts in a broken tree | Sessions end wherever they happen to stop | Clean-state rule |

## 1. The under-specified task

> "Add search to the app."

Search over what? Full-text or prefix? Is there a results page? What about empty queries? A person would ask. An agent, especially an unattended one, picks the most likely reading and builds it competently.

**Fix: write the spec a contractor would need.**

```markdown
## Goal
Users can search products by name from the header.

## Behaviour
- Case-insensitive substring match on `product.name`.
- Results page at `/search?q=`, 20 per page, newest first.
- Empty query redirects to `/products`.

## Out of scope
- Fuzzy matching, search over descriptions, autocomplete.

## Done when
- `pytest tests/test_search.py` passes (write these tests first).
- `/search?q=lamp` shows only products whose name contains "lamp".
```

Five minutes of writing replaces an hour of rework. The "out of scope" section is the most often forgotten and the most valuable.

## 2. Knowledge that lives outside the repository

"We never call the billing service directly; go through the gateway." Every engineer on the team knows it. It was decided in a meeting. It is written nowhere the agent can read.

An agent's world is its context window, and the only durable way into that window is the repository. If a rule is not in the repo, then for the agent it does not exist.

**Fix:** treat the repository as the single source of truth. The [next page](repo-as-system-of-record.md) covers how.

## 3. Instruction overload

The opposite failure. The team writes everything down, in one file, and keeps adding. The file passes a thousand lines. Now the agent pays to read all of it on every turn, important rules compete with trivia, and nobody can tell what is stale.

A rule that is technically "in the context" can still be functionally invisible.

**Fix:** a short entry file that works as a map, with detail in separate documents loaded on demand. See [memory and skills](../guide/05-memory-and-skills.md).

## 4. Lost continuity

Real work outlasts a context window. Each new session starts with no memory of the last. Without help, the agent spends the first twenty minutes rediscovering the project, then makes decisions that contradict yesterday's.

**Fix:** durable state in files that every session reads first and updates last: a progress log, a feature list, and git history. See [long-running work](long-running-work.md).

## 5. Overreach

Asked to fix a typo in an error message, the agent notices the function is messy and rewrites it, updates three callers, and "modernises" the imports. The diff is 400 lines. The reviewer cannot tell which change mattered.

This is not malice or stupidity. A model trained to be helpful treats visible problems as invitations.

**Fix:**
- State the scope and the non-goals explicitly.
- Add a standing rule: *make the smallest change that satisfies the task; report other problems instead of fixing them.*
- Enforce where you can: a read-only mode for investigation, path-scoped write permissions, a diff-size check in review.

## 6. Under-finishing

The mirror image, and it often appears together with overreach. Given a large goal, the agent starts on everything. It runs out of context or turns with five features half-built and nothing that runs.

**Fix: one unit of work at a time.** Pick a single feature, finish it, verify it, commit it, then pick the next. This is so effective that Anthropic's write-up on long-running agents makes it a core rule of their harness. A feature list ([long-running work](long-running-work.md)) turns the rule into a mechanism.

## 7. Premature victory

The agent writes the code, feels finished, and says so. It may even say "all tests pass" without having run them, or after running them and misreading the output.

Agents are prone to grading their own work generously. The harness must not take their word.

**Fix:**
- Put the verification command in the project instructions and require it before any "done" claim.
- Verify **end to end**, the way a user would: start the app, hit the endpoint, drive the browser. Unit tests passing is not the feature working.
- Have the harness run the check, through a hook or an orchestrator, instead of asking whether it passed.
- Track completion as data that only a real test run may change.

## 8. Dirty state

The session ends mid-refactor: half the callers updated, tests red, a debug print left in. The next session, with no memory, inherits a mess it does not understand and has to guess what was intended.

**Fix: every session ends in a state someone else could pick up.**

```markdown
Before you stop:
- [ ] The build passes and the test suite is green (or failures are listed in PROGRESS.md)
- [ ] No half-applied changes; either finish the unit or revert it
- [ ] Work is committed with a message that says what and why
- [ ] PROGRESS.md says what was done, what is next, and anything surprising
- [ ] Temporary files, debug output and stray servers are cleaned up
```

Think of it as leaving the workshop tidy for the next shift, when the next shift has amnesia.

## A diagnostic habit

When a run goes wrong, ask these in order before blaming the model:

1. **Could a capable human contractor, given exactly what the agent was given, have succeeded?** If not, the spec or the repository is the problem.
2. **Was the needed information in the window at the moment of the mistake?** If not, it is a context or memory problem.
3. **Was there a check that would have caught it?** If not, it is a verification problem.
4. **Did the mistake cause damage, or just a bad diff?** If damage, it is a guardrail problem.

Only when all four come back clean is "the model was not good enough" a reasonable conclusion.

## Sources and further reading

- Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- OpenAI, [Harness engineering](https://openai.com/index/harness-engineering/)
- [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering), whose lecture series explores many of these patterns in depth
