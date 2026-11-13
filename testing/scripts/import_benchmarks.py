"""Import AIME, HMMT, SimpleQA Verified, and ARC-AGI-2 from pinned revisions. Requires pyarrow."""
import csv
import io
import json
import re
from pathlib import Path
from urllib.request import urlopen
import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[1]
HF = 'https://huggingface.co/datasets'
MATHARENA = {
    'aime': [('2025', 'MathArena/aime_2025', 'c94da77eb22bbd6439e62a323bec18493a421302'),
             ('2026', 'MathArena/aime_2026', 'd61f486805306e6e6b5913504c07763a99e1b112')],
    'hmmt': [('2025', 'MathArena/hmmt_feb_2025', '6fdc4277120810ff75aa22d2d5489b91f7a262a1'),
             ('2026', 'MathArena/hmmt_feb_2026', '589a53fe152febc0f4f99f3e561007bf8da8e664')],
}
SIMPLEQA = ('google/simpleqa-verified', '0dc97e0d28d8233463e005cdc4475cc2a13ba2dc')
ARC = ('arcprize/ARC-AGI-2', 'f3283f727488ad98fe575ea6a5ac981e4a188e49')


def fetch(url):
    with urlopen(url) as r:
        return r.read()


def write(name, rows):
    (ROOT / f'data/{name}.json').write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'{name}: {len(rows)} questions')


def matharena(name):
    rows = []
    for year, repo, rev in MATHARENA[name]:
        table = pq.read_table(io.BytesIO(fetch(f'{HF}/{repo}/resolve/{rev}/data/train-00000-of-00001.parquet')))
        for r in table.to_pylist():
            answer = str(r['answer']).strip()
            rows.append(dict(id=f'{name}-{year}-{r["problem_idx"]}', question=r['problem'], answer=answer,
                             answer_type='number' if re.fullmatch(r'-?\d+', answer) else 'text',
                             category=year))
    write(name, rows)


def simpleqa():
    repo, rev = SIMPLEQA
    text = fetch(f'{HF}/{repo}/resolve/{rev}/simpleqa_verified.csv').decode()
    rows = [dict(id=f'simpleqa-{r["original_index"]}', question=r['problem'], answer=r['answer'],
                 answer_type='text', category=r['topic'])
            for r in csv.DictReader(io.StringIO(text))]
    write('simpleqa', rows)


def arc():
    repo, rev = ARC
    base = f'https://raw.githubusercontent.com/{repo}/{rev}/data'
    rows = []
    for task in fetch(f'{base}/evaluation.txt').decode().split():
        data = json.loads(fetch(f'{base}/evaluation/{task}.json'))
        tests = data['test']
        for i, t in enumerate(tests):
            rows.append(dict(id=task if len(tests) == 1 else f'{task}-{i + 1}', question='', answer=t['output'],
                             answer_type='grid', category='Evaluation', train=data['train'], input=t['input']))
    write('arc-agi-2', rows)


if __name__ == '__main__':
    matharena('aime')
    matharena('hmmt')
    simpleqa()
    arc()
