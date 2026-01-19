# Use a more complete base image for multiple compilers
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# 1. System Essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    wget \
    gnupg \
    ca-certificates \
    software-properties-common \
    time \
    zip \
    unzip \
    && apt-get clean

# 2. Main Languages (Direct Official Installers)

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Go
RUN wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz \
    && ln -s /usr/local/go/bin/go /usr/local/bin/go \
    && rm go1.21.6.linux-amd64.tar.gz

# Install Rust (using rustup)
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path \
    && chmod -R a+w $RUSTUP_HOME $CARGO_HOME

# Install Java (OpenJDK 17)
RUN apt-get install -y openjdk-17-jdk-headless

# 3. Secondary Languages (via apt-get)
# Note: Julia and Nim removed from here to be installed manually
RUN add-apt-repository -y universe \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    nasm \
    gfortran \
    python3 \
    python3-pip \
    ruby-full \
    fp-compiler \
    mono-devel \
    ghc \
    php-cli \
    r-base-core \
    && apt-get clean

# 4. Specialized Tooling & Manual Installs

# Install Julia (Manual Binary Install)
RUN wget https://julialang-s3.julialang.org/bin/linux/x64/1.9/julia-1.9.3-linux-x86_64.tar.gz \
    && tar zxvf julia-1.9.3-linux-x86_64.tar.gz -C /usr/local --strip-components 1 \
    && rm julia-1.9.3-linux-x86_64.tar.gz

# Install Nim (Manual Binary Install)
RUN wget https://nim-lang.org/download/nim-2.0.0-linux_x64.tar.xz \
    && tar -C /usr/local -xf nim-2.0.0-linux_x64.tar.xz \
    && ln -s /usr/local/nim-2.0.0/bin/nim /usr/local/bin/nim \
    && rm nim-2.0.0-linux_x64.tar.xz

# Install Dart
RUN curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/dart.gpg \
    && echo 'deb [signed-by=/usr/share/keyrings/dart.gpg] https://storage.googleapis.com/download.dartlang.org/linux/debian stable main' | tee /etc/apt/sources.list.d/dart.list \
    && apt-get update && apt-get install -y dart

# Install Zig
RUN wget https://ziglang.org/download/0.11.0/zig-linux-x86_64-0.11.0.tar.xz \
    && tar xf zig-linux-x86_64-0.11.0.tar.xz \
    && mv zig-linux-x86_64-0.11.0 /usr/local/zig \
    && ln -s /usr/local/zig/zig /usr/local/bin/zig \
    && rm zig-linux-x86_64-0.11.0.tar.xz

# Install Codon (Manual Binary Install - FIXED)
# The script was failing, so we download the release directly
RUN wget https://github.com/exaloop/codon/releases/download/v0.16.3/codon-linux-x86_64.tar.gz \
    && tar -C /usr/local -xzf codon-linux-x86_64.tar.gz \
    && ln -s /usr/local/codon-linux-x86_64/bin/codon /usr/local/bin/codon \
    && rm codon-linux-x86_64.tar.gz

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Ensure scripts are executable
RUN chmod +x scripts/*.sh

# Create the results directory
RUN mkdir -p result

# Expose the port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV PATH="/usr/lib/dart/bin:${PATH}"

# Start the application
CMD ["npm", "start"]