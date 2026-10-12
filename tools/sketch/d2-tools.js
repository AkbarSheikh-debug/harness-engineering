/* Chapter 2 · Tools */
const S2 = '2 · Tools';

diagram('tool-two-faces', { title: 'A tool has two faces', sub: 'A description the model reads, and code the model never sees.', section: S2 }, s => {
  s.h(110, 268, 'what the model reads', { c: 'blue' });
  s.box(110, 290, 720, 500, { c: 'blue', fill: 'blue' });
  s.m(150, 350, ['name:  "edit_file"', '', 'description:', '  "Replace one exact snippet in', '   a file. old_text must match', '   exactly once."', '', 'parameters:', '  path      string  required', '  old_text  string  required', '  new_text  string  required'], { fs: 24, lh: 38 });
  s.line(960, 240, 960, 810, { c: 'red', dash: true, sw: 3.4 });
  s.text(946, 760, 'the model never sees past this line', { rot: -90, c: 'red', fs: 27 });
  s.h(1090, 268, 'what actually runs', { c: 'orange' });
  const steps = [['validate the arguments', 'gray'], ['ask the permission gate', 'red'], ['execute, inside the sandbox', 'teal'], ['cap and trim the output', 'amber'], ['hand back one string', 'green']];
  steps.forEach(([t, c], i) => { const y = 296 + i * 100; s.box(1090, y, 720, 76, { c, fill: c, label: t, fs: 31, w: 400 });
    s.num(1090, y, i + 1, c, { d: 44 }); if (i) s.arrow(1450, y - 22, 1450, y - 4, { head: 12 }); });
  s.arrow(838, 420, 1080, 420, { label: 'call: name + arguments', ldy: -16 });
  s.arrow(1080, 690, 838, 690, { label: 'result: one string', ldy: -16 });
  s.callout(['the description IS the interface.', 'the model acts on those words and on nothing else.'], { w: 1000, fs: 33, y: 882 });
});

diagram('six-tools', { title: 'Six tools cover almost everything', sub: 'A coding agent needs surprisingly few. The shell does the rest.', section: S2 }, s => {
  const cards = [
    ['read_file', 'look', 'a page at a time, never the whole file', 'blue'],
    ['list_dir', 'orient', 'what exists here?', 'teal'],
    ['search', 'find', 'returns path:line, not whole files', 'green'],
    ['write_file', 'create', 'new files and full rewrites', 'amber'],
    ['edit_file', 'change', 'exact-match replace: only the diff', 'orange'],
    ['run_shell', 'everything else', 'tests, builds, git: the adapter', 'violet'],
  ];
  cards.forEach(([name, verb, why, c], i) => { const x = 110 + (i % 3) * 590, y = 238 + Math.floor(i / 3) * 296;
    s.box(x, y, 520, 262, { c, fill: c });
    s.m(x + 170, y + 70, name, { fs: 32, c });
    s.h(x + 170, y + 132, verb, { fs: 44 });
    s.m(x + 34, y + 216, why, { fs: 21, c: 'gray' });
    const dx = x + 46, dy = y + 44;
    if (i === 0) s.file(dx, dy, 86, 108, { c });
    if (i === 1) s.folder(dx - 4, dy + 14, 104, 84, { c, fill: 'white' });
    if (i === 2) s.magnifier(dx + 36, dy + 44, 34, { c });
    if (i === 3) { s.file(dx, dy, 86, 108, { c, lines: 0 }); s.text(dx + 43, dy + 82, '+', { fs: 56, a: 'middle', w: 700, c, free: true }); }
    if (i === 4) { s.file(dx, dy, 86, 108, { c }); s.marker(dx + 10, dy + 56, 62, 16, 'orange'); }
    if (i === 5) s.terminal(dx - 6, dy + 10, 110, 84, { fs: 30 });
  });
  s.callout(['tool schemas ride along on EVERY request.', 'a few sharp tools beat a drawer full of gadgets.'], { w: 1000, fs: 33, y: 882 });
});

diagram('loose-vs-tight', { title: 'A loose form makes the model guess', sub: 'Tighten the parameters and a tool call turns into fill-in-the-blanks.', section: S2 }, s => {
  s.h(120, 270, 'loose', { c: 'red', fs: 46 });
  s.box(120, 292, 740, 220, { c: 'red', fill: 'red' });
  s.m(156, 350, ['schedule(', '   when:     string,', '   options:  object', ')'], { fs: 27, lh: 42 });
  s.m(120, 570, 'what three models will send for "when":', { fs: 22, c: 'gray' });
  ['"tomorrow 3pm"', '"2026-03-01T15:00:00Z"', '"next tuesday-ish"'].forEach((t, i) => { s.m(156, 622 + i * 46, t, { fs: 25, c: 'red' }); s.text(566, 624 + i * 46, '?', { fs: 38, c: 'red', w: 700 }); });
  s.text(120, 800, 'your parser has to guess too.', { fs: 32, c: 'red' });

  s.arrow(880, 400, 1020, 400, { sw: 3.6, label: 'tighten', ldy: -18, lfs: 26 });

  s.h(1040, 270, 'tight', { c: 'green', fs: 46 });
  s.box(1040, 292, 770, 260, { c: 'green', fill: 'green' });
  s.m(1076, 350, ['schedule(', '   date:    string  "YYYY-MM-DD",', '   time:    string  "HH:MM", 24-hour,', '   repeat:  enum [none, daily, weekly]', ')'], { fs: 25, lh: 42 });
  s.m(1040, 610, 'required: date, time', { fs: 24, c: 'green' });
  s.m(1040, 664, 'every model sends:', { fs: 22, c: 'gray' });
  s.m(1076, 714, '{ "date": "2026-03-01", "time": "15:00" }', { fs: 25, c: 'green' });
  s.text(1040, 800, 'fill in the blanks. then validate anyway.', { fs: 32, c: 'green' });
  s.callout('a schema guides the model. it does not bind it.', { w: 940 });
});

diagram('output-cap', { title: 'Every tool result lives in the transcript', sub: 'So bound it at the source: cap by lines and bytes, and say what was dropped.', section: S2 }, s => {
  s.h(110, 262, 'raw tool output', { c: 'red', fs: 36 });
  s.box(110, 284, 380, 500, { c: 'red', hatch: 'red', gap: 15, fw: 1.6 });
  s.box(170, 474, 260, 110, { c: 'red', fill: 'white', off: 0, label: '50,000 lines', sub: 'of test log', fs: 32 });
  s.arrow(500, 534, 552, 534);
  s.poly([[564, 340], [806, 462], [806, 606], [564, 728]], { c: 'amber', fill: 'amber' });
  s.m(686, 546, 'clip()', { fs: 32, a: 'middle', free: true });
  s.arrow(816, 534, 878, 534);

  s.h(890, 262, 'what the model gets', { c: 'green', fs: 36 });
  s.box(890, 284, 520, 500, { c: 'green', sw: 3 });
  s.box(916, 308, 468, 110, { c: 'green', fill: 'green', off: 0, label: 'first 40 lines', fs: 30, w: 400 });
  s.m(916, 474, ['[ ... 49,900 lines omitted.', '  call again with offset=40', '  to read more ... ]'], { fs: 23, lh: 36, c: 'amber' });
  s.box(916, 596, 468, 164, { c: 'green', fill: 'green', off: 0, label: 'last 60 lines', sub: 'the error is usually here', fs: 30, w: 400 });
  s.arrow(1420, 534, 1474, 534);

  s.h(1486, 262, 'the transcript', { c: 'violet', fs: 36 });
  for (let i = 0; i < 6; i++) s.box(1486, 290 + i * 78, 330, 58, i === 3 ? { c: 'orange', fill: 'orange', label: 'this result', fs: 26, w: 400, sw: 2.6 } : { c: 'violet', fill: 'violet', sw: 2.4 });
  s.m(1486, 800, ['paid for again on', 'every later turn'], { c: 'violet', fs: 23, lh: 32 });
  s.callout('never return silence. an empty result looks like a bug and invites a retry.', { w: 1260, fs: 33 });
});

diagram('edit-vs-rewrite', { title: "Change two lines. Don't re-type six hundred.", sub: 'An exact-match edit sends only the difference, and fails loudly when its anchor is wrong.', section: S2 }, s => {
  s.file(130, 250, 250, 330, { c: 'red', lines: 9, lc: 'red' });
  s.box(150, 300, 210, 262, { noStroke: true, hatch: 'red', gap: 14, fw: 1.4 });
  s.h(430, 300, 'write_file', { c: 'red', fs: 42 });
  s.m(430, 356, ['the model re-types all 600 lines', 'slow, and you pay for every one', 'one dropped function = a silent bug'], { fs: 23, lh: 42 });

  s.file(1030, 250, 250, 330, { c: 'green', lines: 9 });
  s.marker(1058, 408, 196, 56, 'green');
  s.h(1330, 300, 'edit_file', { c: 'green', fs: 42 });
  s.m(1330, 356, ['send only  old_text -> new_text', 'cheap, and easy to review', 'no match? it refuses to touch the file'], { fs: 23, lh: 42 });

  s.h(130, 668, 'the uniqueness rule: old_text must match exactly once', { fs: 34 });
  [[130, 'red', '0 matches', 'ERROR: not found. read the file again.'], [710, 'green', '1 match', 'apply the edit'], [1290, 'red', '3 matches', 'ERROR: add surrounding lines']].forEach(([x, c, t, d]) =>
    s.box(x, 700, 500, 118, { c, fill: c, label: t, sub: d, fs: 34, sfs: 21 }));
  s.callout('a silent wrong edit becomes a loud error the model can fix', { w: 1080 });
});
