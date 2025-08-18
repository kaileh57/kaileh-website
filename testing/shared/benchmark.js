/**
 * Unified Benchmark Interface with Auto-Cleanup
 * Handles all benchmark types with consistent UI/UX
 */

class BenchmarkInterface {
    constructor(benchmarkName) {
        this.benchmarkName = benchmarkName;
        this.questions = [];
        this.currentQuestion = null;
        this.currentIndex = 0;
        this.stats = this.loadStats();
        this.isAnswered = false;
        this.userAnswer = null;
        this.filters = {
            category: 'all',
            difficulty: 'all',
            searchId: ''
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadQuestions();
            this.setupUI();
            this.loadQuestion();
            this.updateStats();
        } catch (error) {
            this.showError('Failed to load benchmark data', error);
        }
    }

    async loadQuestions() {
        const response = await fetch(`../data/${this.benchmarkName}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${this.benchmarkName} data`);
        }
        this.questions = await response.json();
        
        // Load metadata
        try {
            const metaResponse = await fetch(`../data/${this.benchmarkName}_metadata.json`);
            if (metaResponse.ok) {
                this.metadata = await metaResponse.json();
            }
        } catch (error) {
            console.warn('No metadata found');
        }
    }

    setupUI() {
        document.body.innerHTML = `
            <nav class="benchmark-nav">
                <div class="nav-container">
                    <div class="nav-left">
                        <a href="/testing" class="nav-back">← All Benchmarks</a>
                        <div class="nav-title">${this.benchmarkName.toUpperCase()}</div>
                    </div>
                    <div class="nav-info">
                        <div class="difficulty-badge difficulty-${this.metadata?.difficulty || 'medium'}">
                            ${(this.metadata?.difficulty || 'medium').replace('_', ' ').toUpperCase()}
                        </div>
                        <div class="category-badge category-${this.metadata?.category || 'general'}">
                            ${(this.metadata?.category || 'General').toUpperCase()}
                        </div>
                        <div class="stats-container">
                            <div class="stat">
                                <div class="stat-value" id="questions-answered">0</div>
                                <div class="stat-label">Answered</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value" id="accuracy">0%</div>
                                <div class="stat-label">Accuracy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main class="benchmark-container">
                <div class="filter-controls">
                    <div class="filter-row">
                        <div class="filter-group">
                            <label class="filter-label">Category</label>
                            <select id="category-filter" class="filter-select">
                                <option value="all">All Categories</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Difficulty</label>
                            <select id="difficulty-filter" class="filter-select">
                                <option value="all">All Difficulties</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Question ID</label>
                            <input type="text" id="id-filter" class="filter-input" placeholder="Enter question ID...">
                        </div>
                        <button id="load-id-btn" class="btn btn-secondary">Load ID</button>
                        <button id="random-btn" class="btn btn-secondary">Random</button>
                    </div>
                </div>

                <div id="question-container"></div>
            </main>
        `;

        this.setupEventListeners();
        this.populateFilters();
        this.setFavicon();
    }

    setFavicon() {
        // Set favicon matching main site
        const faviconCanvas = document.createElement('canvas');
        faviconCanvas.width = 32;
        faviconCanvas.height = 32;
        const ctx = faviconCanvas.getContext('2d');
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('T', 16, 18);
        
        const faviconLink = document.getElementById('favicon');
        if (faviconLink) {
            faviconLink.href = faviconCanvas.toDataURL('image/png');
        }
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('difficulty-filter').addEventListener('change', (e) => {
            this.filters.difficulty = e.target.value;
            this.applyFilters();
        });

        document.getElementById('load-id-btn').addEventListener('click', () => {
            const searchId = document.getElementById('id-filter').value.trim();
            if (searchId) {
                this.loadQuestionById(searchId);
            }
        });

        document.getElementById('random-btn').addEventListener('click', () => {
            this.loadRandomQuestion();
        });

        // Enter key for ID search
        document.getElementById('id-filter').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchId = e.target.value.trim();
                if (searchId) {
                    this.loadQuestionById(searchId);
                }
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    populateFilters() {
        const categories = [...new Set(this.questions.map(q => q.category))].sort();
        const difficulties = [...new Set(this.questions.map(q => q.difficulty))].sort();

        const categorySelect = document.getElementById('category-filter');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });

        const difficultySelect = document.getElementById('difficulty-filter');
        difficulties.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff;
            option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1).replace('_', ' ');
            difficultySelect.appendChild(option);
        });
    }

    applyFilters() {
        let filtered = this.questions;

        if (this.filters.category !== 'all') {
            filtered = filtered.filter(q => q.category === this.filters.category);
        }

        if (this.filters.difficulty !== 'all') {
            filtered = filtered.filter(q => q.difficulty === this.filters.difficulty);
        }

        if (filtered.length === 0) {
            this.showError('No questions match the current filters');
            return;
        }

        // Load random question from filtered set
        const randomIndex = Math.floor(Math.random() * filtered.length);
        this.currentQuestion = filtered[randomIndex];
        this.loadQuestion();
    }

    loadRandomQuestion() {
        if (this.questions.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.questions.length);
        this.currentQuestion = this.questions[randomIndex];
        this.currentIndex = randomIndex;
        this.loadQuestion();
    }

    loadQuestionById(id) {
        const question = this.questions.find(q => q.id === id);
        if (question) {
            this.currentQuestion = question;
            this.currentIndex = this.questions.indexOf(question);
            this.loadQuestion();
            document.getElementById('id-filter').value = '';
        } else {
            alert(`Question with ID "${id}" not found`);
        }
    }

    loadQuestion() {
        if (!this.currentQuestion) {
            this.loadRandomQuestion();
            return;
        }

        this.isAnswered = false;
        this.userAnswer = null;

        const container = document.getElementById('question-container');
        container.innerHTML = this.renderQuestion();

        this.setupQuestionEventListeners();
        this.renderMath();
    }

    renderQuestion() {
        const question = this.currentQuestion;
        
        return `
            <div class="question-card animate-fade-in">
                <div class="question-header">
                    <div class="question-meta">
                        <div class="question-id">${question.id}</div>
                        <div class="category-badge category-${this.getCategoryClass(question.category)}">
                            ${question.category}
                        </div>
                        <div class="difficulty-badge difficulty-${question.difficulty.replace('_', '-')}">
                            ${question.difficulty.replace('_', ' ').toUpperCase()}
                        </div>
                    </div>
                </div>
                
                <div class="question-content">
                    <div class="question-text">${this.formatQuestionText(question.question)}</div>
                    ${this.renderQuestionImage(question)}
                    
                    ${this.renderAnswerInput(question)}
                    
                    <button id="submit-btn" class="btn btn-primary btn-submit" disabled>
                        Submit Answer
                    </button>
                    
                    <div id="feedback-container" style="display: none;"></div>
                </div>
            </div>
        `;
    }

    renderAnswerInput(question) {
        if (question.answer_type === 'multipleChoice') {
            return `
                <div class="choices-container">
                    ${question.choices.map((choice, index) => `
                        <div class="choice-item" data-value="${this.extractChoiceValue(choice)}" data-index="${index}">
                            ${choice}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (question.answer_type === 'code') {
            return `
                <div class="text-input-container">
                    <label class="text-input-label">Your code solution:</label>
                    <textarea id="answer-input" class="text-input code-input" 
                              placeholder="Enter your ${question.language || 'Python'} code here...">${question.prompt || ''}</textarea>
                </div>
            `;
        } else {
            return `
                <div class="text-input-container">
                    <label class="text-input-label">Your answer:</label>
                    <input type="text" id="answer-input" class="text-input" 
                           placeholder="Enter your answer here...">
                </div>
            `;
        }
    }

    setupQuestionEventListeners() {
        const question = this.currentQuestion;

        if (question.answer_type === 'multipleChoice') {
            document.querySelectorAll('.choice-item').forEach(choice => {
                choice.addEventListener('click', () => {
                    if (this.isAnswered) return;

                    document.querySelectorAll('.choice-item').forEach(c => c.classList.remove('selected'));
                    choice.classList.add('selected');
                    this.userAnswer = choice.dataset.value;
                    this.enableSubmitButton();
                });
            });
        } else {
            const input = document.getElementById('answer-input');
            input.addEventListener('input', () => {
                this.userAnswer = input.value;
                this.enableSubmitButton();
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && this.userAnswer?.trim()) {
                    e.preventDefault();
                    this.submitAnswer();
                }
            });
        }

        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitAnswer();
        });
    }

    enableSubmitButton() {
        const btn = document.getElementById('submit-btn');
        const hasAnswer = this.userAnswer && this.userAnswer.toString().trim() !== '';
        btn.disabled = !hasAnswer;
    }

    submitAnswer() {
        if (this.isAnswered || !this.userAnswer) return;

        this.isAnswered = true;
        const isCorrect = this.checkAnswer();
        
        this.recordAnswer(isCorrect);
        this.showFeedback(isCorrect);
        this.updateStats();

        if (isCorrect) {
            this.showConfetti();
        }
    }

    checkAnswer() {
        const question = this.currentQuestion;
        const userAnswer = this.userAnswer.toString().trim();
        const correctAnswer = question.answer.toString().trim();

        if (question.answer_type === 'multipleChoice') {
            return userAnswer.toUpperCase() === correctAnswer.toUpperCase();
        } else {
            // Basic string comparison with some normalization
            const normalizeAnswer = (ans) => {
                return ans.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')  // Remove punctuation
                    .replace(/\s+/g, ' ')         // Normalize whitespace
                    .trim();
            };
            
            return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
        }
    }

    showFeedback(isCorrect) {
        const question = this.currentQuestion;
        const container = document.getElementById('feedback-container');
        
        container.innerHTML = `
            <div class="feedback-container">
                <div class="result-message result-${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                
                ${!isCorrect ? `
                    <div class="correct-answer">
                        <strong>Correct answer:</strong> ${question.answer}
                    </div>
                ` : ''}
                
                ${question.rationale ? `
                    <div class="explanation">
                        <h3>Explanation</h3>
                        <div class="explanation-content">${this.formatQuestionText(question.rationale)}</div>
                        ${question.author_name ? `
                            <div class="author-info">Question by: ${question.author_name}</div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="action-buttons">
                    <button id="next-btn" class="btn btn-primary">Next Question</button>
                    <button id="explain-btn" class="btn btn-secondary">Show Details</button>
                </div>
            </div>
        `;

        container.style.display = 'block';

        // Highlight correct/incorrect choices for multiple choice
        if (question.answer_type === 'multipleChoice') {
            document.querySelectorAll('.choice-item').forEach(choice => {
                choice.classList.add('disabled');
                if (choice.dataset.value.toUpperCase() === question.answer.toUpperCase()) {
                    choice.classList.add('correct');
                } else if (choice.classList.contains('selected')) {
                    choice.classList.add('incorrect');
                }
            });
        }

        // Disable input
        const input = document.getElementById('answer-input');
        if (input) {
            input.disabled = true;
        }

        document.getElementById('submit-btn').style.display = 'none';

        // Event listeners for feedback buttons
        document.getElementById('next-btn').addEventListener('click', () => {
            this.loadRandomQuestion();
        });

        document.getElementById('explain-btn').addEventListener('click', () => {
            this.showQuestionDetails();
        });

        // Re-render math in explanation
        this.renderMath();
    }

    showQuestionDetails() {
        const question = this.currentQuestion;
        const details = [
            `**Question ID:** ${question.id}`,
            `**Category:** ${question.category}`,
            `**Difficulty:** ${question.difficulty}`,
            `**Answer Type:** ${question.answer_type}`,
            `**Source:** ${question.source}`,
        ];

        if (question.test_cases) {
            details.push(`**Test Cases Available:** Yes`);
        }

        alert(details.join('\n'));
    }

    recordAnswer(isCorrect) {
        this.stats.totalAnswered++;
        if (isCorrect) {
            this.stats.totalCorrect++;
        }
        this.saveStats();
    }

    updateStats() {
        document.getElementById('questions-answered').textContent = this.stats.totalAnswered;
        const accuracy = this.stats.totalAnswered > 0 
            ? Math.round((this.stats.totalCorrect / this.stats.totalAnswered) * 100)
            : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    handleKeyboard(e) {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'n':
            case 'ArrowRight':
                if (this.isAnswered) {
                    this.loadRandomQuestion();
                }
                break;
            case 'r':
                if (!this.isAnswered) {
                    this.loadRandomQuestion();
                }
                break;
            case 'Enter':
                if (this.isAnswered) {
                    this.loadRandomQuestion();
                } else if (this.userAnswer) {
                    this.submitAnswer();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case 'a':
            case 'b':
            case 'c':
            case 'd':
                if (this.currentQuestion?.answer_type === 'multipleChoice' && !this.isAnswered) {
                    const choices = document.querySelectorAll('.choice-item');
                    let index = -1;
                    
                    if (['1', '2', '3', '4'].includes(e.key)) {
                        index = parseInt(e.key) - 1;
                    } else {
                        const letter = e.key.toUpperCase();
                        index = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
                    }
                    
                    if (index >= 0 && index < choices.length) {
                        choices[index].click();
                    }
                }
                break;
        }
    }

    // Utility methods
    extractChoiceValue(choice) {
        const match = choice.match(/^([A-Z])\./);
        return match ? match[1] : choice.charAt(0).toUpperCase();
    }

    getCategoryClass(category) {
        const categoryMap = {
            'math': 'math',
            'code': 'code', 
            'knowledge': 'knowledge',
            'reasoning': 'reasoning',
            'science': 'reasoning',
            'advanced': 'advanced'
        };
        
        const normalized = category.toLowerCase();
        for (const [key, value] of Object.entries(categoryMap)) {
            if (normalized.includes(key)) {
                return value;
            }
        }
        return 'knowledge';
    }

    formatQuestionText(text) {
        if (!text) return '';
        
        // Convert basic markdown
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert newlines to HTML
        text = text.replace(/\n\n/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');
        
        // Wrap in paragraphs if not already wrapped
        if (!text.startsWith('<p>')) {
            text = '<p>' + text + '</p>';
        }
        
        return text;
    }

    renderQuestionImage(question) {
        if (!question.image) return '';
        
        // For HLE, images are in the images/ subdirectory
        const imagePath = this.benchmarkName === 'hle' 
            ? `./images/${question.image}`
            : `../data/images/${question.image}`;
            
        return `
            <div class="question-image" style="margin: 1rem 0; text-align: center;">
                <img src="${imagePath}" 
                     alt="Question image" 
                     style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
                     onerror="this.style.display='none';">
            </div>
        `;
    }

    renderMath() {
        // Render math expressions if MathJax is available
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch(err => {
                console.warn('MathJax rendering failed:', err);
            });
        }
    }

    showConfetti() {
        // Create confetti animation
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = [
                    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'
                ][Math.floor(Math.random() * 5)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }

    showError(message, error = null) {
        console.error('Benchmark error:', message, error);
        
        const container = document.getElementById('question-container') || document.getElementById('app');
        container.innerHTML = `
            <div class="loading-container">
                <div style="color: var(--incorrect); font-size: 1.5rem; margin-bottom: 1rem;">⚠️ Error</div>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }

    // Stats management
    loadStats() {
        const saved = localStorage.getItem(`${this.benchmarkName}Stats`);
        return saved ? JSON.parse(saved) : {
            totalAnswered: 0,
            totalCorrect: 0,
            startTime: Date.now()
        };
    }

    saveStats() {
        localStorage.setItem(`${this.benchmarkName}Stats`, JSON.stringify(this.stats));
    }
}

// Global initialization function
function initBenchmark(benchmarkName) {
    try {
        new BenchmarkInterface(benchmarkName);
    } catch (error) {
        console.error('Failed to initialize benchmark:', error);
        document.body.innerHTML = `
            <div class="loading-container">
                <div style="color: var(--incorrect); font-size: 1.5rem; margin-bottom: 1rem;">⚠️ Initialization Error</div>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Failed to load benchmark: ${benchmarkName}</p>
                <a href="/testing" class="btn btn-primary">← Back to Benchmarks</a>
            </div>
        `;
    }
}

// Make function globally available
window.initBenchmark = initBenchmark;