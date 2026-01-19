// --- Constants & Configuration ---
const BENCHMARK_LIMIT = 9000000;
const STORAGE_KEY = 'reactor_comments';
const PROFANITY_REGEX = /\b(f[u|*|k|v]ck|sh[i|*|t|t]t|b[i|*|t]tch|a[s|*|z]s|d[a|*|m]mn|h[e|*|l]ll|cr[a|*]p|p[u|*]ssy|d[i|*]ck|c[u|*]nt|f[a|*]g|n[i|*]gg[e|*]r|wh[o|*]re|sl[u|*]t|bastard|jackass|dumbass|retard|idiot|stupid|piss|bloody|crap|damn|goddamn|motherfucker|bollocks|bugger|tosser|wanker|slag|prick|twat|numbnut|skank|clit|nonce|nonce|shag|slag|minger|clunge|punter|knob|bellend|jizz|cum|semen|vagina|penis|porn|sex|xxx|boobs|tits|nipple|asshole|faggot|kike|spic|chink|wog|darkie|paki|coon|honky|gook|dyke|tranny|homo|biatch|muff|cooter|rectum|anus|fart|turd|testicle|scrotum|cock|balls|ejaculate|masturbate|orgasm|erotic|hardcore|pedophile|pedobear|bestiality|rape|incest|nazi|hitler|holocaust|terrorist|jihad|suicide|kill|death|murder|cocaine|heroin|meth|weed|marijuana|stoned|drunk|alcoholic|idiot|moron|retard|imbecile|loser|failure|suck|hate|ugly|fat|gross|disgusting)\b/gi;

function resolveApiBase() {
    const metaBase = document.querySelector('meta[name="api-base"]')?.content;
    const userBase = window.API_BASE;
    const isLiveServer = window.location.port === '5500' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    const origin = window.location.origin;

    if (userBase) return userBase;
    // If we're on port 3000, we're on the backend server, use same origin
    if (window.location.port === '3000') return origin;
    // If we're on a known dev server port or file protocol, fallback to 3000
    if (origin === 'null' || origin === 'file://' || isLiveServer) {
        return metaBase || 'http://127.0.0.1:3000';
    }
    return origin;
}

const API_BASE = resolveApiBase();

/**
 * Custom Notification System
 */
function showNotification(message, type = 'info') {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fa-info-circle';
    let title = 'Notification';
    
    if (type === 'success') { icon = 'fa-check-circle'; title = 'Success'; }
    else if (type === 'error') { icon = 'fa-exclamation-circle'; title = 'Error'; }
    else if (type === 'warning') { icon = 'fa-exclamation-triangle'; title = 'Warning'; }

    notification.innerHTML = `
        <i class="fas ${icon}" style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#ff2d55'}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;

    container.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto dismiss
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

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
    { name: 'Haskell', icon: 'devicon-haskell-plain colored', category: 'Compiled/Native', baseTime: 4200 },
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

// --- Real Benchmark Execution ---
async function runRealBenchmark(language) {
    const modal = document.getElementById('benchmark-modal');
    const output = document.getElementById('benchmark-output');
    const closeBtn = document.getElementById('close-benchmark-modal');
    
    // Show modal
    modal.classList.remove('hidden');
    output.innerHTML = `<div class="text-neon-pink"><i class="fas fa-spinner fa-spin"></i> Starting ${language} benchmark...</div>`;
    
    try {
        const eventSource = new EventSource(`${API_BASE}/api/run/${language}`);
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.status === 'heartbeat') {
                console.log('Heartbeat received');
                return;
            }

            if (data.status === 'queued') {
                output.innerHTML = `<div class="text-yellow-400"><i class="fas fa-clock"></i> Queued (position: ${data.position})</div>`;
            } else if (data.status === 'starting') {
                output.innerHTML += `<div class="text-blue-400"><i class="fas fa-rocket"></i> ${data.message}</div>`;
            } else if (data.status === 'running') {
                output.innerHTML += `<div class="text-slate-300">${escapeHtml(data.output)}</div>`;
                output.scrollTop = output.scrollHeight; // Auto-scroll
            } else if (data.status === 'success') {
                output.innerHTML += `<div class="text-green-400 mt-4"><i class="fas fa-check-circle"></i> Completed!</div>`;
                if (data.result.timeFormatted) {
                    output.innerHTML += `<div class="text-neon-pink font-bold text-xl mt-2">Time: ${data.result.timeFormatted}</div>`;
                }
                eventSource.close();
            } else if (data.status === 'error') {
                output.innerHTML += `<div class="text-red-400 mt-4"><i class="fas fa-exclamation-circle"></i> Error: ${escapeHtml(data.message)}</div>`;
                eventSource.close();
            } else if (data.status === 'completed') {
                eventSource.close();
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            output.innerHTML += `<div class="text-red-400 mt-4"><i class="fas fa-exclamation-circle"></i> Connection error. Server may be offline.</div>`;
            eventSource.close();
        };
        
    } catch (error) {
        console.error('Benchmark error:', error);
        output.innerHTML = `<div class="text-red-400"><i class="fas fa-exclamation-circle"></i> Failed to start benchmark: ${error.message}. API base: ${API_BASE}</div>`;
    }
}

function createLanguageButtons() {
    const container = document.getElementById('language-buttons');
    if (!container) return;
    
    const languages = [
        { name: 'Assembly', id: 'assembly' },
        { name: 'C', id: 'c' },
        { name: 'C++', id: 'cpp' },
        { name: 'Rust', id: 'rust' },
        { name: 'Go', id: 'go' },
        { name: 'Julia', id: 'julia' },
        { name: 'Java', id: 'java' },
        { name: 'Node.js', id: 'nodejs' },
        { name: 'C# (Mono)', id: 'csharp_mono' },
        { name: 'Dart', id: 'dart' },
        { name: 'Python (Codon)', id: 'python_codon' },
        { name: 'Pascal', id: 'pascal' },
        { name: 'Python', id: 'python' },
        { name: 'PHP', id: 'php' },
        { name: 'R', id: 'r' },
        { name: 'Ruby', id: 'ruby' },
        { name: 'Haskell', id: 'haskell' },
        { name: 'Zig', id: 'zig' },
        { name: 'Fortran', id: 'fortran' },
        { name: 'Nim', id: 'nim' }
    ];
    
    container.innerHTML = '';
    languages.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = 'px-4 py-2 bg-slate-800 hover:bg-neon-pink text-white rounded-lg transition-colors';
        btn.textContent = lang.name;
        btn.addEventListener('click', () => runRealBenchmark(lang.id));
        container.appendChild(btn);
    });
}

// --- Comment System ---
async function loadComments() {
    const container = document.getElementById('comments-list');
    container.innerHTML = '<p class="text-slate-500 text-center py-8 text-sm"><i class="fas fa-spinner fa-spin"></i> Loading comments...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/api/comments`);
        if (!response.ok) throw new Error('Failed to load comments');
        
        const comments = await response.json();
        container.innerHTML = '';
        
        if (comments.length === 0) {
            container.innerHTML = '<p class="text-slate-500 text-center py-8 text-sm">No comments yet. Be the first to share your feedback!</p>';
            return;
        }

        comments.forEach(c => {
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
    } catch (error) {
        console.error('Error loading comments:', error);
        container.innerHTML = '<p class="text-red-400 text-center py-8 text-sm"><i class="fas fa-exclamation-circle"></i> Failed to load comments. Server may be offline.</p>';
    }
}

async function postComment(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const text = document.getElementById('user-comment').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (PROFANITY_REGEX.test(name) || PROFANITY_REGEX.test(text)) {
        showNotification("Please keep the community feedback respectful. Profanity detected.", "error");
        return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    try {
        const response = await fetch(`${API_BASE}/api/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, text })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to post comment');
        }

        document.getElementById('user-name').value = '';
        document.getElementById('user-comment').value = '';
        await loadComments();
        
        // Show success message
        showNotification('Comment posted successfully! 🎉', 'success');
    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification(`Failed to post comment: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Post';
    }
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
    createLanguageButtons();
    
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
    document.getElementById('close-benchmark-modal').addEventListener('click', () => {
        document.getElementById('benchmark-modal').classList.add('hidden');
    });
    document.getElementById('comment-form').addEventListener('submit', (e) => {
        triggerHaptic('success');
        postComment(e);
    });
    
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) toggleModal(false); 
    });
    
    const benchmarkModal = document.getElementById('benchmark-modal');
    benchmarkModal.addEventListener('click', (e) => {
        if (e.target === benchmarkModal) benchmarkModal.classList.add('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        toggleFabMenu(false);
    });
};
