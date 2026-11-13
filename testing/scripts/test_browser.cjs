/* Run from the repo root with a static server on :8778. Requires Playwright. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const base = process.env.BENCHMARK_TEST_URL || 'http://127.0.0.1:8778';
const shots = process.env.BENCHMARK_ARTIFACTS;
const load = id => new Map(JSON.parse(fs.readFileSync(path.join(__dirname, `../data/${id}.json`), 'utf8')).map(q => [q.id, q]));
const saved = (page, id) => page.evaluate(id => JSON.parse(localStorage.getItem(`benchmarks:v3:${id}`)), id);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1100, height: 900}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const shot = async name => { if (shots) { fs.mkdirSync(shots, {recursive: true}); await page.screenshot({path: path.join(shots, name + '.png'), fullPage: true}); } };
  const open = async (id, q) => { await page.goto(`${base}/testing/${id}/?q=${encodeURIComponent(q)}`); await page.waitForSelector('#answer-form'); };

  await page.goto(`${base}/testing/`);
  assert.equal(await page.locator('.list li').count(), 6);
  await shot('catalog');

  // MMLU-Pro session: correct, wrong, skip, then results and retry.
  const mmlu = load('mmlu-pro');
  await page.goto(`${base}/testing/mmlu-pro/`);
  await page.locator('#length').selectOption('5');
  await page.getByRole('button', {name: 'Start'}).click();
  let s = await saved(page, 'mmlu-pro');
  assert.equal(new Set(s.ids).size, 5);
  let q = mmlu.get(s.ids[0]);
  await page.locator(`input[value="${q.answer}"]`).check();
  await page.reload(); await page.waitForSelector('#answer-form');
  assert.ok(await page.locator(`input[value="${q.answer}"]`).isChecked());
  await page.locator('#submit').click();
  assert.match(await page.locator('.feedback .label').first().innerText(), /^Correct/);
  await shot('choice');
  await page.locator('#next').click();
  q = mmlu.get(s.ids[1]);
  await page.locator(`input[value="${q.choices.map(c => c[0]).find(c => c !== q.answer)}"]`).check();
  await page.locator('#submit').click();
  assert.match(await page.locator('.feedback .label').first().innerText(), /^Wrong/);
  await page.locator('#next').click();
  for (let i = 2; i < 5; i++) { await page.locator('#skip').click(); await page.locator('#next').click(); }
  assert.match(await page.locator('.score').innerText(), /1 \/ 5 correct/);
  assert.equal(await page.locator('.results li').count(), 5);
  await shot('results');
  await page.locator('#missed').click();
  assert.equal((await saved(page, 'mmlu-pro')).ids.length, 4);

  // AIME numeric grading and math rendering.
  const aime = load('aime');
  await open('aime', 'aime-2025-1');
  await page.locator('#answer').fill('abc'); await page.locator('#submit').click();
  assert.match(await page.locator('#note').innerText(), /number/);
  await page.locator('#answer').fill(aime.get('aime-2025-1').answer); await page.locator('#submit').click();
  assert.match(await page.locator('.feedback .label').first().innerText(), /^Correct/);
  await page.waitForSelector('mjx-container', {timeout: 30000});
  await shot('aime');

  // HMMT expression answer is self-graded.
  await open('hmmt', 'hmmt-2026-1');
  await page.locator('#submit').click();
  await page.locator('#right').click();
  assert.match(await page.locator('.feedback .label').first().innerText(), /self-graded/);

  // HLE choices after E, images.
  await open('hle', '66e8b578d0c1f7390bad120c');
  assert.equal(await page.locator('.choice').count(), 10);
  await page.locator('input[value="F"]').check(); await page.locator('#submit').click();
  assert.match(await page.locator('.feedback .label').first().innerText(), /^Correct/);
  await open('hle', '6687ffb1091058ff19128813');
  await page.locator('img.figure').waitFor();
  assert.ok(await page.locator('img.figure').evaluate(i => i.complete && i.naturalWidth > 0));

  // ARC-AGI-2: wrong first attempt, then paint the exact answer.
  const arc = load('arc-agi-2');
  const task = [...arc.values()].find(t => t.answer.length <= 10 && t.answer[0].length <= 10);
  await open('arc-agi-2', task.id);
  await page.locator('#clear').click(); await page.locator('#submit').click();
  assert.match(await page.locator('#note').innerText(), /One attempt left/);
  await page.locator('#gw').fill(String(task.answer[0].length)); await page.locator('#gw').dispatchEvent('change');
  await page.locator('#gh').fill(String(task.answer.length)); await page.locator('#gh').dispatchEvent('change');
  for (let y = 0; y < task.answer.length; y++) for (let x = 0; x < task.answer[0].length; x++) {
    await page.locator(`.palette button[data-c="${task.answer[y][x]}"]`).click();
    await page.locator(`.grid.edit i[data-x="${x}"][data-y="${y}"]`).click();
  }
  await shot('arc');
  await page.locator('#submit').click();
  assert.match(await page.locator('.feedback .label').first().innerText(), /^Correct/);

  // SimpleQA and helpers.
  await page.goto(`${base}/testing/simpleqa/`);
  await page.locator('#subject').selectOption('Music');
  await page.getByRole('button', {name: 'Start'}).click();
  const sq = load('simpleqa');
  assert.ok((await saved(page, 'simpleqa')).ids.every(id => sq.get(id).category === 'Music'));
  const h = await page.evaluate(() => ({frac: BenchmarkLab.numericMatch('1/2', '0.5'), neg: BenchmarkLab.numericMatch('-2', '2'), comma: BenchmarkLab.numericMatch('1,000', '1000'), xss: BenchmarkLab.format('<img src=x onerror=alert(1)>'), math: BenchmarkLab.format('$$x_1^2$$')}));
  assert.ok(h.frac && !h.neg && h.comma && !h.xss.includes('onerror') && h.math.includes('\\[x_1^2\\]'));

  // Mobile overflow.
  await page.setViewportSize({width: 390, height: 844});
  for (const [id, qid] of [['hle', '66e8b578d0c1f7390bad120c'], ['arc-agi-2', task.id]]) {
    await open(id, qid);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, id);
  }
  await shot('arc-mobile');

  // Broken storage and failed data.
  await page.evaluate(() => localStorage.setItem('benchmarks:v3:aime', '{broken'));
  await page.goto(`${base}/testing/aime/`); await page.waitForSelector('#setup');
  assert.equal(await page.locator('#resume').count(), 0);
  await page.route('**/data/aime.json*', r => r.fulfill({status: 503}));
  await page.goto(`${base}/testing/aime/`);
  await page.getByRole('heading', {name: 'Could not load questions'}).waitFor();

  assert.deepEqual(errors, []);
  console.log('PASS');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
