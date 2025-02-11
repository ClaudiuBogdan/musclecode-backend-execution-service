#!/bin/sh
set -e

if [ "$DEBUG_MODE" = "true" ]; then
    echo "Starting in debug mode..."
    if [ "$NODE_ENV" = "development" ]; then
        # Development mode with hot reload
        exec nodemon --inspect=0.0.0.0:9229 dist/main.js
    else
        # Debug mode without hot reload
        exec node --inspect=0.0.0.0:9229 dist/main.js
    fi
else
    echo "Starting in normal mode..."
    exec node dist/main.js
fi 