/**
 * Language Reactor - Core Application Logic
 * Refactored for readability and modularity.
 */

// --- Constants & Configuration ---
const BENCHMARK_LIMIT = 9000000;
const STORAGE_KEY = 'reactor_comments';
const PROFANITY_REGEX = /\b(badword1|badword2|shit|fuck|asshole|bitch|bastard)\b/i;

const LANGUAGES_DATA = [
    { name: 'Assembly', icon: 'devicon-azuresqldatabase-plain colored', category: 'Compiled/Native', baseTime: 3100 },
    { name: 'C', icon: 'devicon-c-plain colored', category: 'Compiled/Native', baseTime: 3120 },
    { name: 'C++', icon: 'devicon-cplusplus-plain colored', category: 'Compiled/Native', baseTime: 3150 },
    { name: 'Zig', icon: 'devicon-zig-plain colored', category: 'Compiled/Native', baseTime: 3160 },
    { name: 'Fortran', icon: 'devicon-fortran-plain colored', category: 'Compiled/Native', baseTime: 3180 },
    { name: 'Rust', icon: 'devicon-rust-plain colored', category: 'Compiled/Native', baseTime: 3970 },
    { name: 'Nim', icon: 'devicon-nim-plain colored', category: 'Compiled/Native', baseTime: 4050 },
    { name: 'Go', icon: 'devicon-go-plain colored', category: 'Compiled/Managed', baseTime: 3810 },
    { name: 'Julia', icon: 'devicon-julia-plain colored', category: 'JIT Compiled', baseTime: 3870 },
    { name: 'Java', icon: 'devicon-java-plain colored', category: 'Managed (JVM)', baseTime: 5730 },
    { name: 'Node.js', icon: 'devicon-nodejs-plain colored', category: 'JIT (V8)', baseTime: 5800 },
    { name: 'C# (Mono)', icon: 'devicon-csharp-plain colored', category: 'Managed', baseTime: 5320 },
    { name: 'Python (Codon)', icon: 'devicon-python-plain colored', category: 'Compiled Python', baseTime: 10890 },
    { name: 'PHP', icon: 'devicon-php-plain colored', category: 'Interpreted', baseTime: 26320 },
    { name: 'Python', icon: 'devicon-python-plain colored', category: 'Interpreted', baseTime: 82310 },
];

let resultsChart;

// --- Chart Initialization ---
function initChart() {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    resultsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: LANGUAGES_DATA.map(l => l.name),
            datasets: [{
                label: 'Performance (ms)',
                data: LANGUAGES_DATA.map(l => 0),
                backgroundColor: 'rgba(255, 45, 85, 0.4)',
                borderColor: '#ff2d55',
                borderWidth: 2,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- Benchmark Logic ---
function updateResults(jsActualTime) {
    const scaleFactor = jsActualTime / 5800; // Node.js reference
    const updatedData = LANGUAGES_DATA.map(l => Math.round(l.baseTime * scaleFactor));

    resultsChart.data.datasets[0].data = updatedData;
    resultsChart.update();

    const tbody = document.getElementById('results-body');
    tbody.innerHTML = '';
    
    LANGUAGES_DATA.forEach((l, i) => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-white/5 last:border-0 hover:bg-neon-pink/5 transition-colors";
        tr.innerHTML = `
            <td class="py-4 px-2 text-slate-300">
                <div class="flex items-center gap-2">
                    <i class="${l.icon} text-lg"></i>
                    <span class="font-semibold text-xs md:text-sm text-white">${l.name}</span>
                </div>
            </td>
            <td class="py-4 px-2 text-slate-500 text-[10px] md:text-xs italic">${l.category}</td>
            <td class="py-4 px-2 text-right font-mono font-bold text-neon-pink text-xs md:text-sm">${updatedData[i]}ms</td>
        `;
        tbody.appendChild(tr);
    });
}

function runWebBenchmark() {
    const btn = document.getElementById('run-btn');
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    
    btn.disabled = true;
    span.innerText = 'Calculating...';
    icon.className = 'fas fa-spinner fa-spin';

    setTimeout(() => {
        const start = Date.now();
        let count = 0;
        
        const isPrime = (n) => {
            if (n <= 1) return false;
            for (let i = 2, end = Math.sqrt(n); i <= end; i++) {
                if (n % i === 0) return false;
            }
            return true;
        };

        for (let i = 0; i < BENCHMARK_LIMIT; i++) {
            if (isPrime(i)) count++;
        }

        updateResults(Date.now() - start);
        
        btn.disabled = false;
        span.innerText = 'Run Web Benchmark';
        icon.className = 'fas fa-play text-xs';
    }, 100);
}

// --- Comment System ---
function loadComments() {
    const container = document.getElementById('comments-list');
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    container.innerHTML = '';
    
    if (comments.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-center py-8 text-sm">No local comments yet. Share your feedback!</p>';
        return;
    }

    comments.reverse().forEach(c => {
        const div = document.createElement('div');
        div.className = 'bg-black/40 rounded-xl p-4 border border-white/5';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2 text-[10px] md:text-xs">
                <span class="font-bold text-neon-pink uppercase tracking-wider">${escapeHtml(c.name)}</span>
                <span class="text-slate-500 font-mono">${new Date(c.date).toLocaleString()}</span>
            </div>
            <div class="text-sm md:text-base leading-relaxed text-slate-300">${escapeHtml(c.text)}</div>
        `;
        container.appendChild(div);
    });
}

function postComment(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const text = document.getElementById('user-comment').value;

    if (PROFANITY_REGEX.test(name) || PROFANITY_REGEX.test(text)) {
        alert("Please keep the community feedback respectful. Profanity detected.");
        return;
    }

    const comments = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    comments.push({ name, text, date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    
    document.getElementById('user-name').value = '';
    document.getElementById('user-comment').value = '';
    loadComments();
}

// --- UI / Modal Logic ---
const modal = document.getElementById('comment-modal');
const toggleModal = (show) => {
    modal.classList.toggle('hidden', !show);
    document.body.classList.toggle('overflow-hidden', show);
    if (show) {
        loadComments();
        toggleFabMenu(false);
    }
};

const triggerHaptic = (type = 'light') => {
    if (!navigator.vibrate) return;
    
    switch (type) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(20);
            break;
        case 'heavy':
            navigator.vibrate([30, 50, 30]);
            break;
        case 'success':
            navigator.vibrate([10, 30, 10]);
            break;
    }
};

const toggleFabMenu = (forceState) => {
    const menu = document.getElementById('fab-menu');
    
    const isCurrentlyActive = menu.classList.contains('active');
    const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyActive;
    
    if (nextState !== isCurrentlyActive) {
        triggerHaptic('light');
    }
    
    menu.classList.toggle('active', nextState);
};

// --- Initialization ---
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.onload = () => {
    initChart();
    
    // Listeners
    document.getElementById('run-btn').addEventListener('click', runWebBenchmark);
    document.getElementById('menu-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFabMenu();
    });
    document.getElementById('open-comments').addEventListener('click', () => {
        triggerHaptic('medium');
        toggleModal(true);
    });
    document.getElementById('github-link').addEventListener('click', () => {
        triggerHaptic('medium');
    });
    document.getElementById('close-modal').addEventListener('click', () => toggleModal(false));
    document.getElementById('comment-form').addEventListener('submit', (e) => {
        triggerHaptic('success');
        postComment(e);
    });
    
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) toggleModal(false); 
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        toggleFabMenu(false);
    });
};
