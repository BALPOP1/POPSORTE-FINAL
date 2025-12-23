// Quina Results Display Script
const DATA_URL = 'data/results.json';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

// DOM Elements
const updateTimeEl = document.getElementById('updateTime');
const refreshBtn = document.getElementById('refreshBtn');
const latestResultEl = document.getElementById('latestResult');
const previousResultsEl = document.getElementById('previousResults');

// Fetch and display results
async function fetchResults() {
    try {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '⏳ Carregando...';

        // Add cache-busting parameter
        const response = await fetch(`${DATA_URL}?t=${Date.now()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        displayResults(data);

        updateTimeEl.textContent = new Date().toLocaleString('pt-BR');

    } catch (error) {
        console.error('Error fetching results:', error);
        latestResultEl.innerHTML = `
            <div class="error">
                <strong>⚠️ Não foi possível carregar os resultados ⚠️</strong>
                <p>Por favor, tente atualizar a página.</p>
            </div>
        `;
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = '🔄 Atualizar';
    }
}

// Display the results
function displayResults(data) {
    if (!data.results || data.results.length === 0) {
        latestResultEl.innerHTML = '<div class="error">Ainda não há resultados disponíveis.</div>';
        previousResultsEl.innerHTML = '';
        return;
    }

    // Sort results by draw number (newest first)
    const sortedResults = [...data.results].sort((a, b) => b.drawNumber - a.drawNumber);

    // Display latest result
    const latest = sortedResults[0];
    latestResultEl.innerHTML = createLatestResultHTML(latest);

    // Display previous results (skip the first one)
    const previousResults = sortedResults.slice(1);
    if (previousResults.length > 0) {
        previousResultsEl.innerHTML = `
            <div class="results-grid">
                ${previousResults.map(result => createPreviousResultHTML(result)).join('')}
            </div>
        `;
    } else {
        previousResultsEl.innerHTML = '<p style="text-align: center; color: #888;">Ainda não há resultados anteriores.</p>';
    }

    // Update the last fetched time from data
    if (data.lastUpdated) {
        const lastUpdate = new Date(data.lastUpdated);
        updateTimeEl.textContent = lastUpdate.toLocaleString('pt-BR');
    }
}

// Create HTML for latest result
function createLatestResultHTML(result) {
    return `
        <div class="latest-result-card">
            <div class="result-header">
                <div class="draw-info">
                    <span class="label">CONCURSO</span>
                    <span class="value">#${result.drawNumber}</span>
                </div>
                <div class="draw-info">
                    <span class="label">DATA</span>
                    <span class="value">${formatDate(result.date)}</span>
                </div>
            </div>
            <div class="numbers">
                ${result.numbers.map(num => `<div class="number-ball">${num}</div>`).join('')}
            </div>
        </div>
    `;
}

// Create HTML for previous result card
function createPreviousResultHTML(result) {
    return `
        <div class="previous-card">
            <div class="result-header" style="margin-bottom: 12px;">
                <div class="draw-info">
                    <span class="label">CONCURSO #${result.drawNumber}</span>
                    <span class="value" style="font-size: 0.9em;">${formatDate(result.date)}</span>
                </div>
            </div>
            <div class="numbers">
                ${result.numbers.map(num => `<div class="number-ball">${num}</div>`).join('')}
            </div>
        </div>
    `;
}

// Format date string to pt-BR
function formatDate(dateStr) {
    if (!dateStr) return 'Desconhecida';

    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

// Event listeners
refreshBtn.addEventListener('click', fetchResults);

// Initial load
fetchResults();

// Auto-refresh
setInterval(fetchResults, REFRESH_INTERVAL);

console.log('🎰 Resultados da Quina carregados! Atualização automática a cada 5 minutos.');