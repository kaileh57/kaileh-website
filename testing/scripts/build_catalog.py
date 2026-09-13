"""Build the catalog and route shells from local question files."""
import json
from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parents[1]
# Counts are derived from the bundled files, not the benchmark's full release.
DEFINITIONS=[
 ('mmlu-pro','MMLU-Pro','Knowledge','Reason through academic questions with up to ten answer choices. Filter by subject to stay in your field.','Challenging','Choice','https://github.com/TIGER-AI-Lab/MMLU-Pro','https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro','Test split','The bundled test split includes the upstream January 2026 option-format corrections.','choice'),
 ('gsm8k','GSM8K','Math','Work through everyday math problems, then compare your steps with the reference solution.','Start here','Number','https://github.com/openai/grade-school-math','https://huggingface.co/datasets/openai/gsm8k','Train and test splits','The test split is selected by default. Enter a final number without units.','numeric'),
 ('hle',"Humanity's Last Exam",'Specialist','Explore expert-written questions in research-level subjects. Some questions include diagrams or images.','Specialist','Mixed','https://github.com/centerforaisafety/hle','https://huggingface.co/datasets/cais/hle','Bundled 2,500-question snapshot','All original answer choices are included. Written answers need your own review, including equivalent mathematical forms.','mixed'),
 ('mmlu','MMLU','Knowledge','Choose a subject and try four-option questions spanning school, university, and professional knowledge.','Broad knowledge','Choice','https://github.com/hendrycks/test','https://huggingface.co/datasets/cais/mmlu','Test split','Each question has one keyed answer. Subjects vary in difficulty.','choice'),
 ('arc','ARC Challenge','Science','Answer grade-school science questions about experiments, physical systems, and the natural world.','Accessible','Choice','https://arxiv.org/abs/1803.05457','https://huggingface.co/datasets/allenai/ai2_arc','ARC-Challenge test split','This is the AI2 science benchmark, separate from the ARC-AGI grid puzzles.','choice'),
 ('hellaswag','HellaSwag','Reasoning','Read a short description of an activity and choose the most plausible continuation.','Everyday reasoning','Choice','https://github.com/rowanz/hellaswag','https://huggingface.co/datasets/Rowan/hellaswag','First 1,000 validation questions','This collection is a subset of the validation split. Some source passages contain awkward phrasing.','choice'),
 ('winogrande','WinoGrande','Reasoning','Resolve an ambiguous sentence by choosing which person or object belongs in the blank.','Short questions','Choice','https://github.com/allenai/winogrande','https://huggingface.co/datasets/allenai/winogrande','Validation split','Two choices per question. Read the full sentence before choosing.','choice'),
 ('boolq','BoolQ','Reading','Use a short passage to answer a yes-or-no question. The evidence is in the text.','Start here','Choice','https://github.com/google-research-datasets/boolean-questions','https://huggingface.co/datasets/google/boolq','Validation split','Choose yes or no based on the passage.','choice'),
 ('truthfulqa','TruthfulQA','Knowledge','Answer questions built around common misconceptions, then compare with the reference answers.','Self-review','Written','https://github.com/sylinrl/TruthfulQA','https://huggingface.co/datasets/truthfulqa/truthful_qa','Generation questions','Several phrasings can be valid. Review your answer against the reference; this page does not judge its meaning automatically.','manual'),
 ('humaneval','HumanEval','Code','Write a Python function from its specification. Review a reference implementation and the supplied tests.','Self-review','Code','https://github.com/openai/human-eval','https://huggingface.co/datasets/openai/openai_humaneval','Test split','Code stays in this browser and is not executed. Use the reference and tests to assess your solution.','manual'),
]
VERSION='20260913b'
def shell(title,description,slug=None,content=''):
 scripts='' if slug is None else f'''<script defer src="/testing/shared/vendor/marked.umd.js"></script>
<script defer src="/testing/shared/vendor/purify.min.js"></script>
<script defer src="/testing/shared/math.js?v={VERSION}"></script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js"></script>'''
 return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} | Benchmark lab</title><meta name="description" content="{escape(description,quote=True)}">
<link rel="canonical" href="https://kaileh.dev/testing/{slug+'/' if slug else ''}">
<meta name="theme-color" content="#08090b"><meta property="og:title" content="{escape(title,quote=True)} | Benchmark lab">
<meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="https://kaileh.dev/testing/{slug+'/' if slug else ''}">
<link rel="icon" href="/testing/shared/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/testing/shared/benchmark.css?v={VERSION}">{scripts}
<script defer src="/testing/shared/{'benchmark' if slug else 'catalog'}.js?v={VERSION}"></script></head>
<body{f' data-benchmark="{slug}"' if slug else ''}><a href="#main" class="skip-link">Skip to content</a>
<header class="topbar"><div class="wrap"><a class="brand" href="/testing/">Benchmark lab<span> / kaileh.dev</span></a><nav class="top-links" aria-label="Site"><a href="/testing/">Benchmarks</a><a href="/">Kellen Heraty</a></nav></div></header>
{content or '<main id="main" class="wrap runner"><p class="notice" role="status">Loading questions...</p></main>'}
<noscript><p class="wrap notice">Turn on JavaScript to load questions and save practice sessions. <a href="/testing/sources.html">Browse benchmark sources</a>.</p></noscript>
</body></html>'''
def main():
 benchmarks=[]
 for slug,title,category,description,level,format_,paper,dataset,split,note,grading in DEFINITIONS:
  data=json.loads((ROOT/f'data/{slug}.json').read_text())
  row=dict(id=slug,title=title,category=category,description=description,level=level,format=format_,project=paper,dataset=dataset,split=split,note=note,grading=grading,count=len(data),subjects=sorted(set(q['category'] for q in data)))
  benchmarks.append(row)
  (ROOT/slug).mkdir(exist_ok=True)
  (ROOT/slug/'index.html').write_text(shell(title,description,slug))
  (ROOT/f'data/{slug}_metadata.json').write_text(json.dumps(row,indent=2)+'\n')
 (ROOT/'data/index.json').write_text(json.dumps(dict(version=2,updated='2026-09-13',benchmarks=benchmarks,total_questions=sum(x['count'] for x in benchmarks)),indent=2)+'\n')
 body='''<main id="main" class="wrap">
<section class="intro"><div><p class="eyebrow">AI benchmarks, answered by you</p><h1>Try the questions behind the scores.</h1><p>Pick a subject, work through a short session, and review the answers. No account or timer. Your place is saved in this browser.</p><div id="catalog-summary" class="catalog-summary" role="status">Loading the collection...</div></div>
<aside class="intro-note"><strong>A place to practice.</strong><p>These sessions use public benchmark questions. Your practice results depend on the questions you choose and are not directly comparable with model leaderboard scores.</p></aside></section>
<form class="toolbar" role="search" onsubmit="return false"><div class="field grow"><label for="search">Find a benchmark</label><input id="search" type="search" placeholder="Search names, subjects, or skills" autocomplete="off"></div><div class="field"><label for="domain">Subject</label><select id="domain"><option value="all">All subjects</option></select></div><div class="field"><label for="format">Answer format</label><select id="format"><option value="all">All formats</option><option>Choice</option><option>Number</option><option>Written</option><option>Code</option><option>Mixed</option></select></div></form>
<p class="catalog-status" id="catalog-status" role="status"></p><section id="catalog" class="catalog" aria-label="Benchmark collection"></section>
<section class="method"><h2>How practice works</h2><p>Multiple-choice questions use the published answer key. Math questions in GSM8K accept equivalent numbers, including fractions. For written and code answers, reveal the reference and assess your own work. Self-assessments are kept separate from automatic scores.</p><p>Counts describe the questions included here. Open a benchmark for its split and source details, or browse <a href="/testing/sources.html">all sources and scoring notes</a>.</p></section>
<footer class="site-footer"><span>Built by <a href="/">Kellen Heraty</a></span><a href="https://github.com/kaileh57/kaileh-website/tree/stable/testing">Source code</a></footer></main>'''
 (ROOT/'index.html').write_text(shell('Practice AI benchmark questions','Practice public AI benchmark questions in math, knowledge, reasoning, reading, and Python. Review answers and save your place in your browser.',content=body))
 # Keep old URLs useful without advertising unavailable question sets.
 for slug in ['bbh','codex_eval','math','drop','race','piqa','siqa','lambada','openbookqa']:
  content=f'<main id="main" class="wrap runner"><section class="runner-intro"><h1>This question set is not available</h1><p>This older page did not have a complete bundled dataset. Choose an available benchmark to start a session.</p><p><a href="/testing/">Browse available benchmarks</a></p></section></main>'
  page=shell('Question set unavailable','Browse the available Benchmark lab question sets.',content=content).replace(f'<script defer src="/testing/shared/catalog.js?v={VERSION}"></script>','')
  (ROOT/slug/'index.html').write_text(page)
 sources='<main id="main" class="wrap runner"><section class="runner-intro"><p class="eyebrow">Collection notes</p><h1>Sources and scoring</h1><p>Question counts come from the files bundled with this site. Original question wording and answer keys are retained. This is a practice interface, not an official benchmark evaluation.</p></section>'
 for row in benchmarks:
  sources+=f'''<section class="method"><h2>{escape(row['title'])}</h2><p>{row['count']:,} questions. {escape(row['split'])}.</p><p>{escape(row['note'])}</p><p><a href="{row['project']}">Project and evaluation details</a> · <a href="{row['dataset']}">Dataset and license</a> · <a href="/testing/{row['id']}/">Practice</a></p></section>'''
 sources+='''<section class="method"><h2>Local progress</h2><p>Answers, scratch notes, and session results are stored in this browser. Clearing site data removes them. Private browsing or blocked storage may prevent saving. Each benchmark has its own saved session.</p><h2>Rendering and attribution</h2><p>Markdown is rendered with Marked and sanitized with DOMPurify. MathJax renders mathematical notation. Original dataset wording, including punctuation, is preserved. Dataset terms are linked above. <a href="/testing/shared/vendor/THIRD_PARTY_NOTICES.txt">Rendering library licenses</a>.</p></section><footer class="site-footer"><a href="/testing/">Back to benchmarks</a><span>Collection reviewed September 13, 2026</span></footer></main>'''
 page=shell('Sources and scoring','Dataset splits, source links, scoring methods, and local progress for Benchmark lab.',content=sources).replace(f'<script defer src="/testing/shared/catalog.js?v={VERSION}"></script>','')
 (ROOT/'sources.html').write_text(page)
 print(f'Built {len(benchmarks)} benchmarks with {sum(x["count"] for x in benchmarks):,} questions')
if __name__=='__main__':main()
