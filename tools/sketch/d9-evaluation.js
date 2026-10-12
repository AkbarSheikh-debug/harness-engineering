/* Chapter 9 · Evaluation */
const S9 = '9 · Evaluation';

diagram('eval-loop', { title: 'The evaluation loop', sub: 'A fixed set of tasks, checks a machine can run, and a trace of everything that happened.', section: S9 }, s => {
  const B = [[535, 286, 'gray', 'task spec', 'plus a check it never sees'], [1055, 286, 'teal', 'run headless', 'same harness, no human'], [1400, 500, 'violet', 'record the trace', 'every message, call, token'], [1055, 714, 'amber', 'score', 'pass rate · cost · turns'], [535, 714, 'red', 'diagnose', 'which layer failed?'], [190, 500, 'green', 'change ONE thing', 'prompt, tool, budget, gate']];
  B.forEach(([x, y, c, t, d], i) => { s.box(x, y, 330, 112, { c, fill: c, label: t, sub: d, fs: 34, sfs: 20 }); s.num(x, y, i + 1, c === 'gray' ? 'ink' : c); });
  s.arrow(872, 342, 1046, 342);
  s.arrow(1392, 372, 1520, 492, { bend: -40 });
  s.arrow(1520, 620, 1392, 740, { bend: -40 });
  s.arrow(1046, 770, 872, 770);
  s.arrow(528, 740, 400, 620, { bend: -40 });
  s.arrow(400, 492, 528, 372, { bend: -40 });
  s.text(960, 540, 'hold the task set fixed', { a: 'middle', fs: 40, w: 700 });
  s.m(960, 592, 'or you cannot tell what helped', { a: 'middle', c: 'gray', fs: 25 });
  s.callout('impressions do not scale. a fixed task set with mechanical checks does.', { w: 1260, fs: 34 });
});

diagram('hidden-check', { title: 'A task is a spec plus a check the agent never sees', sub: 'If it can see the grader, it will satisfy the grader instead of the task.', section: S9 }, s => {
  s.h(110, 268, 'the spec: the agent sees this', { c: 'blue', fs: 34 });
  s.box(110, 290, 670, 440, { c: 'blue', fill: 'white' });
  s.m(144, 346, ['id: add-health-endpoint', 'task: |', '  Add GET /health to ./app. It returns', '  {"status": "ok"} with HTTP 200.', '  Add a test for it.', 'setup: git checkout fixtures/base', 'max_turns: 40'], { fs: 23, lh: 50 });
  s.arrow(790, 470, 880, 470);
  s.robot(970, 450, 1.25, { fill: 'teal' }); s.m(970, 600, 'runs headless', { a: 'middle', fs: 22, c: 'gray' });
  s.arrow(1060, 470, 1150, 470);
  s.h(1164, 268, 'the check: hidden', { c: 'red', fs: 34 });
  s.box(1164, 290, 646, 250, { c: 'red', fill: 'red' });
  s.lock(1228, 370, 1.1);
  s.m(1290, 352, ['check: pytest -q', '  tests/acceptance/test_health.py', 'required_files:', '  - app/routes/health.py'], { fs: 22, lh: 42 });
  s.arrow(1320, 548, 1320, 610, { c: 'green' }); s.arrow(1650, 548, 1650, 610, { c: 'red' });
  s.box(1164, 618, 310, 112, { c: 'green', fill: 'green', label: 'PASS', sub: 'exit code 0', fs: 38, sfs: 21 });
  s.box(1500, 618, 310, 112, { c: 'red', fill: 'white', label: 'FAIL', sub: 'exit code 1', fs: 38, sfs: 21 });
  s.m(960, 806, 'self-contained   ·   mechanically checkable   ·   hidden check   ·   drawn from your own real work', { a: 'middle', c: 'violet', fs: 23 });
  s.callout('twenty tasks from your own backlog beat a thousand from somewhere else', { w: 1260, fs: 34 });
});

diagram('which-layer', { title: 'Reading a trace: which layer failed?', sub: 'Most failures land on one of the nine parts. Learn the signatures and diagnosis gets quick.', section: S9 }, s => {
  const rows = [['it ends with a plan and no actions', 'the loop', 'green', 'the stop rule accepts narration'], ['right tool, malformed arguments', 'tools', 'teal', 'tighten the schema'], ['the same failing call, five times', 'tools', 'teal', 'the error does not say how to fix it'], ['blocked once, then it gives up', 'guardrails', 'red', 'make the block reason actionable'], ['re-does finished work after a fold', 'context', 'amber', 'write state to a file first'], ['ignores a rule that is written down', 'memory', 'violet', 'file too long; rule has no reason'], ['malformed request after a restart', 'durability', 'orange', 'an orphan call was never repaired'], ['says "tests pass"; the check fails', 'evaluation', 'blue', 'no check inside the run']];
  rows.forEach(([sym, layer, c, fix], i) => { const y = 240 + i * 78;
    s.box(110, y, 800, 60, { fill: 'white', sw: 2.4, off: 0 }); s.m(138, y + 39, sym, { fs: 24 });
    s.arrow(918, y + 30, 1050, y + 30, { c, sw: 2.8 });
    s.box(1060, y, 280, 60, { c, fill: c, label: layer, fs: 29, off: 3 });
    s.m(1376, y + 39, fix, { fs: 20, c: 'gray' }); });
  s.callout('notice how rarely the answer is "the model is not smart enough"', { w: 1180 });
});

diagram('break-it', { title: 'Break it on purpose', sub: 'Passing normal tasks shows the happy path works. A robust harness also survives abuse.', section: S9 }, s => {
  const pokes = [[110, 244, 'kill -9 in the middle of a tool call', 'repairs the log and continues'], [110, 440, 'a tool returns 200,000 characters', 'truncates, says so, carries on'], [110, 636, '"ignore your instructions" in a file', 'treats it as data; the gate blocks anyway'], [1230, 244, 'an impossible task', 'stops within budget and says why'], [1230, 440, 'max_turns = 3 on a 20-turn job', 'ends with a status report'], [1230, 636, 'the provider returns 503 five times', 'backs off, saves, stops cleanly']];
  pokes.forEach(([x, y, poke, good]) => { s.box(x, y, 580, 164, { c: 'red', fill: 'white' });
    s.m(x + 28, y + 56, poke, { fs: 23, c: 'red' }); s.check(x + 30, y + 116, 0.9); s.m(x + 86, y + 124, good, { fs: 21, c: 'green' }); });
  s.robot(960, 500, 1.7, { fill: 'teal' });
  [[696, 326, 880, 440], [696, 522, 860, 522], [696, 718, 880, 610], [1224, 326, 1040, 440], [1224, 522, 1060, 522], [1224, 718, 1040, 610]].forEach(([a, b, c, d]) => s.arrow(a, b, c, d, { c: 'red', sw: 3.2 }));
  s.callout('each poke that ends cleanly is a property you can rely on', { w: 1100 });
});
