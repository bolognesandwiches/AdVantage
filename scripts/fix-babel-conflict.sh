#!/bin/bash

# This script checks for the .babelrc file in the frontend directory
# and removes it if it exists to prevent conflicts with Next.js

# Navigate to the frontend directory
cd "$(dirname "$0")/../frontend" || exit

# Check if .babelrc exists
if [ -f ".babelrc" ]; then
  echo "Detected .babelrc file which conflicts with Next.js. Removing..."
  rm -f .babelrc
  echo "Removed .babelrc file."
else
  echo ".babelrc file not found, no action needed."
fi

# Check if there are any other Babel configuration files
if [ -f ".babelrc.js" ]; then
  echo "Detected .babelrc.js file which conflicts with Next.js. Removing..."
  rm -f .babelrc.js
  echo "Removed .babelrc.js file."
fi

if [ -f "babel.config.js" ]; then
  echo "Detected babel.config.js file which conflicts with Next.js. Removing..."
  rm -f babel.config.js
  echo "Removed babel.config.js file."
fi

echo "Babel conflict check complete." 