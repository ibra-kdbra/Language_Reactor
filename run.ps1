<#
.SYNOPSIS
    Run code in various programming languages.
.DESCRIPTION
    This script runs prime number benchmarks in different programming languages.
    If no argument is provided, the script will run code in all supported languages.
.PARAMETER Language
    The programming language to run. Supported languages are:
    assembly, c, cpp, rust, go, julia, java, nodejs, csharp, dart, 
    python_codon, pascal, python, php, r, ruby, chap, zig, fortran, nim
.EXAMPLE
    .\run.ps1
    Run code in all supported languages
.EXAMPLE
    .\run.ps1 cpp
    Run C++ code only
#>

param(
    [Parameter(Position = 0)]
    [string]$Language
)

function Run-Ruby {
    Write-Host "*------- ruby ---------*"
    
    gem update --system
    gem install cmath
    ruby -v

    Push-Location ./try
    ruby ./prime.rb
    Pop-Location

    Start-Sleep -Seconds 5 # cpu cool down
}

function Run-Assembly {
    Write-Host "*------- assembly (nasm) ---------*"
    nasm --version

    Push-Location ./try
    nasm -f win64 ./prime.asm
    link /entry:main /subsystem:console prime.obj
    Pop-Location

    Start-Sleep -Seconds 5 # cpu cool down
    ./try/prime.exe

    # check if file exists before attempting to remove it
    if (Test-Path "./try/prime.obj") { Remove-Item "./try/prime.obj" }
    if (Test-Path "./try/prime.exe") { Remove-Item "./try/prime.exe" }
}

function Run-C-Native {
    Write-Host "*---- c native (opt-level=3) -----*"
    gcc --version | Select-Object -First 1
    gcc ./try/prime.c -o prime.exe -lm -g -O3

    Start-Sleep -Seconds 5 # cpu cool down

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    Write-Host ""
}

function Run-Cpp-Native {
    Write-Host "*--- c++ native (opt-level=3) ----*"
    g++ --version | Select-Object -First 1
    g++ ./try/prime.cpp -o prime.exe -g -O3

    Start-Sleep -Seconds 5 # cpu cool down

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    Write-Host ""
}

function Run-Rust-Native {
    Write-Host "*--- rust native (opt-level=3) ---*"
    rustc --version
    rustc -C opt-level=3 -C target-cpu=native -C codegen-units=1 -C lto -C overflow-checks=off ./try/prime.rs -o prime.exe

    Start-Sleep -Seconds 5 # cool down cpu

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    Write-Host ""
}

function Run-Julia {
    Write-Host "*------------- julia -------------*"
    julia --version

    Start-Sleep -Seconds 5 # cpu cool down

    julia ./try/prime.jl
    Write-Host ""
    Write-Host ""
}

function Run-Go {
    Write-Host "*-------------- go ---------------*"
    go version
    go build -ldflags "-s -w" -o prime.exe ./try/prime.go

    Start-Sleep -Seconds 5 # cpu cool down

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    Write-Host ""
    Write-Host ""
}

function Run-Java {
    Write-Host "*-------- java (open-jdk) --------*"
    javac --version
    javac ./try/Prime.java

    Start-Sleep -Seconds 5 # cpu cool down

    Push-Location ./try
    java Prime
    # check if file exists before attempting to remove it
    if (Test-Path "./Prime.class") { Remove-Item "./Prime.class" }
    Pop-Location
    Write-Host ""
}

function Run-NodeJS {
    Write-Host "*------------ nodejs -------------*"
    node --version

    Start-Sleep -Seconds 5 # cool down cpu

    node ./try/prime.js
    Write-Host ""
}

function Run-CSharp {
    Write-Host "*------------ c# (dotnet) ------------*"
    
    # Check if dotnet is available (preferred on Windows)
    $dotnetAvailable = $null -ne (Get-Command dotnet -ErrorAction SilentlyContinue)
    
    if ($dotnetAvailable) {
        dotnet --version
        
        # Create a temporary project directory
        $tempDir = "./try/csharp_temp"
        if (-not (Test-Path $tempDir)) {
            New-Item -ItemType Directory -Path $tempDir | Out-Null
        }
        
        # Create a simple console project
        Push-Location $tempDir
        dotnet new console --force | Out-Null
        Copy-Item "../prime.cs" "./Program.cs" -Force
        dotnet build -c Release | Out-Null
        
        Start-Sleep -Seconds 5 # cpu cool down
        
        dotnet run -c Release
        Pop-Location
        
        # Cleanup
        if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    }
    else {
        # Fallback to csc if available
        csc --version
        csc /out:./try/prime.exe ./try/prime.cs
        
        Start-Sleep -Seconds 5 # cpu cool down
        
        ./try/prime.exe
        if (Test-Path "./try/prime.exe") { Remove-Item "./try/prime.exe" }
    }
    Write-Host ""
}

function Run-Dart-Native {
    Write-Host "*---------- dart native ----------*"
    dart --version
    dart compile exe ./try/prime.dart -o ./try/prime.exe

    Start-Sleep -Seconds 5 # cpu cool down

    ./try/prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./try/prime.exe") { Remove-Item "./try/prime.exe" }
    Write-Host ""
}

function Run-Python-Codon {
    Write-Host "*--------- python codon ----------*"
    codon --version
    codon build -release -exe ./try/prime.py -o ./try/prime.exe

    Start-Sleep -Seconds 5 # cpu cool down

    ./try/prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./try/prime.exe") { Remove-Item "./try/prime.exe" }
    Write-Host ""
}

function Run-Pascal {
    Write-Host "*------------ pascal -------------*"
    fpc ./try/prime.pas

    Start-Sleep -Seconds 5 # cpu cool down

    ./try/prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./try/prime.o") { Remove-Item "./try/prime.o" }
    if (Test-Path "./try/prime.exe") { Remove-Item "./try/prime.exe" }
    Write-Host ""
}

function Run-Python {
    Write-Host "*------------ python -------------*"
    python --version

    Start-Sleep -Seconds 5 # cpu cool down

    python ./try/prime.py
    Write-Host ""
}

function Run-PHP {
    Write-Host "*------------ Php -------------*"
    php --version

    Start-Sleep -Seconds 5 # cpu cool down

    php ./try/prime.php
    Write-Host ""
}

function Run-R {
    Write-Host "*------------ R -------------*"
    Rscript --version

    Start-Sleep -Seconds 5 # cpu cool down

    Rscript ./try/prime.R
    Write-Host ""
}

function Run-Chap {
    Write-Host "*------------ Chap -------------*"
    chap --version

    Start-Sleep -Seconds 5 # cpu cool down

    chap ./try/prime.chp
    Write-Host ""
}

function Run-Zig {
    Write-Host "*------------ Zig -------------*"
    zig version
    zig build-exe ./try/prime.zig -O ReleaseFast --name prime

    Start-Sleep -Seconds 5 # cpu cool down

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    if (Test-Path "./prime.pdb") { Remove-Item "./prime.pdb" }
    Write-Host ""
}

function Run-Fortran {
    Write-Host "*----------- Fortran -----------*"
    gfortran --version | Select-Object -First 1
    gfortran -O3 ./try/prime.f90 -o prime.exe

    Start-Sleep -Seconds 5 # cpu cool down

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    Write-Host ""
}

function Run-Nim {
    Write-Host "*------------- Nim -------------*"
    nim --version | Select-Object -First 1
    nim c -d:release --hints:off -o:prime.exe ./try/prime.nim

    Start-Sleep -Seconds 5 # cpu cool down

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    Write-Host ""
}

function Run-Scala {
    Write-Host "*------------- Scala -------------*"
    scala --version

    Start-Sleep -Seconds 5 # cpu cool down

    scala ./try/prime.scala
    Write-Host ""
}

function Run-Haskell {
    Write-Host "*----------- Haskell -----------*"
    ghc --version
    ghc -O2 ./try/prime.hs -o prime.exe

    Start-Sleep -Seconds 5 # cpu cool down

    ./prime.exe
    # check if file exists before attempting to remove it
    if (Test-Path "./prime.exe") { Remove-Item "./prime.exe" }
    if (Test-Path "./try/prime.hi") { Remove-Item "./try/prime.hi" }
    if (Test-Path "./try/prime.o") { Remove-Item "./try/prime.o" }
    Write-Host ""
}

# Define a hashtable to map language names to function names
$langs = @{
    "assembly"     = "Run-Assembly"
    "c"            = "Run-C-Native"
    "cpp"          = "Run-Cpp-Native"
    "rust"         = "Run-Rust-Native"
    "go"           = "Run-Go"
    "julia"        = "Run-Julia"
    "java"         = "Run-Java"
    "nodejs"       = "Run-NodeJS"
    "csharp"       = "Run-CSharp"
    "dart"         = "Run-Dart-Native"
    "python_codon" = "Run-Python-Codon"
    "pascal"       = "Run-Pascal"
    "python"       = "Run-Python"
    "php"          = "Run-PHP"
    "r"            = "Run-R"
    "ruby"         = "Run-Ruby"
    "chap"         = "Run-Chap"
    "zig"          = "Run-Zig"
    "fortran"      = "Run-Fortran"
    "nim"          = "Run-Nim"
    "scala"        = "Run-Scala"
    "haskell"      = "Run-Haskell"
}

function Display-Help {
    Write-Host "Usage: .\run.ps1 [LANGUAGE]"
    Write-Host ""
    Write-Host "Run code in various programming languages."
    Write-Host ""
    Write-Host "If no argument is provided, the script will run code in all supported"
    Write-Host "languages. Otherwise, provide a language name to run the corresponding"
    Write-Host "code. Supported languages are:"
    Write-Host ""
    foreach ($lang in $langs.Keys | Sort-Object) {
        Write-Host "- $lang"
    }
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  # Run code in all supported languages"
    Write-Host "  .\run.ps1"
    Write-Host ""
    Write-Host "  # Run C++ code"
    Write-Host "  .\run.ps1 cpp"
}

# Main execution logic
if ([string]::IsNullOrEmpty($Language)) {
    # Loop through all languages and call their corresponding functions
    foreach ($lang in $langs.Keys) {
        & $langs[$lang]
    }
}
elseif ($Language -eq "--help" -or $Language -eq "-h" -or $Language -eq "help") {
    # Display the help message if requested by the user
    Display-Help
}
else {
    # Check if the input argument is a valid language name and call its corresponding function
    if ($langs.ContainsKey($Language)) {
        & $langs[$Language]
    }
    else {
        Write-Host "Invalid choice: $Language"
        Write-Host "Use '.\run.ps1 --help' for a list of supported languages."
    }
}
