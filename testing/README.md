# Benchmark lab

A static practice interface for public AI benchmark questions. The catalog and every active benchmark use the same styles and session engine. GitHub Pages serves these files without a build step.

## Run locally

From the repository root:

```sh
python3 -m http.server 8778 --bind 127.0.0.1
```

Open `http://127.0.0.1:8778/testing/`.

## Update the collection

Edit the benchmark definitions in `scripts/build_catalog.py`, then run:

```sh
python3 testing/scripts/build_catalog.py
python3 testing/scripts/validate_data.py
```

The generator derives counts and subjects from bundled question files. It writes the catalog, metadata, route shells, and sources page. Change shared CSS and JavaScript directly. When changing client assets or data, increment the asset version in the generator and the catalog fetch URLs together.

Each question needs a stable ID, prompt, answer, category, and source. Multiple-choice questions also need labeled choices whose labels include the answer key. Keep the original question wording. Document the split, transformations, and provenance when importing a dataset. Public availability alone does not establish that a dataset is suitable for practice or that its labels are complete.

MMLU-Pro uses the pinned upstream test revision in `scripts/import_mmlu_pro.py`. To reproduce its JSON, install `pyarrow==21.0.0` in a virtual environment, then run that script. The import writes its source URL, revision, and SHA-256 to `data/mmlu-pro-provenance.json`. The MIT license is retained beside the data.

The HLE repair script reconstructs all choices from the original `hle/questions.json` snapshot. The previous conversion stopped after five choices in many questions. Run `scripts/repair_hle_choices.py` to reproduce the repair. It preserves the prompt, complete choices, answer key, authors, and rationale from the bundled source.

The repository's older `scripts/download_comprehensive_benchmarks.py` predates this interface. Do not use it to generate route shells or metadata; it would overwrite the catalog with the old format.

## Scoring and progress

Multiple-choice answers compare labels. GSM8K compares numeric values, retaining signs and decimal points and accepting equivalent fractions. Written HLE answers, TruthfulQA, and HumanEval require self-review. Python code is displayed but never executed. Automatic accuracy excludes self-reviewed, skipped, and revealed answers.

Each benchmark stores one session under `benchmark-lab:v2:<id>` in local storage. A session contains at most 20 shuffled question IDs, answers, scratch notes, and the cursor. Starting another session replaces it. Old `<benchmark>Stats` values are left untouched and are not imported because they came from the previous string-based grader.

Markdown is sanitized with vendored DOMPurify before insertion. TeX delimiters are protected while Markdown is parsed, and MathJax renders the resulting notation. Code stays in literal preformatted blocks. Marked and DOMPurify are pinned locally; MathJax 3.2.2 loads from jsDelivr. If a rendering library fails, the original question text remains available.

## Validate changes

The data validator checks counts, IDs, choice keys, images, local asset links, and interface punctuation. The browser checks cover sessions, persistence, grading, answer review, image and math rendering, phone-width overflow, unavailable routes, and storage or network failures.

With Playwright installed and a local server running:

```sh
node testing/scripts/test_browser.cjs
```

Set `CHROME_PATH` to use an installed Chrome executable. Set `BENCHMARK_TEST_URL` to change the server address or `BENCHMARK_ARTIFACTS` to save screenshots. The tests use an isolated browser context and do not access personal Chrome profiles.
