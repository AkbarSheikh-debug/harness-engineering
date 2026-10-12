/* Chapter 4 · Context */
const S4 = '4 · Context';

diagram('window-budget', { title: 'Where the window goes', sub: 'Illustrative shares for a long coding session. Measure your own; the shape is usually the same.', section: S4 }, s => {
  s.m(1810, 306, 'context limit', { a: 'end', c: 'gray' });
  const segs = [['gray', 68], ['violet', 119], ['green', 85], ['blue', 204], ['orange', 884], ['white', 340]];
  let x = 110;
  segs.forEach(([c, w], i) => { s.box(x, 326, w, 136, i === 5 ? { c: 'gray', dash: true, r: 4 } : { c, fill: c, r: 4, off: 3 }); x += w; });
  s.text(1028, 412, 'tool results  52%', { a: 'middle', fs: 50, w: 700, c: 'orange' });
  s.text(1640, 388, ['reply', 'headroom 20%'], { a: 'middle', fs: 28, c: 'gray', lh: 36 });
  s.line(144, 320, 144, 276, { c: 'gray', sw: 2.4 }); s.m(110, 262, 'system prompt 4%', { c: 'gray', fs: 23 });
  s.line(237, 468, 237, 520, { c: 'violet', sw: 2.4 }); s.m(150, 550, 'tool schemas 7%', { c: 'violet', fs: 23 });
  s.line(340, 320, 340, 306, { c: 'green', sw: 2.4 }); s.m(380, 300, 'project memory 5%', { c: 'green', fs: 23 });
  s.line(484, 468, 484, 520, { c: 'blue', sw: 2.4 }); s.m(420, 550, 'conversation 12%', { c: 'blue', fs: 23 });
  s.h(760, 600, 'the biggest tenant is tool output', { c: 'orange' });
  s.m(760, 648, ['file contents · logs · test runs · search hits', 'so that is where trimming pays off first'], { fs: 24, lh: 36 });
  s.h(760, 772, 'agents read 10-20x more than they write', { c: 'violet' });
  s.m(760, 818, 'because the whole transcript is sent again on every turn', { fs: 24 });
  s.callout(['not the fullest window.', 'the smallest one that holds what the next step needs.'], { w: 1040, fs: 33, y: 886 });
});

diagram('token-growth', { title: 'Why every long run needs a fold', sub: 'Tokens sent per request, turn by turn.', section: S4 }, s => {
  const px = t => 200 + t * 21, py = v => 800 - v * 2.27;
  s.line(200, 800, 1500, 800, { sw: 3.4 }); s.line(200, 800, 200, 260, { sw: 3.4 });
  for (let t = 0; t <= 60; t += 10) s.m(px(t), 838, String(t), { a: 'middle', fs: 21, c: 'gray' });
  s.m(850, 872, 'turn', { a: 'middle', fs: 22, c: 'gray' });
  [50, 100, 150, 200].forEach(v => s.m(184, py(v) + 8, v + 'k', { a: 'end', fs: 21, c: 'gray' }));
  s.line(200, py(200), 1500, py(200), { c: 'red', dash: true, sw: 3 }); s.m(1494, py(200) - 14, 'context limit', { a: 'end', c: 'red', fs: 23 });
  s.line(200, py(140), 1500, py(140), { c: 'amber', dash: true, sw: 3 }); s.m(1494, py(140) - 14, 'compaction budget', { a: 'end', c: 'amber', fs: 23 });
  s.path(`M${px(0)} ${py(8)} L${px(37)} ${py(200)}`, { c: 'red', sw: 5, rough: 1.2 });
  s.cross(px(37), py(200), 1.1); s.m(px(37) + 30, py(200) + 46, ['overflow:', 'the run dies'], { c: 'red', fs: 24, lh: 32 });
  let d = `M${px(0)} ${py(8)}`, v = 8;
  for (let t = 1; t <= 60; t++) { v += 5.2; d += ` L${px(t)} ${py(v)}`; if (v >= 140) { v = 46; d += ` L${px(t)} ${py(v)}`; } }
  s.path(d, { c: 'teal', sw: 5, rough: 0.9 });
  s.m(1560, 330, ['no compaction:', 'a straight line', 'into the wall'], { c: 'red', fs: 25, lh: 38 });
  s.m(1560, 540, ['fold at the budget:', 'a sawtooth that', 'can run all day'], { c: 'teal', fs: 25, lh: 38 });
  s.sticky(1556, 690, 290, 140, ['fold BEFORE the', 'wall, not at it'], { rot: 3, fs: 28 });
  s.callout('a run that never folds pays for its whole history again on every turn', { w: 1240, fs: 34 });
});

diagram('four-moves', { title: 'Four moves of context engineering', sub: 'Almost every technique you will meet is one of these.', section: S4 }, s => {
  const cards = [
    [110, 236, 'blue', 'WRITE', 'put it somewhere outside the window', ['a notes file · a progress log', 'a task list on disk']],
    [980, 236, 'green', 'SELECT', 'pull in only what this step needs', ['read a line range · search first', 'load a skill on demand']],
    [110, 548, 'orange', 'COMPRESS', 'keep the meaning, drop the bulk', ['truncate output · clear old results', 'summarise old turns']],
    [980, 548, 'violet', 'ISOLATE', 'give a sub-task its own window', ['sub-agents: the raw material', 'stays with the child']],
  ];
  cards.forEach(([x, y, c, verb, what, ex]) => { s.box(x, y, 830, 280, { c, fill: c });
    s.h(x + 220, y + 88, verb, { c, fs: 58 }); s.text(x + 220, y + 144, what, { fs: 31 }); s.m(x + 220, y + 198, ex, { fs: 22, lh: 34, c: 'gray' }); });
  s.file(160, 290, 110, 150, { c: 'blue' });
  s.magnifier(1090, 350, 48, { c: 'green' });
  s.poly([[150, 610], [290, 660], [290, 720], [150, 770]], { c: 'orange', fill: 'white' });
  s.robot(1060, 660, 0.8, { fill: 'white', c: 'violet' }); s.robot(1140, 700, 0.6, { fill: 'white', c: 'violet', headOnly: true });
  s.callout('the cheapest token is the one that never enters the transcript', { w: 1160 });
});

diagram('compaction', { title: 'Compaction: fold the old, keep the recent', sub: 'One mechanism. Summarise what is far behind you; leave the last few turns exactly as they were.', section: S4 }, s => {
  s.h(110, 262, 'BEFORE: 14 messages, close to the budget', { fs: 30, c: 'gray' });
  s.box(110, 284, 110, 92, { c: 'gray', fill: 'gray', label: 'sys', font: 'mono', fs: 26, w: 400 });
  for (let i = 0; i < 13; i++) s.box(250 + i * 110, 284, 96, 92, i < 9 ? { fill: 'white', label: 'm' + (i + 1), font: 'mono', fs: 24, w: 400, sw: 2.6 } : { c: 'teal', fill: 'teal', label: 'm' + (i + 1), font: 'mono', fs: 24, w: 400 });
  s.bracket(250, 1226, 404, { c: 'amber', label: 'old turns: fold these', fs: 25 });
  s.arrow(738, 456, 738, 560, { c: 'amber', sw: 3.6 });
  s.m(766, 516, 'one extra model call writes a summary', { c: 'amber', fs: 24 });
  s.h(110, 596, 'AFTER: same meaning, a fraction of the tokens', { fs: 30, c: 'gray' });
  s.box(110, 618, 110, 92, { c: 'gray', fill: 'gray', label: 'sys', font: 'mono', fs: 26, w: 400 });
  s.box(250, 618, 620, 92, { c: 'amber', fill: 'amber', label: 'summary of m1 - m9', fs: 34 });
  for (let i = 0; i < 4; i++) s.box(900 + i * 110, 618, 96, 92, { c: 'teal', fill: 'teal', label: 'm' + (i + 10), font: 'mono', fs: 24, w: 400 });
  s.m(110, 752, ['stable', 'prefix'], { fs: 22, c: 'gray', lh: 30 });
  s.m(250, 752, ['model-written and lossy:', 'goal · decisions · files · next step'], { fs: 22, c: 'amber', lh: 30 });
  s.m(900, 752, ['kept word', 'for word'], { fs: 22, c: 'teal', lh: 30 });
  s.box(1390, 600, 430, 190, { c: 'red', dash: true, sw: 2.6 });
  s.m(1416, 650, ['cut only at a clean', 'boundary: never split a', 'tool call from its result'], { c: 'red', fs: 24, lh: 40 });
  s.callout('a summary is a handoff note to a colleague with amnesia. write it like one.', { w: 1300, fs: 34 });
});

diagram('cache-prefix', { title: 'Keep the front of the prompt boring', sub: 'Providers re-read an unchanged prefix at a fraction of the price. One changed byte near the top throws that away.', section: S4 }, s => {
  const row = (y, bad) => { const parts = bad ? [['10:42:07', 170], ['system', 180], ['tools', 190], ['project memory', 250], ['history ...', 560], ['new turn', 350]] : [['system', 220], ['tools', 230], ['project memory', 270], ['history ...', 620], ['new turn', 360]];
    let x = 110; parts.forEach(([t, w], i) => { const c = bad ? 'red' : (i === parts.length - 1 ? 'orange' : 'green');
      s.box(x, y, w, 104, { c, fill: c, r: 6, label: t, fs: 28, w: 400, font: bad && i === 0 ? 'mono' : 'hand' }); x += w; }); };
  s.bracket(110, 1450, 290, { up: true, c: 'green', label: 'identical to last turn: cached, roughly 10x cheaper to read', fs: 24 });
  s.bracket(1450, 1810, 290, { up: true, c: 'orange', label: 'new: full price', fs: 24 });
  row(304, false);
  s.h(110, 472, 'stable prefix', { c: 'green', fs: 38 });
  s.m(420, 466, '+ volatile data goes last   + tools keep a fixed order   + old messages are never edited', { fs: 22, c: 'green' });
  s.bracket(110, 1810, 580, { up: true, c: 'red', label: 'one byte changed at the front: nothing after it is cached', fs: 24 });
  row(594, true);
  s.h(110, 762, 'volatile prefix', { c: 'red', fs: 38 });
  s.m(420, 756, 'a clock, a random id or a reshuffled tool list at the top quietly doubles the bill', { fs: 22, c: 'red' });
  s.clock(1740, 780, 36, { c: 'red' });
  s.callout('compaction changes the prefix too. that is why it is an event, not a habit.', { w: 1300, fs: 34 });
});
