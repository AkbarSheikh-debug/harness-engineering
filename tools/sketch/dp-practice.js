/* Working with agents */
const SP = 'Working with agents';

diagram('eight-failures', { title: 'Eight ways capable agents still fail', sub: 'None of them needs a smarter model. Each one has a fix on the harness side.', section: SP }, s => {
  const cards = [['under-specified', 'task', 'a fine answer, wrong problem', 'the spec', 'blue'], ['knowledge outside', 'the repo', 'breaks a rule "everyone knows"', 'the repo', 'teal'], ['instruction', 'overload', 'the rule is on line 1,400', 'a map, not a manual', 'violet'], ['lost', 'continuity', 'session 3 undoes session 2', 'progress files', 'amber'], ['overreach', '', 'one fix became a 400-line diff', 'scope + non-goals', 'orange'], ['under-finishing', '', 'five features, none working', 'one unit at a time', 'pink'], ['premature', 'victory', '"all done!" and the tests fail', 'run the check', 'red'], ['dirty state', '', 'the next shift inherits a mess', 'a clean-state rule', 'green']];
  cards.forEach(([a, b, sym, fix, c], i) => { const x = 110 + (i % 4) * 432, y = 240 + Math.floor(i / 4) * 300;
    s.box(x, y, 400, 268, { c, fill: c }); s.num(x, y, i + 1, c);
    s.h(x + 34, y + 76, b ? [a, b] : a, { c, fs: 35, lh: 42 });
    s.m(x + 26, y + 180, sym, { fs: 19.5 });
    s.m(x + 26, y + 232, 'fix: ' + fix, { fs: 21, c: 'green' }); });
  s.callout('could a capable contractor have succeeded with exactly what the agent was given?', { w: 1420, fs: 33 });
});

diagram('session-routine', { title: 'Work in shifts, for a worker with amnesia', sub: 'The first session builds the workshop. Every later session follows the same six steps.', section: SP }, s => {
  s.box(100, 250, 340, 330, { c: 'violet', fill: 'violet' });
  s.h(130, 310, 'session 1', { c: 'violet', fs: 40 });
  s.m(130, 360, ['initialise only:', '+ feature list', '+ init script', '+ scaffold + tests', '+ first commit'], { fs: 23, lh: 40 });
  s.arrow(448, 310, 524, 310);
  const steps = [[534, 250, 'orient', 'progress · git log · features'], [962, 250, 'check health', 'run init + the tests first'], [1390, 250, 'pick ONE feature', 'the next failing one'], [1390, 440, 'implement', 'the smallest change'], [962, 440, 'verify end to end', 'the way a user would'], [534, 440, 'commit, leave clean', 'flip passes · update progress']];
  steps.forEach(([x, y, t, d], i) => { s.box(x, y, 400, 120, { c: 'teal', fill: 'teal', label: t, sub: d, fs: 33, sfs: 20 }); s.num(x, y, i + 1, 'teal'); });
  s.arrow(940, 310, 956, 310, { head: 12 }); s.arrow(1368, 310, 1384, 310, { head: 12 });
  s.arrow(1590, 376, 1590, 432); s.arrow(1384, 500, 1368, 500, { head: 12 }); s.arrow(956, 500, 940, 500, { head: 12 });
  s.arrow(640, 434, 640, 378, { c: 'red', dash: true }); s.m(664, 414, 'next session', { c: 'red', fs: 20 });
  s.h(110, 668, 'what carries over:', { fs: 32, c: 'gray' });
  s.file(480, 640, 110, 140, { c: 'blue', label: 'feature_list.json', fs: 21 });
  s.file(790, 640, 110, 140, { c: 'green', label: 'PROGRESS.md', fs: 21 });
  s.cylinder(1090, 648, 130, 130, { fill: 'amber' }); s.m(1155, 810, 'git log', { a: 'middle', fs: 21 });
  s.terminal(1400, 660, 170, 110, { fs: 30 }); s.m(1485, 810, 'init.sh', { a: 'middle', fs: 21 });
  s.line(100, 846, 1820, 846, { sw: 4, c: 'gray' });
  s.callout('every session ends in a state someone else could pick up', { w: 1100, y: 902 });
});

diagram('feature-list', { title: 'A feature list turns "make progress" into a mechanism', sub: 'One file that is a plan, a fence, a meter and a definition of done at the same time.', section: SP, tfs: 58 }, s => {
  s.box(110, 250, 780, 420, { c: 'blue', fill: 'white' });
  s.marker(136, 518, 330, 40, 'amber');
  s.m(144, 304, ['{', '  "id": "F002",', '  "description": "Registering with an', '      existing email shows a clear error",', '  "verify": "pytest tests/e2e/', '      test_register.py::test_duplicate",', '  "passes": false', '}'], { fs: 23, lh: 40 });
  s.m(110, 730, ['"passes" flips to true only after the verify', 'command has really succeeded'], { c: 'red', fs: 23, lh: 34 });
  s.h(990, 296, 'it does four jobs at once', { fs: 38 });
  ['a plan that survives the context window', 'a scope fence: not on the list = out of scope', 'a progress meter anyone can read', 'a definition of done that is data, not opinion'].forEach((t, i) => { s.num(1010, 362 + i * 70, i + 1, 'blue', { d: 44 }); s.text(1052, 374 + i * 70, t, { fs: 29 }); });
  s.bar(990, 654, 800, 50, 0.35, { fill: 'green' });
  s.m(990, 744, '14 of 40 features passing', { c: 'green', fs: 26 });
  let x = 110; [['flip only on a real pass', 'green'], ['never edit a test to make it pass', 'red'], ['small enough for one session', 'blue']].forEach(([t, c]) => { x += s.pill(x, 808, t, { c, fill: c, fs: 23 }) + 22; });
  s.callout('an agent under pressure will weaken the test. make that a conversation, not a quiet edit.', { w: 1500, fs: 32 });
});

diagram('three-levels', { title: 'Three levels of taking yourself out of the loop', sub: 'Climb one step at a time. Most work never needs the third.', section: SP, tfs: 60 }, s => {
  s.box(110, 620, 530, 240, { c: 'blue', fill: 'blue' });
  s.h(142, 680, '1  supervised', { c: 'blue', fs: 42 });
  s.m(142, 726, ['you drive, turn by turn', 'one agent, one session'], { fs: 22, lh: 34 });
  s.text(142, 836, 'you are IN the loop', { fs: 32, w: 700, c: 'blue' });
  s.box(695, 460, 530, 400, { c: 'orange', fill: 'orange' });
  s.h(727, 520, '2  a loop', { c: 'orange', fs: 42 });
  s.m(727, 566, ['a script repeats one agent', 'maker · checker · state file', 'a hard cap on iterations'], { fs: 22, lh: 34 });
  [116, 96].forEach(d => s.circle(1110, 730, d, { c: 'orange', sw: 3, rough: 1.8 }));
  s.text(727, 836, 'you are ON the loop', { fs: 32, w: 700, c: 'orange' });
  s.box(1280, 300, 530, 560, { c: 'violet', fill: 'violet' });
  s.h(1312, 360, '3  a graph', { c: 'violet', fs: 42 });
  s.m(1312, 406, ['a script routes between agents', 'nodes = agent runs', 'edges = code: exit codes, tests', 'state lives in files'], { fs: 22, lh: 34 });
  [[1330, 620], [1500, 580], [1500, 680], [1670, 630]].forEach(([x, y]) => s.box(x, y, 96, 60, { c: 'violet', fill: 'white', off: 0, r: 8 }));
  s.arrow(1430, 640, 1494, 614, { c: 'violet', head: 12 }); s.arrow(1430, 660, 1494, 700, { c: 'violet', head: 12 }); s.arrow(1600, 612, 1664, 650, { c: 'violet', head: 12 }); s.arrow(1600, 706, 1664, 674, { c: 'violet', head: 12 });
  s.text(1312, 836, 'you DESIGN the loop', { fs: 32, w: 700, c: 'violet' });
  s.m(110, 300, ['climb when your side of the', 'conversation has become mechanical:', '"run the tests"  "fix that"', '"now the next one"'], { c: 'red', fs: 24, lh: 40 });
  s.arrow(520, 560, 680, 480, { c: 'red', bend: -30 }); s.arrow(1120, 420, 1270, 340, { c: 'red', bend: -30 });
  s.callout('if you could write your half of the conversation in advance, a script can say it', { w: 1400, fs: 33, y: 902, h: 78 });
});

diagram('rule-reason-check', { title: 'Write invariants, not instructions', sub: 'Say what must stay true and how to check it. Leave the route to the model.', section: SP }, s => {
  s.h(110, 274, 'micromanaging the route', { c: 'red', fs: 38 });
  s.box(110, 298, 760, 330, { c: 'red', fill: 'white' });
  s.m(144, 356, ['When adding an endpoint:', '1. create a file in routes/', '2. define a Pydantic model', '3. register it in main.py', '4. then add a test in ...'], { fs: 25, lh: 50 });
  s.m(110, 700, ['goes stale when the framework changes', 'fails as soon as a task does not fit the script'], { c: 'red', fs: 24, lh: 40 });
  s.arrow(884, 460, 1020, 460, { sw: 3.6 });
  s.h(1040, 274, 'stating an invariant', { c: 'green', fs: 38 });
  s.box(1040, 298, 770, 330, { c: 'green', fill: 'white' });
  [['RULE', 'Money is Decimal, never float.', 'blue'], ['WHY', 'Float rounding caused a billing error.', 'amber'], ['CHECK', '`make lint` fails on float math in billing/', 'green']].forEach(([k, v, c], i) => { const y = 330 + i * 96; s.pill(1068, y, k, { c, fill: c, fs: 24 }); s.m(1210, y + 32, v, { fs: 22 }); });
  s.m(1040, 700, ['says what must stay true, and how to prove it', 'the route is left to the model'], { c: 'green', fs: 24, lh: 40 });
  s.callout(['the reason handles cases you did not foresee.', 'the check means you never rely on its memory.'], { w: 1000, fs: 33, y: 886 });
});
