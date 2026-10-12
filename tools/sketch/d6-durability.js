/* Chapter 6 · Durability */
const S6 = '6 · Durability';

diagram('append-vs-rewrite', { title: 'Append one line. Never rewrite the file.', sub: 'Both save the conversation. Only one of them survives a crash in the middle of a save.', section: S6 }, s => {
  s.h(110, 274, 'save the whole list every turn', { c: 'red', fs: 36 });
  s.box(110, 300, 720, 330, { c: 'red', fill: 'white' });
  s.m(144, 356, ['[', '  {"role":"user", ...},', '  {"role":"assistant", ...},', '  {"role":"tool", ...},', '  {"role":"assis'], { fs: 24, lh: 46 });
  s.bolt(640, 500, 1.3);
  s.m(110, 692, ['a crash mid-write = invalid JSON', '= the WHOLE session is gone'], { c: 'red', fs: 26, lh: 40 });
  s.m(110, 808, 'and each save costs more than the last', { c: 'gray', fs: 23 });
  s.text(916, 480, 'vs', { fs: 48, w: 700, a: 'middle', c: 'gray' });

  s.h(1000, 274, 'append each message as it happens', { c: 'green', fs: 36 });
  s.box(1000, 300, 810, 330, { c: 'green', fill: 'white' });
  s.m(1034, 356, ['1 {"role":"user","content":"add /health"}', '2 {"role":"assistant","tool_calls":[call_7]}', '3 {"role":"tool","id":"call_7","content":"ok"}', '4 {"role":"assistant","tool_calls":[call_8]}'], { fs: 23, lh: 46 });
  s.marker(1024, 512, 760, 42, 'red');
  s.m(1034, 540, '5 {"role":"tool","id":"call_8","cont', { fs: 23, c: 'red' });
  s.bolt(1700, 520, 1);
  s.m(1000, 692, ['a crash mid-write = one torn line', 'skip it on load, keep everything else'], { c: 'green', fs: 26, lh: 40 });
  s.m(1000, 808, 'constant cost per message · the full history is kept', { c: 'gray', fs: 23 });
  s.callout('the transcript is the state. so a session is just a file.', { w: 1040 });
});

diagram('the-gap', { title: 'The dangerous gap in every turn', sub: 'Between logging the request and logging its result, the world may have changed and nobody wrote it down.', section: S6 }, s => {
  s.box(392, 440, 1140, 64, { noStroke: true, hatch: 'red', gap: 13, fw: 1.6, r: 4 });
  s.line(150, 472, 1770, 472, { sw: 4 });
  s.num(360, 472, 1, 'ink', { d: 62 }); s.num(960, 472, 2, 'orange', { d: 62 }); s.num(1560, 472, 3, 'ink', { d: 62 });
  s.m(360, 370, ['append to the log:', 'assistant + call_8'], { a: 'middle', fs: 24, lh: 34 });
  s.m(960, 568, ['run the tool', '(the world changes)'], { a: 'middle', fs: 24, lh: 34, c: 'orange' });
  s.m(1560, 370, ['append to the log:', 'the result of call_8'], { a: 'middle', fs: 24, lh: 34 });
  s.bolt(790, 262, 1);
  s.m(840, 320, 'a crash can land anywhere in this stretch', { c: 'red', fs: 25 });
  s.box(190, 660, 720, 170, { c: 'red', fill: 'red' });
  s.h(224, 716, '1. the transcript is illegal', { c: 'red', fs: 36 });
  s.m(224, 764, ['call_8 has no result. the API', 'rejects the very next request.'], { fs: 23, lh: 34 });
  s.box(1010, 660, 720, 170, { c: 'red', fill: 'red' });
  s.h(1044, 716, '2. nobody knows if it happened', { c: 'red', fs: 36 });
  s.m(1044, 764, ['was the file written?', 'was the email sent?'], { fs: 23, lh: 34 });
  s.callout(["don't guess, and don't silently run it again.", 'answer the orphan with the truth and let the model check.'], { w: 1080, fs: 32, y: 884 });
});

diagram('resume-repair', { title: 'Resume = read the file back', sub: 'There is no separate state to restore, because the log already is the state.', section: S6 }, s => {
  const steps = [['read line by line', ['drop a half-written', 'last line'], 'gray'], ['rebuild the list', ['the log IS', 'the state'], 'teal'], ['repair orphans', ['answer every open', 'tool call honestly'], 'amber'], ['re-enter the loop', ['the model re-checks', 'the world, carries on'], 'green']];
  steps.forEach(([t, d, c], i) => { const x = 110 + i * 436;
    s.box(x, 256, 392, 270, { c, fill: c }); s.num(x, 256, i + 1, c, { d: 58 });
    s.h(x + 34, 344, t, { fs: 36, c: c === 'gray' ? 'ink' : c }); s.m(x + 34, 404, d, { fs: 23, lh: 38 });
    if (i < 3) s.arrow(x + 398, 390, x + 430, 390, { head: 14 }); });
  s.h(110, 606, 'what the repaired tail looks like', { fs: 30, c: 'gray' });
  s.box(110, 626, 1700, 200, { c: 'amber', fill: 'white' });
  s.m(144, 680, 'assistant   tool_call  id=call_8   write_file("app/health.py")', { fs: 23 });
  s.m(144, 730, ['tool        id=call_8   INTERRUPTED: the session stopped before this call reported back.', '            Its effect may or may not have happened. Check the current state before retrying.'], { fs: 23, lh: 42, c: 'amber' });
  s.callout('same move as always: turn the damage into a message and let the loop absorb it', { w: 1360, fs: 34 });
});

diagram('failures-to-messages', { title: 'Four failures, one move', sub: 'Durability is a habit: convert every failure into something the loop can continue from.', section: S6 }, s => {
  const rows = [['a tool raises', 'inside your code', 'orange', 'catch it: return "ERROR: ..." as the tool result'], ['the provider fails', '429 · 503 · timeout', 'blue', 'back off and retry; then save and stop cleanly'], ['the window overflows', 'context length exceeded', 'violet', 'compact, then retry the very same turn'], ['the process dies', 'lid closed · OOM · ctrl-c', 'red', 'reload the log, repair orphans, continue']];
  rows.forEach(([t, d, c, fix], i) => { const y = 244 + i * 152;
    s.box(110, y, 520, 120, { c, fill: c, label: t, sub: d, fs: 36, sfs: 21 });
    s.m(680, y + 48, fix, { fs: 23, c });
    s.arrow(1330, y + 44, 1472, 500 + i * 30, { c, sw: 2.8 }); });
  s.box(1484, 400, 340, 290, { c: 'green', fill: 'green' });
  s.circle(1654, 480, 110, { c: 'green', sw: 3.4, rough: 1.8 }); s.circle(1654, 480, 92, { c: 'green', sw: 2.6, rough: 1.8 });
  s.text(1654, 604, ['the loop', 'goes on'], { a: 'middle', fs: 36, w: 700, c: 'green', lh: 42 });
  s.callout('never crash on something the model could have worked around', { w: 1160 });
});

diagram('session-tree', { title: 'Once a session is a file, it can branch', sub: 'Resume, fork and rewind are not features you bolt on. They fall out of the log.', section: S6 }, s => {
  const xs = i => 220 + i * 220;
  for (let i = 0; i < 6; i++) s.line(xs(i) + 38, 430, xs(i + 1) - 38, 430, { sw: 3.4 });
  for (let i = 0; i < 7; i++) { s.circle(xs(i), 430, 76, { c: 'teal', fill: 'teal', off: 3 }); s.m(xs(i), 438, 'm' + (i + 1), { a: 'middle', fs: 23, free: true }); }
  s.arrow(xs(6) + 46, 430, 1680, 430, { c: 'green', sw: 3.6 });
  s.text(1700, 420, ['resume:', 'keep going'], { c: 'green', fs: 30, w: 700, lh: 38 });
  s.arrow(1516, 386, 690, 386, { bend: 130, c: 'red', dash: true, sw: 3.4 });
  s.m(1100, 280, 'rewind: back to a checkpoint (the conversation AND the files)', { a: 'middle', c: 'red', fs: 24 });
  s.arrow(xs(3) + 28, 462, 1080, 618, { c: 'violet', bend: 24, sw: 3.4 });
  [1120, 1340, 1560].forEach((x, i) => { s.circle(x, 640, 76, { c: 'violet', fill: 'violet', off: 3 }); s.m(x, 648, 'm' + (i + 5) + 'b', { a: 'middle', fs: 22, free: true }); if (i) s.line(x - 182, 640, x - 38, 640, { c: 'violet', sw: 3.4 }); });
  s.text(300, 640, ['fork: the same past,', 'a different future'], { c: 'violet', fs: 32, w: 700, lh: 42 });
  s.box(110, 760, 1700, 84, { c: 'gray', fill: 'gray' });
  s.m(144, 812, '{"id":"m5b","parent":"m4","role":"assistant", ...}     every message records its parent: all branches share one file', { fs: 22 });
  s.callout('compaction rewrites what the MODEL sees. it must never destroy the log.', { w: 1260, fs: 34 });
});
