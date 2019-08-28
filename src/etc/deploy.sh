#!/bin/bash

set -e
cd ~/sites/yangexplains.org/src

git pull --stat
docker exec --user=root src_flaskapp_1 sh -c "cd /app; pip install -r requirements.txt"
./composectl exec flaskapp sh -c "cd /app/yangify; flask db upgrade"
./composectl run --rm frontend sh -c "cd /code; npm install && npm run build"
./etc/collectstatic.sh
./composectl restart flaskapp
