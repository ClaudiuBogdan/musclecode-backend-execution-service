#
# 🧑‍💻 Base Image for Shared Configuration
#
FROM debian:bookworm-slim as base

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

RUN chown app_user:app_user /app


# Ensure safety
USER app_user

#
# 🧪 Development Environment
#
FROM base as dev
ENV NODE_ENV development

# Install dependencies
COPY --chown=app_user:app_user package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Copy the rest of the application code
COPY --chown=app_user:app_user . .

#
# 🏗️ Build Environment
#
FROM dev as build
ENV NODE_ENV production

# Generate the production build. The build script runs "nest build" to compile the application.
RUN yarn build && \
    yarn install --frozen-lockfile --production && \
    yarn cache clean

# Remove development dependencies not needed in production
RUN rm -rf src && \
    rm -rf node_modules/.cache

#
# 🚀 Production Environment
#
FROM base as prod
ENV NODE_ENV production

# Copy necessary files from build stage
COPY --chown=app_user:app_user --from=build /app/dist ./dist
COPY --chown=app_user:app_user --from=build /app/node_modules ./node_modules
COPY --chown=app_user:app_user firejail.profile /app/firejail.profile

# Expose the port the app runs on
EXPOSE 3000

CMD ["node", "dist/main.js"]
