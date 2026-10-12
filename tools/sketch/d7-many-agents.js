/* Chapters 7 and 8 · Delegation and orchestration */
const S7 = '7 · Delegation', S8 = '8 · Orchestration';

diagram('scouts', { title: 'Send a scout. Get a report.', sub: 'A sub-agent spends its own window on the raw material. Only the conclusion crosses back.', section: S7 }, s => {
  s.box(110, 330, 470, 430, { fill: 'white' });
  s.robot(210, 440, 1, { fill: 'teal' });
  s.h(300, 420, 'the parent', { fs: 40 });
  s.m(150, 580, 'context used', { fs: 21, c: 'gray' });
  s.bar(150, 594, 390, 38, 0.22, { fill: 'teal' });
  s.m(150, 690, ['holds the goal, the plan', 'and three short reports'], { fs: 23, lh: 36 });
  const kids = [['scout A: map the auth module', '40 file reads, then thrown away'], ['scout B: run and triage the tests', 'the full logs never leave this window'], ['scout C: search the docs', 'the dead ends stay in here']];
  kids.forEach(([t, d], i) => { const y = 250 + i * 200;
    s.box(1230, y, 590, 164, { fill: 'white' });
    s.robot(1294, y + 80, 0.62, { fill: 'orange', headOnly: true });
    s.text(1352, y + 52, t, { fs: 27, w: 700 });
    s.bar(1352, y + 70, 430, 30, 0.88, { fill: 'orange' });
    s.m(1352, y + 138, d, { fs: 20, c: 'gray' });
    s.arrow(592, 440 + i * 56, 1220, y + 58, { c: 'blue', sw: 2.8 });
    s.arrow(1220, y + 112, 592, 474 + i * 56, { c: 'green', dash: true, sw: 2.8 }); });
  s.m(640, 290, ['the brief: goal · context ·', 'scope · done · report format'], { c: 'blue', a: 'middle', fs: 22, lh: 30 });
  s.m(900, 850, 'the report: a few hundred tokens of conclusions', { c: 'green', a: 'middle', fs: 22 });
  s.callout('the child burns its own window so the parent does not have to', { w: 1160 });
});

diagram('the-brief', { title: 'The brief is the whole interface', sub: 'A sub-agent knows nothing the parent knows. Only these words cross the boundary.', section: S7 }, s => {
  s.sticky(110, 290, 500, 160, ['"Look into the', 'auth bug."'], { rot: -3, fs: 40 });
  s.m(120, 540, ['which bug?', 'what is already known?', 'may it edit files?', 'when is it finished?', 'what should come back?'], { c: 'red', fs: 26, lh: 48 });
  s.robot(520, 640, 1, { fill: 'white' }); s.text(590, 566, '?', { fs: 64, w: 700, c: 'red', free: true });
  s.text(690, 380, 'vs', { fs: 44, w: 700, c: 'gray', a: 'middle' });
  s.box(770, 236, 1040, 636, { c: 'blue', fill: 'white' });
  const rows = [['GOAL', ['Find why an expired token returns HTTP 500', 'instead of 401.']], ['CONTEXT', ['FastAPI app in ./app. Token decoding itself', 'works: tests/test_jwt.py passes.']], ['SCOPE', ['Read-only. Stay inside ./app and ./tests.', 'Do not modify any file.']], ['DONE WHEN', ['You can name the file and line where the', 'wrong status code comes from.']], ['REPORT', ['Root cause · file:line · the smallest fix ·', 'what you checked and ruled out.']]];
  rows.forEach(([k, v], i) => { const y = 246 + i * 124;
    if (i) s.line(790, y, 1790, y, { c: 'blue', sw: 2, dash: true });
    s.h(806, y + 74, k, { c: 'blue', fs: 33 }); s.m(1040, y + 56, v, { fs: 23, lh: 38 }); });
  s.callout('writing it costs a few hundred tokens. skipping it costs a wasted run.', { w: 1220, fs: 34 });
});

diagram('delegation-rules', { title: 'Rules that keep delegation sane', sub: 'Delegation trades tokens for a clean window. These six rules stop the trade going bad.', section: S7 }, s => {
  s.line(960, 380, 700, 470, { sw: 3 }); s.line(960, 380, 960, 470, { sw: 3 }); s.line(960, 380, 1220, 470, { sw: 3 });
  s.robot(960, 310, 1, { fill: 'teal' });
  [700, 960, 1220].forEach(x => s.robot(x, 540, 0.8, { fill: 'orange' }));
  s.line(700, 620, 640, 700, { c: 'gray', dash: true }); s.line(700, 620, 780, 700, { c: 'gray', dash: true });
  s.robot(640, 760, 0.5, { fill: 'white', c: 'gray', headOnly: true }); s.robot(780, 760, 0.5, { fill: 'white', c: 'gray', headOnly: true });
  s.cross(710, 760, 2.4);
  const L = [[1, 'red', 'no grandchildren', ['recursion multiplies cost', 'and nobody can trace it']], [2, 'blue', 'least privilege', ['a research scout gets', 'read-only tools']], [3, 'amber', 'a budget per child', ['its own turn limit', 'and token cap']]];
  L.forEach(([n, c, t, d], i) => { const y = 290 + i * 180; s.num(124, y, n, c); s.h(166, y + 14, t, { fs: 34, c }); s.m(166, y + 58, d, { fs: 22, lh: 32 }); });
  const R = [[4, 'violet', 'no questions', ['a child cannot ask the user:', 'it finishes, or reports blocked']], [5, 'orange', 'one writer', ['parallel readers are fine.', 'writers get their own worktree']], [6, 'teal', 'reports are data', ['a child may quote hostile text.', 'the parent verifies what matters']]];
  R.forEach(([n, c, t, d], i) => { const y = 290 + i * 180; s.num(1394, y, n, c); s.h(1436, y + 14, t, { fs: 34, c }); s.m(1436, y + 58, d, { fs: 22, lh: 32 }); });
  s.callout('delegate when the raw material is large and the answer is small', { w: 1160 });
});

diagram('delegation-vs-orchestration', { title: 'Who decides the split?', sub: 'Both run several agents. The difference is whether a model or your code does the dispatching.', section: S8 }, s => {
  s.h(110, 282, 'DELEGATION: the model decides', { c: 'violet' });
  s.robot(250, 520, 1.1, { fill: 'violet' });
  s.cloud(330, 320, 400, 150, { label: '"I should send a scout"', fs: 25 });
  s.arrow(350, 560, 560, 600, { c: 'violet', bend: 20 });
  s.robot(640, 610, 0.75, { fill: 'white', c: 'violet' });
  s.m(110, 750, ['shape:     a tree that grows as needed', 'good for:  "I need to look this up"', 'fails by:  wandering and overspending'], { lh: 40, fs: 23 });
  s.line(950, 250, 950, 850, { c: 'gray', dash: true });
  s.h(1010, 282, 'ORCHESTRATION: your code decides', { c: 'teal' });
  s.box(1010, 330, 470, 190, { fill: 'ink' });
  s.m(1040, 386, ['for task in queue:', '    run_agent(task)', '    run_check(task)'], { c: '#8ce99a', fs: 26, lh: 44, free: true });
  [[1580, 350], [1730, 350], [1580, 500], [1730, 500]].forEach(([x, y]) => s.robot(x, y, 0.62, { fill: 'teal', headOnly: true }));
  s.arrow(1486, 420, 1530, 420, { c: 'teal' });
  s.m(1010, 750, ['shape:     a plan you can read first', 'good for:  40 tickets, a nightly job', 'fails by:  rigid plans that do not fit'], { lh: 40, fs: 23 });
  s.callout(['a model is good at judgment inside a task.', 'it is a poor scheduler. scripts are good at that.'], { w: 980, fs: 33, y: 886 });
});

diagram('fleet', { title: 'A fleet is plain code above many loops', sub: 'No model sits at the top. A script owns isolation, concurrency, budget and verification.', section: S8 }, s => {
  s.cylinder(110, 244, 250, 140, { fill: 'gray', label: 'task queue', fs: 26 });
  s.arrow(372, 320, 470, 320);
  s.box(480, 238, 520, 160, { fill: 'ink' });
  s.text(740, 300, 'the orchestrator', { c: 'white', fs: 38, w: 700, a: 'middle', free: true });
  s.m(740, 350, 'plain code, no model inside', { c: '#ced4da', fs: 22, a: 'middle', free: true });
  s.sticky(1140, 232, 640, 170, ['budget + policy', '4 at a time · $20 in total', '2 retries · 30 minutes each'], { rot: 1.5, fs: 28 });
  for (let i = 0; i < 4; i++) { const x = 110 + i * 440;
    s.box(x, 474, 380, 280, { c: 'gray', dash: true, fill: 'gray', off: 0 });
    s.m(x + 20, 508, `worktree ${i + 1}  ·  branch agent/task-${i + 1}`, { fs: 19, c: 'gray' });
    s.box(x + 24, 526, 332, 80, { c: 'teal', fill: 'teal', off: 3, label: 'agent loop', fs: 32 });
    s.arrow(x + 190, 612, x + 190, 636, { head: 12 });
    s.box(x + 24, 642, 332, 96, { c: 'amber', fill: 'amber', off: 3, label: 'check', sub: 'tests it never saw', fs: 32, sfs: 21 });
    s.arrow(740, 404, x + 190, 468, { bend: (i - 1.5) * -14, sw: 2.8 });
    s.arrow(x + 190, 760, 590 + i * 250, 800, { c: 'green', sw: 2.8 }); }
  s.box(460, 806, 1000, 96, { c: 'green', fill: 'green', label: 'collect  →  verify  →  open a pull request', sub: 'a human merges', fs: 34, sfs: 22 });
});

diagram('maker-checker', { title: 'Maker and checker', sub: 'The one doing the work should not be the only one judging it.', section: S8 }, s => {
  s.box(100, 330, 340, 150, { c: 'gray', fill: 'gray', label: 'goal + state file', sub: 'what "done" means', fs: 32, sfs: 21 });
  s.arrow(448, 405, 540, 405);
  s.box(550, 330, 300, 150, { c: 'teal', fill: 'teal', label: 'the maker', sub: 'does the work', fs: 36, sfs: 21 });
  s.arrow(858, 405, 950, 405);
  s.file(966, 318, 150, 176, { c: 'ink' }); s.m(1041, 540, 'the artifact', { a: 'middle', fs: 22, c: 'gray' });
  s.arrow(1128, 405, 1220, 405);
  s.box(1230, 330, 350, 150, { c: 'amber', fill: 'amber', label: 'the checker', sub: ['tests, or a 2nd agent', 'with a written rubric'], fs: 36, sfs: 20 });
  s.arrow(1588, 405, 1690, 405, { c: 'green', label: 'pass', ldy: -16 });
  s.flag(1720, 450, 1.2); s.text(1746, 500, 'done', { fs: 34, w: 700, c: 'green', a: 'middle' });
  s.arrow(1400, 490, 700, 490, { bend: -150, c: 'red', sw: 3.4 });
  s.m(1050, 640, 'fail: specific feedback, appended to the state file', { a: 'middle', c: 'red', fs: 24 });
  s.m(110, 742, 'four ways out:', { fs: 24, c: 'gray' });
  let x = 330; [['goal met', 'green'], ['iteration cap', 'red'], ['budget cap', 'red'], ['no progress, 3 times running', 'red']].forEach(([t, c]) => { x += s.pill(x, 708, t, { c, fill: c, fs: 24 }) + 22; });
  s.callout(['a maker that just spent an hour on something is anchored', 'by its own reasoning. it tends to approve.'], { w: 1160, fs: 32, y: 886 });
});

diagram('headless-door', { title: 'A harness needs a door a program can use', sub: 'The same loop, two entrances. Without the second one, nothing in this chapter is possible.', section: S8 }, s => {
  s.box(110, 250, 580, 580, { c: 'blue', fill: 'blue' });
  s.h(150, 316, 'the human door', { c: 'blue' });
  s.man(400, 420, 1.2, { fill: 'white' });
  s.m(150, 680, ['a person at a keyboard', 'approval prompts', 'streaming text and colours'], { fs: 24, lh: 40 });
  s.box(770, 250, 1040, 580, { c: 'teal', fill: 'teal' });
  s.h(810, 316, 'the program door', { c: 'teal' });
  s.box(810, 346, 960, 124, { fill: 'ink', off: 3 });
  s.m(838, 396, ['$ harness run --task spec.md --mode auto \\', '        --max-turns 60 --json > result.json'], { c: '#8ce99a', fs: 23, lh: 40, free: true });
  [['never waits for a keypress', 0], ['structured output: answer, tokens, turns, exit reason', 1], ['exit codes a script can branch on', 2]].forEach(([t, i]) => { s.check(820, 540 + i * 62, 0.9); s.m(880, 548 + i * 62, t, { fs: 24 }); });
  let x = 820; [['0  finished', 'green'], ['2  out of budget', 'amber'], ['1  failed', 'red']].forEach(([t, c]) => { x += s.pill(x, 740, t, { c, fill: c, fs: 26 }) + 26; });
  s.callout('a harness you can only drive by hand can never join a pipeline', { w: 1160 });
});

diagram('agent-graph', { title: 'Nodes are agent runs. Edges are code.', sub: 'A small pipeline with two cycles. Every backward edge has a cap and an exit to a human.', section: S8 }, s => {
  s.box(90, 372, 180, 96, { c: 'gray', fill: 'gray', label: 'issue', fs: 32 });
  s.arrow(276, 420, 322, 420);
  s.box(330, 362, 250, 116, { c: 'violet', fill: 'violet', label: 'planner', sub: 'read-only', fs: 34, sfs: 21 });
  s.arrow(586, 420, 636, 420);
  s.poly([[740, 330], [844, 420], [740, 510], [636, 420]], { c: 'blue', fill: 'blue' });
  s.text(740, 416, 'plan ok?', { a: 'middle', fs: 26, w: 700, free: true }); s.m(740, 444, 'a human', { a: 'middle', fs: 18, c: 'gray', free: true });
  s.arrow(850, 420, 900, 420);
  s.box(908, 362, 280, 116, { c: 'teal', fill: 'teal', label: 'implementer', sub: 'its own worktree', fs: 34, sfs: 21 });
  s.arrow(1194, 420, 1240, 420);
  s.poly([[1348, 330], [1452, 420], [1348, 510], [1244, 420]], { c: 'blue', fill: 'blue' });
  s.text(1348, 416, 'tests pass?', { a: 'middle', fs: 24, w: 700, free: true }); s.m(1348, 444, 'exit code', { a: 'middle', fs: 18, c: 'gray', free: true });
  s.arrow(1458, 420, 1508, 420, { c: 'green' });
  s.box(1516, 362, 290, 116, { c: 'amber', fill: 'amber', label: 'reviewer', sub: 'fresh context + rubric', fs: 34, sfs: 20 });
  s.arrow(1660, 484, 1660, 596, { c: 'green', label: 'approved', ldx: 72, ldy: 6 });
  s.box(1516, 604, 290, 104, { c: 'green', fill: 'green', label: 'open a PR', sub: 'a human merges', fs: 34, sfs: 21 });
  s.arrow(1320, 500, 1090, 486, { bend: -50, c: 'red' }); s.m(1200, 566, 'no (max 3 tries)', { c: 'red', fs: 21, a: 'middle' });
  s.arrow(1348, 516, 1348, 600, { c: 'red', dash: true });
  s.box(1210, 606, 276, 100, { c: 'red', fill: 'red', label: 'escalate', sub: 'to a human', fs: 32, sfs: 21 });
  s.arrow(1640, 356, 1070, 356, { bend: 90, c: 'red' }); s.m(1350, 268, 'changes requested', { c: 'red', fs: 21, a: 'middle' });
  const rules = ['each node: a narrow job, its own prompt, its own tools, a fresh context', 'each edge: an "if" on something mechanical (exit code, test result, a JSON field)', "state between nodes lives in FILES, never in anybody's memory"];
  rules.forEach((t, i) => { s.check(96, 632 + i * 66, 0.9); s.m(152, 640 + i * 66, t, { fs: 22 }); });
  s.callout('before you add a node, name the failure it prevents', { w: 1000 });
});
