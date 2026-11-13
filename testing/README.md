# Benchmarks

Static pages for trying questions from AI benchmarks. No build step.

## Run locally

From the repository root:

```sh
python3 -m http.server 8778 --bind 127.0.0.1
```

Open `http://127.0.0.1:8778/testing/`.

## Update data

```sh
python3 testing/scripts/import_benchmarks.py   # AIME, HMMT, SimpleQA Verified, ARC-AGI-2 (needs pyarrow)
python3 testing/scripts/build_catalog.py       # index.json and page shells
python3 testing/scripts/validate_data.py
node testing/scripts/test_browser.cjs          # needs the local server and Playwright
```

Benchmark titles and links live in `scripts/build_catalog.py`. Bump `VERSION` there and the fetch version in `shared/benchmark.js` together when data changes.

## Sources

| Benchmark | Source | License |
| --- | --- | --- |
| Humanity's Last Exam | `cais/hle`, 2,500-question snapshot | MIT |
| ARC-AGI-2 | `arcprize/ARC-AGI-2` public evaluation set | Apache-2.0 |
| AIME 2025, 2026 | `MathArena/aime_2025`, `aime_2026` | CC BY-NC-SA 4.0 |
| HMMT February 2025, 2026 | `MathArena/hmmt_feb_2025`, `hmmt_feb_2026` | CC BY-NC-SA 4.0 |
| MMLU-Pro | `TIGER-Lab/MMLU-Pro` test split | MIT |
| SimpleQA Verified | `google/simpleqa-verified` | MIT |

Revisions are pinned in the import scripts. Choice and integer answers are graded automatically. ARC grids allow two attempts, as in the official scoring. Free-text answers are self-graded.
