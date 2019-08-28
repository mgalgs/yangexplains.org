#!/bin/bash

set -e
cd ~/sites/yangexplains.org/src

git pull --stat
./composectl exec flaskapp sh -c "cd /app/yangify; flask db upgrade"
./composectl run --rm frontend sh -c "cd /code; npm install && npm run build"
./etc/collectstatic.sh
./composectl restart flaskapp
