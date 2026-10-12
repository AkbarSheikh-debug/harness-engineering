/* Chapter 0 · What a harness is */
const S0 = '0 · What a harness is';

diagram('model-call', { title: 'A model call is a dead end', sub: 'Messages go in. One message comes out. Then the machine goes quiet.', section: S0 }, s => {
  s.box(90, 280, 480, 310, { c: 'blue', fill: 'blue' });
  s.h(120, 336, 'what goes in', { fs: 36, c: 'blue' });
  s.m(120, 396, ['system   you are a coding agent', 'user     fix the failing test', 'tools    read_file, run_shell', 'history  everything so far'], { fs: 22, lh: 44 });
  s.arrow(584, 436, 702, 436);
  s.chip(724, 376, 300, 122, { sub: 'text in, text out', sfs: 21 });
  s.arrow(1048, 436, 1166, 436);
  s.box(1184, 280, 630, 310, { c: 'green', fill: 'green' });
  s.h(1214, 336, 'what comes out', { fs: 36, c: 'green' });
  s.m(1214, 400, ['"I\'ll open config.yaml and', ' check the database port."'], { fs: 25, lh: 40 });
  s.text(1214, 506, 'one message. then silence.', { c: 'gray', fs: 30 });
  s.text(1214, 556, 'the file was never opened.', { c: 'red', fs: 32, w: 700 });

  [[90, 'no memory', 'every call starts from zero'], [690, 'no hands', 'it can describe, not do'], [1290, 'no persistence', "it can't wait, retry or resume"]].forEach(([x, t, d]) => {
    s.box(x, 660, 540, 150, { c: 'red', dash: true, sw: 2.6 });
    s.cross(x + 64, 735, 1.3); s.h(x + 118, 724, t, { fs: 40, c: 'red' }); s.m(x + 118, 772, d, { fs: 22, c: 'gray' }); });
  s.callout(['so who read forty files and ran the tests?', 'something else did: the harness.'], { w: 980, fs: 33 });
});

diagram('harness-anatomy', { title: 'Everything around the model is harness', sub: 'Nine parts, each one wrapping the one inside it. This guide spends a chapter on each.', section: S0 }, s => {
  const rings = [
    ['9  evaluation', 'did it actually work?', 'gray'],
    ['7  delegation    8  orchestration', 'how does work spread out?', 'violet'],
    ['6  durability', 'what survives a crash?', 'red'],
    ['4  context    5  memory + skills', 'what fits? what lasts?', 'amber'],
    ['2  tools    3  guardrails', 'what may it touch?', 'teal'],
    ['1  the loop', 'decide, act, repeat', 'green'],
  ];
  rings.forEach(([label, q, c], i) => { const x = 110 + 110 * i, y = 228 + 72 * i, w = 1700 - 220 * i, h = 650 - 96 * i;
    s.box(x, y, w, h, { c, fill: c, r: 18 });
    s.h(x + 28, y + 50, label, { fs: 32, c }); s.m(x + w - 28, y + 48, q, { a: 'end', fs: 22, c }); });
  s.chip(790, 664, 340, 82, { label: 'THE MODEL', fs: 34, pins: 2 });
  s.callout('the model decides. every ring around it is code you write.', { w: 1100 });
});

diagram('three-crafts', { title: 'Prompt, context, harness: three crafts, nested', sub: 'They are not the same job. Each one contains the one before it.', section: S0 }, s => {
  s.box(110, 232, 1700, 646, { c: 'violet', fill: 'violet', r: 20 });
  s.h(150, 292, 'HARNESS ENGINEERING', { c: 'violet' });
  s.m(150, 334, 'the machinery that builds the window and acts on the reply, turn after turn', { c: 'violet', fs: 23 });
  s.box(150, 370, 1110, 478, { c: 'blue', fill: 'blue', r: 18 });
  s.h(190, 430, 'CONTEXT ENGINEERING', { c: 'blue' });
  s.m(190, 472, 'everything that is in the window right now', { c: 'blue', fs: 23 });
  s.box(190, 510, 560, 306, { c: 'orange', fill: 'orange', r: 16 });
  s.h(226, 570, 'PROMPT ENGINEERING', { c: 'orange', fs: 36 });
  s.m(226, 612, 'one piece of text', { c: 'orange', fs: 23 });
  s.m(226, 680, ['"You are a careful coding', ' agent. Read before you', ' edit. Run the tests."'], { fs: 22, lh: 36 });
  s.m(800, 560, ['+ which files to include', '+ which history to keep', '+ which tool output stays', '+ what gets dropped'], { fs: 23, lh: 46, c: 'blue' });
  s.m(1300, 420, ['+ when do we compact?', '+ which calls need approval?', '+ what happens after a crash?', '+ who checks that it is done?', '+ how do ten agents share work?'], { fs: 23, lh: 46, c: 'violet' });
  s.robot(1640, 742, 1.05, { fill: 'white' });
  s.callout('learn the outer craft and you get the inner two along the way', { w: 1160 });
});

diagram('outside-the-model', { title: 'Would a perfect model still have this problem?', sub: 'If the answer is yes, it belongs to the harness. No model release will fix it.', section: S0 }, s => {
  s.ellipse(960, 540, 660, 380, { c: 'green', dash: true, sw: 3 });
  s.chip(800, 470, 320, 124, { label: 'a PERFECT model', fs: 31, sub: 'as smart as you like', sfs: 21 });
  s.m(960, 672, 'the harness handles these', { c: 'green', a: 'middle', fs: 24 });
  const cards = [
    [110, 244, 'red', 'the window is finite', 'that is arithmetic, not reasoning'],
    [110, 468, 'orange', 'processes die', 'lids close, networks drop, APIs 503'],
    [110, 692, 'amber', "some actions can't be undone", '99.9% right is still wrong, eventually'],
    [1350, 244, 'blue', 'tasks outgrow one conversation', 'hours of work, one window'],
    [1350, 468, 'violet', 'every token costs money', 'and history is re-sent each turn'],
    [1350, 692, 'teal', 'it only knows what it is shown', 'your conventions live in your head'],
  ];
  cards.forEach(([x, y, c, t, d]) => s.box(x, y, 460, 140, { c, fill: c, label: t, sub: d, fs: 29, sfs: 20 }));
  s.arrow(574, 330, 706, 420, { bend: -20 }); s.arrow(574, 538, 626, 538); s.arrow(574, 750, 706, 664, { bend: 20 });
  s.arrow(1346, 330, 1214, 420, { bend: 20 }); s.arrow(1346, 538, 1294, 538); s.arrow(1346, 750, 1214, 664, { bend: -20 });
  s.callout(['a smarter model lets you delete some scaffolding.', 'never the loop, the gate, or the log.'], { w: 1000, fs: 33, y: 882 });
});
