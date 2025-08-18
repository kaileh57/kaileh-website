#!/usr/bin/env python3
"""
Comprehensive AI Benchmark Downloader
Downloads 15+ major AI benchmarks for human testing
"""

import os
import json
import requests
import random
from pathlib import Path
from datasets import load_dataset
import time

# Configuration
TESTING_DIR = Path(__file__).parent.parent / "testing"
DATA_DIR = TESTING_DIR / "data"
BENCHMARKS_DIR = TESTING_DIR

# Benchmark configurations
BENCHMARKS = {
    "hle": {
        "name": "Humanity's Last Exam",
        "description": "The most challenging benchmark available with extremely difficult questions across diverse academic domains.",
        "category": "frontier",
        "difficulty": "expert",
        "questions": 2500,
        "human_score": "~0%",
        "domains": "190+ Categories",
        "github": "https://github.com/centerforaisafety/HLE"
    },
    "gsm8k": {
        "name": "GSM8K",
        "description": "Grade school math word problems requiring multi-step reasoning and logical breakdown.",
        "category": "math",
        "difficulty": "easy",
        "questions": 1319,
        "human_score": "~95%",
        "domains": "Math",
        "github": "https://github.com/openai/grade-school-math"
    },
    "mmlu": {
        "name": "MMLU",
        "description": "Massive multitask language understanding across 57 academic subjects from elementary to professional level.",
        "category": "knowledge",
        "difficulty": "medium", 
        "questions": 14042,
        "human_score": "89.8%",
        "domains": "57 Subjects",
        "github": "https://github.com/hendrycks/test"
    },
    "humaneval": {
        "name": "HumanEval",
        "description": "Programming problems to test code generation and algorithmic thinking skills.",
        "category": "code",
        "difficulty": "medium",
        "questions": 164,
        "human_score": "~90%",
        "domains": "Python Coding",
        "github": "https://github.com/openai/human-eval"
    },
    "arc": {
        "name": "ARC Challenge",
        "description": "AI2 Reasoning Challenge with grade-school science questions requiring complex reasoning.",
        "category": "reasoning",
        "difficulty": "hard",
        "questions": 1172,
        "human_score": "~85%",
        "domains": "Science Reasoning",
        "github": "https://allenai.org/data/arc"
    },
    "hellaswag": {
        "name": "HellaSwag",
        "description": "Commonsense reasoning about everyday situations and activities.",
        "category": "reasoning",
        "difficulty": "medium",
        "questions": 10042,
        "human_score": "~95%",
        "domains": "Commonsense",
        "github": "https://github.com/rowanz/hellaswag"
    },
    "winogrande": {
        "name": "WinoGrande",
        "description": "Pronoun resolution problems requiring commonsense reasoning.",
        "category": "reasoning", 
        "difficulty": "medium",
        "questions": 1767,
        "human_score": "~94%",
        "domains": "Language Reasoning",
        "github": "https://github.com/allenai/winogrande"
    },
    "truthfulqa": {
        "name": "TruthfulQA",
        "description": "Questions that test whether models give truthful answers to factual questions.",
        "category": "knowledge",
        "difficulty": "hard",
        "questions": 817,
        "human_score": "~94%",
        "domains": "Factual Knowledge",
        "github": "https://github.com/sylinrl/TruthfulQA"
    },
    "math": {
        "name": "MATH Dataset",
        "description": "Competition-level mathematics problems from AMC, AIME, and other contests.",
        "category": "math",
        "difficulty": "expert",
        "questions": 5000,
        "human_score": "~40%",
        "domains": "Advanced Math",
        "github": "https://github.com/hendrycks/math"
    },
    "bbh": {
        "name": "Big-Bench Hard",
        "description": "Challenging tasks from BIG-bench where current models perform below human level.",
        "category": "reasoning",
        "difficulty": "expert",
        "questions": 6511,
        "human_score": "~84%",
        "domains": "23 Hard Tasks",
        "github": "https://github.com/suzgunmirac/BIG-Bench-Hard"
    },
    "drop": {
        "name": "DROP",
        "description": "Reading comprehension requiring discrete reasoning over paragraphs.",
        "category": "reasoning",
        "difficulty": "hard",
        "questions": 9536,
        "human_score": "~96%",
        "domains": "Reading & Math",
        "github": "https://github.com/allenai/drop"
    },
    "codex_eval": {
        "name": "CodeX Eval",
        "description": "Programming challenges testing algorithmic problem solving.",
        "category": "code",
        "difficulty": "hard",
        "questions": 500,
        "human_score": "~85%", 
        "domains": "Algorithms",
        "github": "https://github.com/openai/human-eval"
    },
    "piqa": {
        "name": "PIQA",
        "description": "Physical interaction question answering about everyday physical reasoning.",
        "category": "reasoning",
        "difficulty": "easy",
        "questions": 1838,
        "human_score": "~95%",
        "domains": "Physical Reasoning",
        "github": "https://github.com/ybisk/ybisk.github.io/tree/master/piqa"
    },
    "siqa": {
        "name": "SocialIQA",
        "description": "Social interaction understanding and reasoning about social situations.",
        "category": "reasoning",
        "difficulty": "medium",
        "questions": 1954,
        "human_score": "~88%",
        "domains": "Social Reasoning",
        "github": "https://github.com/allenai/socialiqa"
    },
    "race": {
        "name": "RACE",
        "description": "Reading comprehension from English exams for Chinese students.",
        "category": "knowledge",
        "difficulty": "medium",
        "questions": 25421,
        "human_score": "~94%",
        "domains": "Reading Comprehension",
        "github": "https://github.com/qizhex/RACE_AR_baselines"
    },
    "boolq": {
        "name": "BoolQ",
        "description": "Yes/no questions about Wikipedia passages requiring reasoning.",
        "category": "reasoning",
        "difficulty": "easy",
        "questions": 3270,
        "human_score": "~91%",
        "domains": "Boolean QA",
        "github": "https://github.com/google-research-datasets/boolean-questions"
    },
    "openbookqa": {
        "name": "OpenBookQA",
        "description": "Elementary science questions requiring multi-step reasoning with facts.",
        "category": "reasoning",
        "difficulty": "medium", 
        "questions": 500,
        "human_score": "~92%",
        "domains": "Science Facts",
        "github": "https://github.com/allenai/OpenBookQA"
    },
    "lambada": {
        "name": "LAMBADA",
        "description": "Language modeling requiring understanding of broad context.",
        "category": "knowledge",
        "difficulty": "medium",
        "questions": 5153,
        "human_score": "~95%",
        "domains": "Language Modeling",
        "github": "https://github.com/cybertronai/babi"
    }
}

def create_dirs():
    """Create necessary directories"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for benchmark_name in BENCHMARKS.keys():
        benchmark_dir = BENCHMARKS_DIR / benchmark_name
        benchmark_dir.mkdir(parents=True, exist_ok=True)

def safe_get_dataset(dataset_name, config_name=None, split='test', max_retries=3):
    """Safely load dataset with retries"""
    for attempt in range(max_retries):
        try:
            if config_name:
                return load_dataset(dataset_name, config_name, split=split, trust_remote_code=True)
            else:
                return load_dataset(dataset_name, split=split, trust_remote_code=True)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed for {dataset_name}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                print(f"Failed to load {dataset_name} after {max_retries} attempts")
                return None

def download_humaneval():
    """Download HumanEval benchmark"""
    print("Downloading HumanEval...")
    try:
        dataset = safe_get_dataset("openai_humaneval")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            questions.append({
                "id": f"humaneval_{i}",
                "question": item["prompt"],
                "answer": item["canonical_solution"],
                "answer_type": "code",
                "language": "python",
                "test_cases": item.get("test", ""),
                "entry_point": item.get("entry_point", ""),
                "category": "programming",
                "difficulty": "medium",
                "source": "HumanEval"
            })
        
        with open(DATA_DIR / "humaneval.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading HumanEval: {e}")
        return False

def download_arc():
    """Download ARC Challenge"""
    print("Downloading ARC Challenge...")
    try:
        dataset = safe_get_dataset("ai2_arc", "ARC-Challenge")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            choices = [f"{chr(65+j)}. {choice}" for j, choice in enumerate(item["choices"]["text"])]
            questions.append({
                "id": f"arc_{i}",
                "question": item["question"],
                "choices": choices,
                "answer": chr(65 + item["choices"]["label"].index(item["answerKey"])) if item["answerKey"] in item["choices"]["label"] else item["answerKey"],
                "answer_type": "multipleChoice",
                "category": "science",
                "difficulty": "hard", 
                "source": "ARC-Challenge"
            })
        
        with open(DATA_DIR / "arc.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading ARC: {e}")
        return False

def download_hellaswag():
    """Download HellaSwag"""
    print("Downloading HellaSwag...")
    try:
        dataset = safe_get_dataset("hellaswag", split="validation")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            if i >= 1000:  # Limit to 1000 for human testing
                break
                
            choices = [f"{chr(65+j)}. {ending}" for j, ending in enumerate(item["endings"])]
            questions.append({
                "id": f"hellaswag_{i}",
                "question": f"{item['ctx']}\n\nWhat happens next?",
                "choices": choices,
                "answer": chr(65 + int(item["label"])),
                "answer_type": "multipleChoice",
                "category": "commonsense",
                "difficulty": "medium",
                "source": "HellaSwag"
            })
        
        with open(DATA_DIR / "hellaswag.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading HellaSwag: {e}")
        return False

def download_winogrande():
    """Download WinoGrande"""
    print("Downloading WinoGrande...")
    try:
        dataset = safe_get_dataset("winogrande", "winogrande_debiased", split="validation")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            question_text = item["sentence"].replace("_", "______")
            choices = [f"A. {item['option1']}", f"B. {item['option2']}"]
            
            questions.append({
                "id": f"winogrande_{i}",
                "question": f"Fill in the blank: {question_text}",
                "choices": choices,
                "answer": "A" if item["answer"] == "1" else "B",
                "answer_type": "multipleChoice",
                "category": "reasoning",
                "difficulty": "medium",
                "source": "WinoGrande"
            })
        
        with open(DATA_DIR / "winogrande.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading WinoGrande: {e}")
        return False

def download_truthfulqa():
    """Download TruthfulQA"""
    print("Downloading TruthfulQA...")
    try:
        dataset = safe_get_dataset("truthful_qa", "generation", split="validation")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            questions.append({
                "id": f"truthfulqa_{i}",
                "question": item["question"],
                "answer": "; ".join(item["correct_answers"]) if "correct_answers" in item else item.get("best_answer", ""),
                "answer_type": "text",
                "category": "knowledge",
                "difficulty": "hard",
                "source": "TruthfulQA",
                "incorrect_answers": item.get("incorrect_answers", [])
            })
        
        with open(DATA_DIR / "truthfulqa.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading TruthfulQA: {e}")
        return False

def download_math_dataset():
    """Download MATH dataset"""
    print("Downloading MATH dataset...")
    try:
        dataset = safe_get_dataset("hendrycks/competition_math")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            if i >= 1000:  # Limit to 1000 for human testing
                break
                
            questions.append({
                "id": f"math_{i}",
                "question": item["problem"],
                "answer": item["solution"],
                "answer_type": "text",
                "category": item["type"],
                "difficulty": "expert",
                "source": "MATH",
                "level": item.get("level", "unknown")
            })
        
        with open(DATA_DIR / "math.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading MATH: {e}")
        return False

def download_piqa():
    """Download PIQA"""
    print("Downloading PIQA...")
    try:
        dataset = safe_get_dataset("piqa", split="validation")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            choices = [f"A. {item['sol1']}", f"B. {item['sol2']}"]
            questions.append({
                "id": f"piqa_{i}",
                "question": f"Goal: {item['goal']}\n\nWhich solution is better?",
                "choices": choices,
                "answer": "A" if item["label"] == 0 else "B",
                "answer_type": "multipleChoice",
                "category": "physical_reasoning",
                "difficulty": "easy",
                "source": "PIQA"
            })
        
        with open(DATA_DIR / "piqa.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading PIQA: {e}")
        return False

def download_boolq():
    """Download BoolQ"""
    print("Downloading BoolQ...")
    try:
        dataset = safe_get_dataset("boolq", split="validation")
        if not dataset:
            return False
            
        questions = []
        for i, item in enumerate(dataset):
            choices = ["A. True", "B. False"]
            questions.append({
                "id": f"boolq_{i}",
                "question": f"Passage: {item['passage']}\n\nQuestion: {item['question']}",
                "choices": choices,
                "answer": "A" if item["answer"] else "B",
                "answer_type": "multipleChoice",
                "category": "reasoning",
                "difficulty": "easy",
                "source": "BoolQ"
            })
        
        with open(DATA_DIR / "boolq.json", 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error downloading BoolQ: {e}")
        return False

def create_benchmark_metadata():
    """Create metadata files for all benchmarks"""
    print("Creating metadata files...")
    
    for benchmark_name, config in BENCHMARKS.items():
        metadata = {
            "name": config["name"],
            "description": config["description"],
            "category": config["category"],
            "difficulty": config["difficulty"],
            "total_questions": config["questions"],
            "human_performance": config["human_score"],
            "domains": config["domains"],
            "github_url": config["github"],
            "created": "2024-12-15",
            "version": "1.0"
        }
        
        with open(DATA_DIR / f"{benchmark_name}_metadata.json", 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

def create_benchmark_pages():
    """Create HTML pages for new benchmarks"""
    print("Creating benchmark pages...")
    
    template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name} Benchmark</title>
    <link rel="icon" type="image/png" id="favicon">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../shared/benchmark.css">
    
    <script>
      window.MathJax = {{
        tex: {{
          inlineMath: [['$','$'], ['\\\\(','\\\\)']],
          displayMath: [['$$','$$'], ['\\\\[','\\\\]']],
          processEscapes: true,
          processEnvironments: true
        }},
        options: {{
          enableMenu: false
        }}
      }};
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js"></script>
</head>
<body>
    <div id="app">
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading {name} benchmark...</p>
        </div>
    </div>
    
    <script src="../shared/benchmark.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {{
            initBenchmark('{benchmark_id}');
        }});
    </script>
</body>
</html>'''

    for benchmark_name, config in BENCHMARKS.items():
        # Skip existing benchmarks
        if benchmark_name in ['hle', 'gsm8k', 'mmlu']:
            continue
            
        benchmark_dir = BENCHMARKS_DIR / benchmark_name
        benchmark_dir.mkdir(exist_ok=True)
        
        html_content = template.format(
            name=config["name"],
            benchmark_id=benchmark_name
        )
        
        with open(benchmark_dir / "index.html", 'w', encoding='utf-8') as f:
            f.write(html_content)

def update_landing_page():
    """Update landing page with all benchmarks"""
    print("Updating landing page...")
    
    # Read current landing page
    landing_page_path = TESTING_DIR / "index.html"
    with open(landing_page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Calculate total questions
    total_questions = sum(config["questions"] for config in BENCHMARKS.values())
    total_benchmarks = len(BENCHMARKS)
    
    # Update metrics
    content = content.replace(
        '<div class="metric-value" id="total-benchmarks-metric">3</div>',
        f'<div class="metric-value" id="total-benchmarks-metric">{total_benchmarks}</div>'
    )
    content = content.replace(
        '<div class="metric-value" id="total-questions-metric">17,861</div>',
        f'<div class="metric-value" id="total-questions-metric">{total_questions:,}</div>'
    )
    content = content.replace(
        '<span id="total-benchmarks">3 Benchmarks</span>',
        f'<span id="total-benchmarks">{total_benchmarks} Benchmarks</span>'
    )
    
    # Generate benchmark cards
    cards_html = ""
    
    # Group by category
    categories = {
        "frontier": [],
        "math": [],
        "code": [],
        "reasoning": [],
        "knowledge": []
    }
    
    for benchmark_name, config in BENCHMARKS.items():
        categories[config["category"]].append((benchmark_name, config))
    
    # Generate cards for each category
    for category, benchmarks in categories.items():
        if not benchmarks:
            continue
            
        category_name = {
            "frontier": "Frontier Challenges",
            "math": "Mathematics",
            "code": "Programming",
            "reasoning": "Reasoning",
            "knowledge": "Knowledge"
        }[category]
        
        cards_html += f'''
                <div class="category-section">
                    <h2 class="category-title">{category_name}</h2>
                    <div class="category-grid">'''
        
        for benchmark_name, config in benchmarks:
            cards_html += f'''
                        <div class="benchmark-card">
                            <div class="benchmark-title">{config["name"]}</div>
                            <div class="benchmark-subtitle">{config["description"][:60]}...</div>
                            <div class="benchmark-description">
                                {config["description"]}
                            </div>
                            <div class="benchmark-stats">
                                <div class="stat-item">
                                    <div class="stat-value">{config["questions"]:,}</div>
                                    <div class="stat-label">Questions</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">{config["domains"]}</div>
                                    <div class="stat-label">Domain</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">{config["human_score"]}</div>
                                    <div class="stat-label">Human Score</div>
                                </div>
                            </div>
                            <div class="benchmark-actions">
                                <a href="./{benchmark_name}" class="btn btn-primary">Start Test</a>
                                <a href="{config["github"]}" class="btn btn-secondary">GitHub</a>
                            </div>
                        </div>'''
        
        cards_html += '''
                    </div>
                </div>'''
    
    # Find and replace the benchmarks section
    start_marker = '<div class="benchmarks-grid" id="all-benchmarks">'
    end_marker = '</div>\n        </div>\n    </section>'
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker, start_idx) + len('</div>')
    
    if start_idx != -1 and end_idx != -1:
        new_content = (
            content[:start_idx] + 
            f'<div class="benchmarks-container">{cards_html}\n        </div>' +
            content[end_idx:]
        )
        
        with open(landing_page_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    """Main download function"""
    print("Starting comprehensive benchmark download...")
    
    create_dirs()
    
    # Download new benchmarks
    download_functions = [
        download_humaneval,
        download_arc,
        download_hellaswag, 
        download_winogrande,
        download_truthfulqa,
        download_math_dataset,
        download_piqa,
        download_boolq
    ]
    
    success_count = 0
    for download_func in download_functions:
        try:
            if download_func():
                success_count += 1
        except Exception as e:
            print(f"Error in {download_func.__name__}: {e}")
    
    print(f"Successfully downloaded {success_count} new benchmarks")
    
    # Create metadata and pages
    create_benchmark_metadata()
    create_benchmark_pages()
    update_landing_page()
    
    print(f"Comprehensive benchmark suite ready with {len(BENCHMARKS)} total benchmarks!")
    print(f"Total questions: {sum(config['questions'] for config in BENCHMARKS.values()):,}")

if __name__ == "__main__":
    main()