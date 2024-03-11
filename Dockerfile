#
# 🧑‍💻 Base Image for Shared Configuration
#
FROM node:21-alpine as base
# Add necessary packages for installing Firejail and AppArmor
RUN apk add --no-cache libc6-compat firejail apparmor apparmor-utils

WORKDIR /app

# Create non-root user for Docker
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Ensure safety
USER nodejs

#
# 🧪 Development Environment
#
FROM base as dev
ENV NODE_ENV development

# Install dependencies
COPY --chown=nodejs:nodejs package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Copy the rest of the application code
COPY --chown=nodejs:nodejs . .

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
COPY --chown=nodejs:nodejs --from=build /app/dist ./dist
COPY --chown=nodejs:nodejs --from=build /app/node_modules ./node_modules

CMD ["node", "dist/main.js"]
