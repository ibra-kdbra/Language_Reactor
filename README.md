# Performance Test: Language Reactor

This repository contains implementations of the `is_prime` function in multiple programming languages using the same algorithm. The goal is to compare the performance of different languages and runtimes in a standardized environment.

## 🚀 New Features

**⚡ Real-time Cloud Benchmarking** - Run actual benchmarks on the server with live output streaming via Server-Sent Events (SSE).

**💬 Persistent Community Feedback** - Integrated with **Turso (LibSQL)** to store comments permanently in the cloud, even on serverless platforms.

**🛡️ Robust & Secure** - Custom Content Security Policy (CSP), high-performance rate limiting, and an extensive profanity filtering system.

**🤖 Automated Deployment** - Fully containerized with Docker and automated via **GitHub Actions** for continuous deployment to Google Cloud Run.

---

## Quick Start

### 1. Static Mode (Frontend Only)

Open [docs/index.html](docs/index.html) in a browser to view pre-calculated results and run JavaScript-based browser benchmarks.

### 2. Full-Stack Mode (Local Development)

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Open browser:** `http://localhost:3000`

### 3. Cloud Deployment

The project is optimized for the Google Cloud "Always Free" tier.

- See [**`docs/meta/GCP_DEPLOYMENT.md`**](./docs/meta/GCP_DEPLOYMENT.md) for step-by-step instructions on deploying with Turso and GitHub Actions.

---

## Project Structure

- **`docs/`**: Frontend web dashboard and deployment documentation.
- **`server/`**: Node.js backend logic, API, and database drivers.
- **`scripts/`**: High-performance execution scripts for the benchmark engine.
- **`src/benchmarks/`**: Core prime-number algorithm implementations for all 16+ languages.
- **`result/`**: Repository of historical benchmark data across different CPUs.

---

## Supported Languages

The benchmark environment (Docker) supports:

- **Compiled/Native**: Assembly (NASM), C (GCC), C++ (G++), Rust, Go, Zig, Fortran, Nim, Haskell, Pascal (FPC).
- **Managed/JIT**: Java (OpenJDK), Node.js, C# (Mono), Dart, Julia.
- **Interpreted**: Python, PHP, Ruby, R.
- **Specialized**: Codon (High-performance Python compiler).

---

## Usage (CLI)

### Linux/macOS

```bash
./scripts/run.sh [LANGUAGE]
```

### Windows (PowerShell)

```powershell
.\scripts\run.ps1 [LANGUAGE]
```

---

## Results: Intel(R) Core(TM) i7-8550U

| Ranking | Language | Runtime/Compiler | Time | n% Slower |
| :--- | :--- | :--- | :--- | :--- |
| #1 | Assembly | NASM | 3.10s | Winner |
| #2 | C | GCC | 3.12s | 0.64% |
| #3 | C++ | G++ | 3.15s | 1.6% |
| #4 | Zig | Zig 0.11.0 | 3.16s | 1.9% |
| #5 | Fortran | GFortran 13.1 | 3.18s | 2.6% |
| #6 | Go | Go | 3.81s | 22% |
| #7 | Julia | Julia | 3.87s | 24% |
| #8 | Rust | Rustc (O3) | 3.97s | 28% |
| #9 | Nim | Nim | 4.05s | 30% |
| #10 | Haskell | GHC (O3) | 4.20s | 35% |
| #11 | C# | Mono | 5.32s | 71% |
| #12 | Java | OpenJDK 17 | 5.73s | 84% |
| #13 | Js | Nodejs 20 | 5.80s | 87% |
| #14 | Dart | Dart | 7.11s | 129% |
| #15 | Python | Codon | 10.89s | 251% |
| #16 | Pascal | FPC | 13.68s | 341% |
| #17 | PHP | PHP | 26.32s | 749% |
| #18 | Python | Python 3 | 82.31s | 2545% |
| #19 | Ruby | Ruby | 85.55s | 2641% |
| #20 | R | Rscript | 240.0s | 7641% |

---

## Contribute

1. Optimize your favorite language **without changing the algorithm** or using concurrency.
2. Add a new language implementation using the same prime-number logic.
3. Share your hardware results by submitting a PR to the `result/` directory.

---

## Modernization Credits

The project was recently restructured and modernized. For a full log of changes, see [**`docs/meta/IMPLEMENTATION_SUMMARY.md`**](./docs/meta/IMPLEMENTATION_SUMMARY.md).
