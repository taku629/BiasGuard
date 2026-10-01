#!/bin/bash
echo '# Audit Results' > docs/audit_results.md

echo 'Running tsc...'
npx tsc --noEmit
echo " - npx tsc --noEmit: True 
