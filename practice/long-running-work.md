# Long-running work

A task that takes an afternoon will not fit in one context window. It will be done across several sessions, and each session begins with no memory of the one before.

The answer is not a bigger window or a better summary. It is a **working method**: a small set of files that carry state forward, and a routine every session follows.

## The shape of the problem

Imagine a project staffed by engineers in shifts, where each new engineer arrives with total amnesia. The project still succeeds if every shift:

- finds out quickly where things stand,
- does one well-defined piece of work,
- proves that piece works, and
- leaves a clear note and a clean workbench.

That is exactly the situation, and exactly the method.

![Session 1 initialises; every later session follows six steps; four files carry state between them](../assets/diagrams/session-routine.png)

## Initialisation is its own phase

The first session is different from all the others. Its job is not to build features. It is to **build the environment in which features can be built**.

An initialising session should produce:

| Artifact | Purpose | Done when |
|----------|---------|-----------|
| A **feature list** | Every requirement, expanded into small, testable items, all marked failing | Each item has a verify command |
| An **`init.sh`** (or equivalent) | One command that installs dependencies and starts whatever is needed | It works from a fresh clone |
| A **progress file** | Present, with the format later sessions will follow | It exists |
| A **scaffold** | Directory structure, test runner wired up | One trivial test passes |
| A **first commit** | A known-good baseline to return to | `git log` shows it |

Why a separate phase? Because an agent asked to "build the app" in one go will start coding immediately, and the things that make later sessions productive never get made. Giving initialisation its own prompt, and its own definition of done, fixes that.

An initialiser prompt in outline:

```text
You are setting up a project. Do NOT implement features in this session.

1. Read SPEC.md. Expand it into feature_list.json: small, independently testable
   items, each with a verify command. Mark every item "passes": false.
2. Create the project scaffold and a test runner. Add one trivial passing test.
3. Write init.sh: one command that installs dependencies and starts the dev server.
4. Create PROGRESS.md using the template.
5. Commit. Then stop and report what you created.
```

## The feature list

A feature list is the difference between "make progress" and a mechanism for it.

![A feature list entry, the four jobs the list does, and a progress bar](../assets/diagrams/feature-list.png)

```json
{
  "features": [
    {
      "id": "F001",
      "description": "A new user can register with an email and password",
      "verify": "pytest tests/e2e/test_register.py::test_register_success",
      "depends_on": [],
      "passes": false
    },
    {
      "id": "F002",
      "description": "Registering with an existing email shows a clear error",
      "verify": "pytest tests/e2e/test_register.py::test_duplicate_email",
      "depends_on": ["F001"],
      "passes": false
    }
  ]
}
```

It does four jobs at once:

| Job | How |
|-----|-----|
| **A plan** | It survives the context window, unlike a plan in the conversation |
| **A scope fence** | Work not on the list is out of scope |
| **A progress meter** | Anyone can read it: 14 of 40 passing |
| **A definition of done** | It is data, not opinion |

### Sizing a feature

The commonest mistake is items that are too big. A feature should be finishable *and verifiable* in one session.

| Too big | Right size |
|---------|-----------|
| "User accounts" | "A new user can register with an email and password" |
| "Search" | "Searching for a product name returns matching products, newest first" |
| "Error handling" | "A request with an expired token returns 401 with a JSON error body" |

A good test: can you write the verify command before writing the feature? If not, the item is too vague or too large.

### Three rules that make it trustworthy

1. **`passes` changes only after the verify command actually succeeded.** Not because the code looks right.
2. **Descriptions and verify commands are not edited to make a feature pass.** If a feature is wrong, that is a conversation with a human, not a quiet rewrite. Agents under pressure to finish will otherwise weaken the test. If your harness supports it, make this a hard rule: a hook that rejects any edit which changes a `verify` field.
3. **Small items.** See above.

A starter is in [`templates/feature_list.json`](https://github.com/AkbarSheikh-debug/harness-engineering/blob/main/templates/feature_list.json).

## The session routine

### 1. Orient

Before touching anything, read:

```bash
cat PROGRESS.md             # what the last session did and recommended
git log --oneline -15       # what actually changed
cat feature_list.json       # what is done and what is not
```

Git history is an under-used memory. It is accurate by construction, it is already there, and it records *why* if the commit messages are decent. When the progress file and the git log disagree, believe git.

### 2. Check health

Run the init script and the existing tests. If something that was passing is now failing, **fix that first**. Building a new feature on a broken base compounds the damage, and the cause is easiest to find while it is recent.

This step also catches the previous session's lies. If the progress file says "F014 passing" and its verify command fails, the feature list is wrong, and correcting it is the first job.

### 3. Pick one

Choose a single failing feature, usually the highest-priority one whose dependencies are done. Say which one, in the progress file, before starting.

One at a time is the rule that prevents both [overreach and under-finishing](failure-modes.md).

### 4. Implement and verify, end to end

Then prove it the way a user would experience it.

| Kind of system | "End to end" means |
|----------------|--------------------|
| Web app | Drive a real browser: load the page, click, read the result |
| API | Start the server, send a real request, check the response and the stored data |
| CLI | Run the command with real arguments, check output and exit code |
| Library | A test that uses the public interface as a caller would |
| Data pipeline | Run it on a small real sample, inspect the output |

Unit tests are necessary and not sufficient. A function can be correct while the feature is broken because nothing calls it, the route is not registered, or the button is hidden behind another element. Giving an agent the means to look (a browser tool, the ability to start the server and read its logs) changes what it catches. Anthropic's write-up on this subject reports exactly that: agents given browser automation found bugs that were invisible from the code alone.

### 5. Record and commit

Flip `passes` to `true`, commit with a descriptive message, and update the progress file. Commit *per feature*, so that any feature can be reverted on its own and the history reads as a list of completed units.

### 6. Leave it clean

```markdown
- [ ] Build passes; tests green, or known failures listed
- [ ] No half-applied changes
- [ ] Everything committed
- [ ] PROGRESS.md updated
- [ ] No stray processes, temp files or debug output
```

If you are about to run out of context or turns mid-feature, the right move is to *revert* the half-done work and record what you learned, not to commit something broken. A clean tree with a good note beats a dirty tree with more code.

## The progress file

Keep it short and write it for a reader with no context.

```markdown
# Progress

## Current state
14 of 40 features passing. Auth and product listing are complete. Cart is next.

## Last session (2026-01-14)
- Finished F013 (product detail page) and F014 (out-of-stock badge).
- Found that image URLs break when the CDN variable is unset; added a fallback and a test.

## Next
- F015: add to cart. The cart model exists (app/models/cart.py) but has no routes yet.

## Watch out
- `test_checkout_tax` is flaky because it depends on the system clock. Re-run once before investigating.
- Do not upgrade the payments SDK; version 4 changes the webhook signature (see docs/decisions/0007).
```

| Section | Answers | Keep it to |
|---------|---------|------------|
| Current state | Where are we? | Two sentences |
| Last session | What just happened? | A few bullets |
| Next | Where do I start? | One item, with file paths |
| Watch out | What will trip me up? | Only what is genuinely surprising |

A starter is in [`templates/PROGRESS.md`](https://github.com/AkbarSheikh-debug/harness-engineering/blob/main/templates/PROGRESS.md).

Notice what is *not* there: a diary of every command. The transcript and git history hold that. The progress file holds judgment. Rewrite it each session rather than appending forever; a progress file that grows without limit has the same problem as a giant instruction file.

## Handoffs between different agents

The same discipline applies when work passes between a planner and an implementer, an implementer and a reviewer, or a human and an agent. A handoff note answers five questions:

1. What was the goal?
2. What is done, and how was it verified?
3. What is not done?
4. What should the next person do first?
5. What did you learn that is not obvious from the code?

The fifth is the one that only the departing worker can supply, and the one most often left out.

## Automating the shifts

Once the routine is this regular, a script can run it:

```bash
while ! all_features_pass; do
    harness run --task "$(cat prompts/session.md)" --mode auto --max-turns 80 --json >> runs.jsonl
    [ "$(sessions_without_progress)" -ge 3 ] && break     # stuck: stop and ask a human
done
```

Each iteration is a fresh agent with an empty context, reading the same files and doing the next feature. That is the simplest form of the loop described in [loops and graphs](loops-and-graphs.md), and the *no-progress* exit is not optional.

## Why this works

Every element replaces something a context window cannot hold with something a file can:

| Instead of relying on… | Use… |
|------------------------|------|
| The agent remembering the plan | A feature list |
| The agent remembering what happened | A progress file and git history |
| The agent's sense that it is done | A verify command and a boolean |
| The environment happening to be ready | An init script |
| The next session coping with a mess | A clean-state rule |

It is ordinary engineering practice, made explicit because the worker has no memory.

## Sources and further reading

- Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents): the initializer agent, feature list, incremental progress and clean-state ideas originate here
- [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering): lectures and templates on continuity, initialisation, feature lists and clean state
