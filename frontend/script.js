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
