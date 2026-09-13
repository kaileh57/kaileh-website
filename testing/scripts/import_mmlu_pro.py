"""Import the pinned MMLU-Pro test split. Requires pyarrow."""
import hashlib
import io
import json
from pathlib import Path
from urllib.request import urlopen
import pyarrow.parquet as pq

REVISION = 'b189ec765aa7ed75c8acfea42df31fdae71f97be'
URL = f'https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro/resolve/{REVISION}/data/test-00000-of-00001.parquet'

def main():
    raw = urlopen(URL).read()
    rows = pq.read_table(io.BytesIO(raw)).to_pylist()
    questions = []
    for row in rows:
        options = [str(s).strip() for s in row['options']]
        assert row['answer'] == chr(65 + row['answer_index'])
        questions.append(dict(id=f"mmlu-pro_{row['question_id']}", question=row['question'],
            choices=[f'{chr(65+i)}. {s}' for i,s in enumerate(options)], answer=row['answer'],
            answer_type='multipleChoice', category=row['category'], source='MMLU-Pro test',
            source_id=row['question_id']))
    root = Path(__file__).resolve().parents[1]
    (root/'data/mmlu-pro.json').write_text(json.dumps(questions, ensure_ascii=False, separators=(',', ':'))+'\n')
    (root/'data/mmlu-pro-provenance.json').write_text(json.dumps(dict(dataset='TIGER-Lab/MMLU-Pro',
        revision=REVISION, url=URL, split='test', count=len(questions), sha256=hashlib.sha256(raw).hexdigest(),
        license='MIT', imported='2026-09-13', transformations='Trim option whitespace; add display labels and stable IDs; omit empty explanation fields.'),indent=2)+'\n')
    print(f'Imported {len(questions)} MMLU-Pro questions')

if __name__ == '__main__':
    main()
