#
# 🧑‍💻 Base Image for Shared Configuration
#
FROM debian:bookworm-slim AS base

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg2 \
    lsb-release \
    python3 \
    python3-pip \
    python3-venv \
    firejail \
    apparmor \
    apparmor-utils \
    vim \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/* && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn nodemon

ENV GOCACHE=/tmp/go-build
RUN mkdir -p /tmp/go-build && \
    chmod 777 /tmp/go-build && \
    mkdir -p /app/code && \
    chmod 777 /app/code

# Install jest dependencies
RUN yarn global add jest ts-jest @types/jest 

# Install python dependencies
# Create and activate a Python virtual environment
RUN python3 -m venv /opt/venv

RUN . /opt/venv/bin/activate && \
    pip3 install --upgrade pip && \
    pip3 install pytest && \
    pip3 install pytest-json-report

COPY firejail.profile /etc/firejail/ 

WORKDIR /app

# Create non-root user for Docker
RUN addgroup --system --gid 1001 app_user && \
    adduser --system --uid 1001 app_user 

#
# 🧪 Development Environment
#
FROM base AS dev
ENV NODE_ENV=development

# Copy package files first
COPY package.json yarn.lock ./

# Install main app dependencies
RUN yarn --frozen-lockfile

# Copy the application code (excluding templates)
COPY . .
RUN rm -rf templates

# Set ownership after files are copied
RUN chown -R app_user:app_user /app

# Switch to non-root user for safety
USER app_user

#
# 🏗️ Build Environment
#
FROM dev AS build
ENV NODE_ENV=production

# Generate the production build
RUN yarn build

# Install production dependencies
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Switch to root to handle templates
USER root

# Create templates directory structure
RUN mkdir -p dist/templates

# Copy and prepare templates
COPY templates ./templates

# Install template dependencies
RUN echo "Installing Typescript template dependencies..." && \
    cd templates/typescript && yarn --frozen-lockfile --production && cd ../.. && \
    echo "Installing Javascript template dependencies..." && \
    cd templates/javascript && yarn --frozen-lockfile --production && cd ../.. && \
    echo "Installing Python template dependencies..." && \
    python3 -m venv templates/python/venv && \
    . templates/python/venv/bin/activate && \
    cd templates/python && pip3 install -r requirements.txt && cd ../.. && \
    echo "Installing Go template dependencies..." && \
    mkdir -p templates/go && \
    cd templates/go && \
    curl -LO https://go.dev/dl/go1.24.1.linux-amd64.tar.gz && \
    echo "cb2396bae64183cdccf81a9a6df0aea3bce9511fc21469fb89a0c00470088073  go1.24.1.linux-amd64.tar.gz" | sha256sum -c - && \
    tar -xzf go1.24.1.linux-amd64.tar.gz && \
    rm go1.24.1.linux-amd64.tar.gz && \
    cd ../..

# Copy templates to dist
RUN cp -r templates/* dist/templates/ && \
    chown -R app_user:app_user /app/dist /app/templates
# Switch back to non-root user
USER app_user

# Remove development files
RUN rm -rf src && \
    rm -rf node_modules/.cache

#
# 🚀 Production Environment
#
FROM base AS prod
ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --chown=app_user:app_user --from=build /app/dist ./dist
COPY --chown=app_user:app_user --from=build /app/node_modules ./node_modules
COPY --chown=app_user:app_user --from=build /app/templates ./templates
COPY --chown=app_user:app_user firejail.profile /app/firejail.profile

# Expose the application and debug ports
EXPOSE 3000 9229

# Added chown command to ensure /app is writable by app_user
USER root
RUN chown -R app_user:app_user /app

RUN if [ ! -d /app/templates/python/venv ]; then \
    echo "Creating Python virtual environment in production..."; \
    python3 -m venv /app/templates/python/venv && \
    . /app/templates/python/venv/bin/activate && \
    cd /app/templates/python && pip3 install -r requirements.txt; \
    else \
    echo "Python virtual environment already exists in production."; \
    fi

USER app_user

# Use shell form to support environment variable expansion
COPY --chown=app_user:app_user docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]
