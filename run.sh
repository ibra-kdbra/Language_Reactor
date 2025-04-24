#!/bin/bash

function run_ruby {
    echo "*------- ruby ---------*"
    
    gem update --system
    gem install cmath
    ruby  -v

    cd ./try
    ruby  ./ruby.rb

    sleep 5 # cpu cool down
    ./try/prime
}

function run_assembly {
    echo "*------- assembly (nasm) ---------*"
    nasm --version

    cd ./try
    nasm -f elf64 ./prime.asm
    ld -s -o prime prime.o
    cd ..

    sleep 5 # cpu cool down
    ./try/prime

    # check if file exists before attempting to remove it
    [ -f "./try/prime.o" ] && rm ./try/prime.o
    [ -f "./try/prime" ] && rm ./try/prime
}

function run_c_native {
    echo "*---- c native (opt-level=3) -----*"
    gcc --version | head -n 1
    gcc ./try/prime.c -o prime -lm -g -O3

    sleep 5 # cpu cool down

    ./prime
    # check if file exists before attempting to remove it
    [ -f "./prime" ] && rm ./prime
    echo ""
}

function run_cpp_native {
    echo "*--- c++ native (opt-level=3) ----*"
    g++ --version | head -n 1
    g++ ./try/prime.cpp -o prime -g -O3

    sleep 5 # cpu cool down

    ./prime
    # check if file exists before attempting to remove it
    [ -f "./prime" ] && rm ./prime
    echo ""
}

function run_rust_native {
    echo "*--- rust native (opt-level=3) ---*"
    rustc --version
    rustc -C opt-level=3 -C target-cpu=native -C codegen-units=1 -C lto -C overflow-checks=off ./try/prime.rs

    sleep 5 # cool down cpu

    ./prime
    # check if file exists before attempting to remove it
    [ -f "./prime" ] && rm ./prime
    echo ""
}

function run_julia {
    echo "*------------- julia -------------*"
    julia --version

    sleep 5 # cpu cool down

    julia ./try/prime.jl
    echo ""
    echo ""
}

function run_go {
    echo "*-------------- go ---------------*"
    go version
    go build -ldflags "-s -w" ./try/prime.go

    sleep 5 # cpu cool down

    ./prime
    # check if file exists before attempting to remove it
    [ -f "./prime" ] && rm ./prime
    echo ""
    echo ""
}

function run_java {
    echo "*-------- java (open-jdk) --------*"
    javac --version
    javac ./try/Prime.java

    sleep 5 # cpu cool down

    cd src
    java Prime
    # check if file exists before attempting to remove it
    [ -f "./Prime.class" ] && rm ./Prime.class
    cd ..
    echo ""
}

function run_nodejs {
    echo "*------------ nodejs -------------*"
    node --version

    sleep 5 # cool down cpu

    node ./try/prime.js
    echo ""
}

function run_csharp_mono {
    echo "*------------ c# Mono ------------*"
    mcs --version
    mcs ./try/prime.cs

    sleep 5 # cpu cool down

    mono ./try/prime.exe
    # check if file exists before attempting to remove it
    [ -f "./try/prime.exe" ] && rm ./try/prime.exe
    echo ""
}

function run_dart_native {
    echo "*---------- dart native ----------*"
    dart --version
    dart compile exe ./try/prime.dart

    sleep 5 # cpu cool down

    ./try/prime.exe
    # check if file exists before attempting to remove it
    [ -f "./try/prime.exe" ] && rm ./try/prime.exe
    echo ""
}

function run_python_codon {
    echo "*--------- python codon ----------*"
    codon --version
    codon build -release -exe ./try/prime.py

    sleep 5 # cpu cool down

    ./try/prime
    # check if file exists before attempting to remove it
    [ -f "./try/prime" ] && rm ./try/prime
    echo ""
}

function run_pascal {
    echo "*------------ pascal -------------*"
    fpc ./try/prime.pas

    sleep 5 # cpu cool down

    ./try/prime
    # check if file exists before attempting to remove it
    [ -f "./try/prime.o" ] && rm ./try/prime.o
    [ -f "./try/prime" ] && rm ./try/prime
    echo ""
}

function run_python {
    echo "*------------ python -------------*"
    python3 --version

    sleep 5 # cpu cool down

    sleep 5 # cpu cool down
    python3 ./try/prime.py
    echo ""
}

function run_php {
    echo "*------------ Php -------------*"
    php --version

    sleep 5 # cpu cool down

    php ./try/prime.php
    echo ""
}

function run_r {
    echo "*------------ R -------------*"
    Rscript --version

    sleep 5 # cpu cool down

    Rscript ./try/prime.R
    echo ""
}

function run_chap {
    echo "*------------ Chap -------------*"
    chap --version

    sleep 5 # cpu cool down

    chap ./try/prime.chp
    echo ""
}

# Define an associative array to map language names to function names
declare -A langs=(
    ["assembly"]="run_assembly"
    ["c"]="run_c_native"
    ["cpp"]="run_cpp_native"
    ["rust"]="run_rust_native"
    ["go"]="run_go"
    ["julia"]="run_julia"
    ["java"]="run_java"
    ["nodejs"]="run_nodejs"
    ["csharp_mono"]="run_csharp_mono"
    ["dart"]="run_dart_native"
    ["python_codon"]="run_python_codon"
    ["pascal"]="run_pascal"
    ["python"]="run_python"
    ["php"]="run_php"
    ["r"]="run_r"
    ["ruby"]="run_ruby"
    ["chap"]="run_chap"
)

# Define a function to display the help message
function display_help {
    echo "Usage: $0 [LANGUAGE]"
    echo ""
    echo "Run code in various programming languages."
    echo ""
    echo "If no argument is provided, the script will run code in all supported"
    echo "languages. Otherwise, provide a language name to run the corresponding"
    echo "code. Supported languages are:"
    echo ""
    for lang in "${!langs[@]}"; do
        echo "- $lang"
    done
    echo ""
    echo "Examples:"
    echo "  # Run code in all supported languages"
    echo "  $0"
    echo ""
    echo "  # Run C++ code"
    echo "  $0 cpp"
}

if [ $# -eq 0 ]; then
    # Loop through all languages and call their corresponding functions
    for lang in "${!langs[@]}"; do
        ${langs["$lang"]}
    done
elif [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    # Display the help message if requested by the user
    display_help
else
    # Check if the input argument is a valid language name and call its corresponding function
    if [[ ${langs[$1]+_} ]]; then
        ${langs[$1]}
    else
        echo "Invalid choice"
    fi
fi
