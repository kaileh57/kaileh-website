"""Build data/index.json and the page shells from the bundled question files."""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = '20261113'
# id, title, description, paper, dataset, uses math rendering
BENCHMARKS = [
    ('hle', "Humanity's Last Exam", 'Expert-written questions at the edge of human knowledge.',
     'https://lastexam.ai', 'https://huggingface.co/datasets/cais/hle', True),
    ('arc-agi-2', 'ARC-AGI-2', 'Find the rule in the examples, then draw the output grid.',
     'https://arcprize.org/arc-agi/2/', 'https://github.com/arcprize/ARC-AGI-2', False),
    ('aime', 'AIME', 'AIME 2025 and 2026 competition problems. Answers are integers from 0 to 999.',
     'https://matharena.ai', 'https://huggingface.co/datasets/MathArena/aime_2026', True),
    ('hmmt', 'HMMT February', 'HMMT February 2025 and 2026 competition problems.',
     'https://matharena.ai', 'https://huggingface.co/datasets/MathArena/hmmt_feb_2026', True),
    ('mmlu-pro', 'MMLU-Pro', 'Academic questions with up to ten choices.',
     'https://github.com/TIGER-AI-Lab/MMLU-Pro', 'https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro', True),
    ('simpleqa', 'SimpleQA Verified', 'Short factual questions with one correct answer.',
     'https://arxiv.org/abs/2509.07968', 'https://huggingface.co/datasets/google/simpleqa-verified', False),
]
HEADER = '<header class="top"><a href="/testing/">Benchmarks</a><a href="/">kaileh.dev</a></header>'


def page(title, description, path, body, scripts):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(description)}">
<link rel="canonical" href="https://kaileh.dev/testing/{path}">
<link rel="icon" href="/testing/shared/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/testing/shared/benchmark.css?v={VERSION}">
{scripts}</head>
<body>{HEADER}
<main id="main">{body}</main>
</body></html>
'''


def main():
    rows = []
    for slug, title, description, paper, dataset, math in BENCHMARKS:
        data = json.loads((ROOT / f'data/{slug}.json').read_text())
        rows.append(dict(id=slug, title=title, description=description, paper=paper, dataset=dataset,
                         count=len(data), subjects=sorted({q['category'] for q in data})))
        scripts = ['/testing/shared/vendor/marked.umd.js', '/testing/shared/vendor/purify.min.js']
        if math:
            scripts += [f'/testing/shared/math.js?v={VERSION}', 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js']
        scripts.append(f'/testing/shared/benchmark.js?v={VERSION}')
        tags = '\n'.join(f'<script defer src="{s}"></script>' for s in scripts)
        (ROOT / slug).mkdir(exist_ok=True)
        (ROOT / slug / 'index.html').write_text(
            page(f'{title} | Benchmarks', description, f'{slug}/', '<p>Loading...</p>', tags)
            .replace('<body>', f'<body data-benchmark="{slug}">'))
    (ROOT / 'data/index.json').write_text(json.dumps(dict(benchmarks=rows), indent=1, ensure_ascii=False) + '\n')
    items = ''.join(
        f'<li><a href="/testing/{r["id"]}/">{escape(r["title"])}</a> <span class="muted">{r["count"]:,}</span>'
        f'<p>{escape(r["description"])}</p></li>' for r in rows)
    body = ('<h1>Benchmarks</h1><p class="muted">Questions from current AI benchmarks. '
            f'Progress is saved in your browser.</p><ul class="list">{items}</ul>')
    (ROOT / 'index.html').write_text(page('Benchmarks', 'Try questions from current AI benchmarks.', '', body, ''))
    print(f'Built {len(rows)} benchmarks, {sum(r["count"] for r in rows):,} questions')


if __name__ == '__main__':
    main()
