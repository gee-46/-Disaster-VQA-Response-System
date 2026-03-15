document.addEventListener('DOMContentLoaded', () => {
    // --- Upload Zone Logic ---
    const dropZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    let selectedFile = null;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    // Highlight drop zone on drag over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    // Handle drop
    dropZone.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files);
    });

    // Handle file input click
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files && files.length > 0) {
            selectedFile = files[0];
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onloadend = function () {
                imagePreview.src = reader.result;
                imagePreview.style.display = 'block';
            }
        }
    }

    // --- API Integration & UI Update ---
    const analyzeBtn = document.getElementById('analyze-btn');
    const queryInput = document.getElementById('query-input');

    // UI Elements for output
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('status-text');
    const loadingState = document.getElementById('loading-state');
    const resultsState = document.getElementById('results-state');

    // Result elements
    const aiAnswer = document.getElementById('ai-answer');
    const confidenceVal = document.getElementById('confidence-val');
    const confidenceBar = document.getElementById('confidence-bar');
    const riskBadge = document.getElementById('risk-badge');
    const inferenceTime = document.getElementById('inference-time');

    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile && !queryInput.value) {
            alert("Please provide an image or question to analyze.");
            return;
        }

        // Setup Loading UI
        loadingState.classList.remove('hidden');
        resultsState.classList.add('hidden');
        statusDot.style.background = '#00f0ff'; // Blue for processing
        statusDot.style.boxShadow = '0 0 10px #00f0ff';
        statusText.textContent = 'System Scanning...';

        analyzeBtn.disabled = true;

        try {
            const formData = new FormData();
            if (selectedFile) formData.append('image', selectedFile);
            formData.append('question', queryInput.value || 'General damage assessment');

            // Send to FastAPI backend
            const response = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            updateResultsUI(data);

        } catch (error) {
            console.error(error);
            // Hide loading, revert status
            loadingState.classList.add('hidden');
            statusDot.style.background = '#ef4444'; // Red for error
            statusDot.style.boxShadow = '0 0 10px #ef4444'
              statusText.textContent = 'System Error';
            analyzeBtn.disabled = false;

            alert("Error connecting to the VQA Backend. Ensure the FastAPI server and AI model are running.");
        }
    });

    function updateResultsUI(data) {
        // Hide loading, show results
        loadingState.classList.add('hidden');
        resultsState.classList.remove('hidden');

        // Update Status indicator
        statusDot.style.background = '#10b981'; // Green for ready
        statusDot.style.boxShadow = '0 0 10px #10b981';
        statusText.textContent = 'Analysis Complete';

        // Update Text
        aiAnswer.textContent = data.answer;

        // Update Confidence
        const confPercent = Math.round(data.confidence * 100);
        confidenceVal.textContent = `${confPercent}%`;

        // Timeout for CSS transition to trigger properly
        setTimeout(() => {
            confidenceBar.style.width = `${confPercent}%`;
        }, 100);

        // Update Risk Badge
        riskBadge.textContent = data.risk_level;
        riskBadge.className = 'risk-badge ' + data.risk_level.toLowerCase();

        // Stats
        inferenceTime.textContent = `${data.inference_time_ms}ms`;

        analyzeBtn.disabled = false;

        // Refresh History
        loadHistory();
    }

    // --- History Integration ---
    const historyList = document.getElementById('history-list');

    async function loadHistory() {
        try {
            const res = await fetch('http://localhost:8000/api/history?limit=10');
            if (!res.ok) return;
            const historyData = await res.json();

            if (historyData.length === 0) return;

            historyList.innerHTML = ''; // Clear current list

            historyData.forEach(item => {
                const date = new Date(item.timestamp).toLocaleString();
                const confPercent = Math.round((item.confidence || 0) * 100);

                const historyEl = document.createElement('div');
                historyEl.className = 'history-item';
                historyEl.innerHTML = `
                    <div class="history-header">
                        <span><i class="fa-regular fa-clock"></i> ${date}</span>
                        <span>Model: ${item.model || 'Unknown'}</span>
                    </div>
                    <div class="history-q">Q: ${item.question}</div>
                    <div class="history-a">A: ${item.answer}</div>
                    <div class="history-meta">
                        <span class="history-badge ${item.risk_level ? item.risk_level.toLowerCase() : 'low'}">${item.risk_level || 'N/A'} Risk</span>
                        <span>Conf: <span class="neon-text">${confPercent}%</span></span>
                        <span>Time: ${item.inference_time_ms}ms</span>
                    </div>
                `;
                historyList.appendChild(historyEl);
            });
        } catch (error) {
            console.error("Failed to load history:", error);
        }
    }

    // Load history on startup
    loadHistory();

    // --- Counters Animation ---
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // lower is slower

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;
                                      if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    });

    counters.forEach(counter => observer.observe(counter));
});

  

