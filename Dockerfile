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
    && rm -rf /var/lib/apt/lists/* && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn 

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
RUN cd templates/typescript && yarn --frozen-lockfile --production && cd ../.. && \
    cd templates/javascript && yarn --frozen-lockfile --production && cd ../.. && \
    . /opt/venv/bin/activate && \
    cd templates/python && pip3 install -r requirements.txt && cd ../..

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

# Expose the port the app runs on
EXPOSE 3000

USER app_user

CMD ["node", "dist/main.js"]
