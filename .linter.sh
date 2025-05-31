#!/bin/bash
cd /home/kavia/workspace/code-generation/transoverlay-104906-63f29f87/transoverlay
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

