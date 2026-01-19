const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Configuration
const MAX_CONCURRENT_BENCHMARKS = 3;
const BENCHMARK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Queue management
const runningBenchmarks = new Set();
const queue = [];

/**
 * Run a benchmark for a specific language
 * @param {string} language - The language to benchmark
 * @param {function} onProgress - Callback for progress updates
 */
async function runBenchmark(language, onProgress) {
  // Check if we can run immediately or need to queue
  if (runningBenchmarks.size >= MAX_CONCURRENT_BENCHMARKS) {
    onProgress({ status: 'queued', position: queue.length + 1 });
    await new Promise((resolve) => {
      queue.push(resolve);
    });
  }

  runningBenchmarks.add(language);
  
  try {
    await executeBenchmark(language, onProgress);
  } finally {
    runningBenchmarks.delete(language);
    
    // Process next in queue
    if (queue.length > 0) {
      const next = queue.shift();
      next();
    }
  }
}

/**
 * Execute the benchmark script
 */
function executeBenchmark(language, onProgress) {
  return new Promise((resolve, reject) => {
    const projectRoot = path.join(__dirname, '..');
    const platform = os.platform();
    
    // Determine which script to use
    let scriptPath, scriptCommand;
    if (platform === 'win32') {
      scriptPath = path.join(projectRoot, 'scripts', 'run.ps1');
      scriptCommand = 'powershell.exe';
    } else {
      scriptPath = path.join(projectRoot, 'scripts', 'run.sh');
      scriptCommand = 'bash';
    }

    onProgress({ 
      status: 'starting', 
      language,
      message: `Starting ${language} benchmark...` 
    });

    // Spawn the process
    const args = platform === 'win32' ? ['-File', scriptPath, language] : [scriptPath, language];
    const child = spawn(scriptCommand, args, {
      cwd: projectRoot,
      shell: false
    });

    let stdout = '';
    let stderr = '';
    let timeoutId;

    // Set timeout
    timeoutId = setTimeout(() => {
      child.kill();
      reject(new Error('Benchmark timeout (5 minutes exceeded)'));
    }, BENCHMARK_TIMEOUT);

    // Heartbeat to keep connection alive during cool down/long execution
    const heartbeatInterval = setInterval(() => {
      onProgress({ status: 'heartbeat', timestamp: Date.now() });
    }, 15000);

    // Collect stdout
    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      
      // Send progress updates
      onProgress({
        status: 'running',
        language,
        output: output
      });
    });

    // Collect stderr
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle completion
    child.on('close', (code) => {
      clearTimeout(timeoutId);
      clearInterval(heartbeatInterval);

      if (code === 0) {
        // Parse the output to extract timing information
        const result = parseBenchmarkOutput(stdout, language);
        
        onProgress({
          status: 'success',
          language,
          result,
          fullOutput: stdout
        });
        
        resolve(result);
      } else {
        const errorMsg = stderr || 'Benchmark failed';
        onProgress({
          status: 'error',
          language,
          message: errorMsg
        });
        
        reject(new Error(errorMsg));
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      onProgress({
        status: 'error',
        language,
        message: error.message
      });
      reject(error);
    });
  });
}

/**
 * Parse benchmark output to extract timing and results
 */
function parseBenchmarkOutput(output, language) {
  const result = {
    language,
    timestamp: new Date().toISOString()
  };

  // Split output into lines and process from bottom up to find the latest result
  const lines = output.split('\n').filter(line => line.trim() !== '').reverse();

  // Pattern 1: Look for "real 0m3.123s" (Standard 'time' command output)
  const timePatternReal = /real\s+(\d+)m(\d+\.?\d*)s/;
  for (const line of lines) {
    const match = line.match(timePatternReal);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      result.time = (minutes * 60 + seconds) * 1000;
      result.timeFormatted = `${minutes}m${seconds}s`;
      break;
    }
  }

  // Pattern 2: Look for generic timing "3.123s" or "3.123 s"
  if (!result.time) {
    const genericTimePattern = /(\d+\.?\d*)\s*s(?:econds)?/i;
    for (const line of lines) {
      // Avoid matching version numbers (e.g., "Python 3.10.12")
      if (line.toLowerCase().includes('version')) continue;
      
      const match = line.match(genericTimePattern);
      if (match) {
        result.time = parseFloat(match[1]) * 1000;
        result.timeFormatted = `${match[1]}s`;
        break;
      }
    }
  }

  // Pattern 3: Look for "Prime count" or similar
  const primePattern = /prime.*?:\s*(\d+)/i;
  for (const line of lines) {
    const match = line.match(primePattern);
    if (match) {
      result.primeCount = parseInt(match[1]);
      break;
    }
  }

  return result;
}

/**
 * Get current benchmark queue status
 */
function getBenchmarkStatus() {
  return {
    running: Array.from(runningBenchmarks),
    queued: queue.length,
    maxConcurrent: MAX_CONCURRENT_BENCHMARKS,
    available: MAX_CONCURRENT_BENCHMARKS - runningBenchmarks.size
  };
}

module.exports = {
  runBenchmark,
  getBenchmarkStatus
};
