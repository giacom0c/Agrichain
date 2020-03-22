#!/bin/bash
echo "Starting server..."
sleep 1
npx lerna run start --scope server --stream
# Now open a second tab on the terminal and run testapi.sh
