/* Run against a local static server. Requires Playwright and Chrome. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.BENCHMARK_TEST_URL||'http://127.0.0.1:8778';
const root=path.resolve(__dirname,'..');
const artifacts=process.env.BENCHMARK_ARTIFACTS;
const load=id=>JSON.parse(fs.readFileSync(path.join(root,`data/${id}.json`),'utf8'));
const saved=(page,id)=>page.evaluate(id=>JSON.parse(localStorage.getItem(`benchmark-lab:v2:${id}`)),id);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage(), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 async function go(id=''){await page.goto(`${base}/testing/${id?`${id}/`:''}`);await page.waitForSelector(id?'#setup-form':'.benchmark-card');}
 async function open(id,q){await page.goto(`${base}/testing/${id}/?q=${encodeURIComponent(q)}`);await page.getByRole('button',{name:'Open question',exact:true}).click();await page.waitForSelector('.question-card');}
 async function shot(name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});}}
 await go();assert.equal(await page.locator('.benchmark-card').count(),10);
 await page.locator('#search').fill('nonexistent-qzx');assert.equal(await page.locator('.benchmark-card').count(),0);
 await page.locator('#search').fill('');await page.locator('#domain').selectOption('Math');assert.equal(await page.locator('.benchmark-card').count(),1);
 await page.locator('#domain').selectOption('all');await page.locator('#format').selectOption('Code');assert.equal(await page.locator('.benchmark-card').count(),1);
 await page.locator('#format').selectOption('all');await shot('benchmark-catalog-desktop');
 // A full session covers correct, incorrect, skipped, revealed, persisted, and retry states.
 await go('mmlu-pro');await page.locator('#length').selectOption('5');await page.locator('#start').click();
 let state=await saved(page,'mmlu-pro');assert.equal(new Set(state.ids).size,5);
 const bank=new Map(load('mmlu-pro').map(q=>[q.id,q]));let q=bank.get(state.ids[0]);
 await page.locator(`input[name=answer][value="${q.answer}"]`).check();
 await page.locator('.scratch summary').first().click();await page.locator('#notes').fill('Keep this note <script>safe</script>');
 await page.reload();await page.waitForSelector('.question-card');assert.equal(await page.locator(`input[value="${q.answer}"]`).isChecked(),true);assert.equal(await page.locator('#notes').inputValue(),'Keep this note <script>safe</script>');
 await page.locator('#submit').click();assert.match(await page.locator('#feedback h2').innerText(),/^Correct/);
 await page.reload();await page.waitForSelector('#feedback h2');assert.equal(await page.locator('input[name=answer]').first().isDisabled(),true);
 state=await saved(page,'mmlu-pro');assert.equal(Object.keys(state.responses).length,1);
 await page.locator('#next').click();q=bank.get(state.ids[1]);
 const wrong=q.choices.map(c=>c[0]).find(c=>c!==q.answer);await page.locator(`input[value="${wrong}"]`).check();await page.locator('#submit').click();await page.locator('#next').click();
 await page.locator('#skip').click();await page.locator('#reveal').click();await page.locator('#next').click();
 q=bank.get(state.ids[4]);await page.locator(`input[value="${q.answer}"]`).check();await page.locator('#submit').click();await page.locator('#next').click();
 assert.match(await page.locator('.result-metrics').innerText(),/67%/);assert.match(await page.locator('.result-metrics').innerText(),/2 of 3 graded/);assert.equal(await page.locator('.review-list li').count(),5);
 await shot('benchmark-results-desktop');
 const dl=page.waitForEvent('download');await page.locator('#download').click();assert.match((await dl).suggestedFilename(),/mmlu-pro-practice.json/);
 await page.locator('#missed').click();state=await saved(page,'mmlu-pro');assert.equal(state.ids.length,1);assert.equal(Object.keys(state.responses).length,0);
 // HLE used to drop options after E. Check the repaired F answer and math rendering.
 const hleId='66e8b578d0c1f7390bad120c';await open('hle',hleId);assert.equal(await page.locator('.choice').count(),10);
 await page.waitForSelector('mjx-container',{timeout:30000});assert.ok(await page.locator('mjx-container').count()>3);
 assert.equal(await page.locator('mjx-merror').count(),0);await shot('benchmark-hle-math-desktop');
 await page.locator('input[value="F"]').check();await page.locator('#submit').click();assert.match(await page.locator('#feedback h2').innerText(),/^Correct/);
 // Images and written answers are available without a pretend automatic grade.
 await open('hle','6687ffb1091058ff19128813');await page.locator('.question-image img').waitFor();assert.equal(await page.locator('.question-image img').evaluate(i=>i.complete&&i.naturalWidth>0),true);
 await page.locator('#reveal').click();await page.locator('#self-correct').click();await page.locator('#next').click();assert.match(await page.locator('.result-metrics').innerText(),/N\/A/);
 assert.match(await page.locator('.result-metrics').innerText(),/1 \/ 1/);
 // Numeric signs, decimals, fractions, currency text, and Enter submission.
 await go('gsm8k');assert.equal(await page.locator('#split').inputValue(),'test');assert.match(await page.locator('#pool-count').innerText(),/1,319/);
 await open('gsm8k','gsm8k_0');await page.locator('#answer').fill('144/2');await page.locator('#answer').press('Enter');assert.match(await page.locator('#feedback h2').innerText(),/^Correct/);assert.ok((await page.locator('#feedback').innerText()).includes('48/2'));
 const checks=await page.evaluate(()=>({neg:BenchmarkLab.numericMatch('-2','2'),decimal:BenchmarkLab.numericMatch('1.2','12'),fraction:BenchmarkLab.numericMatch('1/2','0.5'),zero:BenchmarkLab.numericMatch('0','0'),comma:BenchmarkLab.numericMatch('1,000','1000'),invalid:BenchmarkLab.numberValue('NaN'),xss:BenchmarkLab.format('<img src=x onerror=alert(1)><script>alert(1)</script>'),math:BenchmarkLab.format('$$x_1^2$$ and \\(a_b\\)'),currency:BenchmarkLab.format('Spend $5 and $10.',true)}));
 assert.equal(checks.neg,false);assert.equal(checks.decimal,false);assert.equal(checks.fraction,true);assert.equal(checks.zero,true);assert.equal(checks.comma,true);assert.equal(checks.invalid,null);assert.ok(!checks.xss.includes('onerror'));assert.ok(!checks.xss.includes('<script'));assert.ok(checks.math.includes('\\[x_1^2\\]'));assert.ok(checks.math.includes('\\(a_b\\)'));assert.ok(checks.currency.includes('$5 and $10'));
 await open('truthfulqa','truthfulqa_0');await page.locator('#answer').fill('Nothing happens.');await page.locator('#submit').click();assert.equal(await page.locator('#feedback .reference li').count(),5);await page.locator('#self-correct').click();await page.locator('#next').click();assert.match(await page.locator('.result-metrics').innerText(),/0 of 0 graded/);
 // Code remains literal and is not graded by string comparison.
 await open('humaneval','humaneval_0');assert.ok((await page.locator('#question-text pre').innerText()).includes('List[float]'));
 await page.locator('#answer').fill('def has_close_elements(numbers, threshold):\n    return True');await page.locator('#submit').click();assert.match(await page.locator('#feedback h2').innerText(),/Compare your answer/);assert.ok(await page.getByText('Reference tests',{exact:true}).count());await shot('benchmark-code-desktop');
 // Mobile overflow and all route smoke checks.
 await page.setViewportSize({width:390,height:844});await go();await shot('benchmark-catalog-mobile');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await open('hle',hleId);await page.waitForSelector('mjx-container');await shot('benchmark-question-mobile');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 for(const id of ['mmlu','arc','hellaswag','winogrande','boolq']){await go(id);await page.locator('#start').click();await page.waitForSelector('.choice');assert.ok(await page.locator('.choice').count()>1);}
 // Bad and unavailable IDs, corrupt storage, blocked storage, and failed data requests.
 await page.goto(`${base}/testing/mmlu/?q=no-such-question`);await page.waitForSelector('#notice');assert.match(await page.locator('#notice').innerText(),/not found/);
 await page.evaluate(()=>localStorage.setItem('benchmark-lab:v2:boolq','{broken'));await go('boolq');assert.equal(await page.locator('#resume').count(),0);
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});const bp=await blocked.newPage();await bp.goto(`${base}/testing/boolq/`);await bp.locator('#start').click();await bp.waitForSelector('.question-card');assert.match(await bp.locator('#notice').innerText(),/could not be saved/);await blocked.close();
 await page.route('**/data/boolq.json*',r=>r.fulfill({status:503,body:'Unavailable'}));await page.goto(`${base}/testing/boolq/`);await page.getByRole('heading',{name:'Questions could not load'}).waitFor();await page.unroute('**/data/boolq.json*');
 await page.goto(`${base}/testing/math/`);assert.ok(await page.getByRole('heading',{name:'This question set is not available'}).count());
 assert.deepEqual(errors,[]);
 console.log('PASS: catalog, sessions, persistence, answer review, scoring, HLE choices/math/images, numeric edge cases, code, mobile overflow, all active routes, storage and network failures.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
