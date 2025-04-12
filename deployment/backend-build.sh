#!/bin/bash
# Backend build script for Render.com deployment

# Exit on error
set -e

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python -c "
import os
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

# Wait for database to be ready
db_url = os.environ.get('DATABASE_URL')
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

max_retries = 10
retries = 0
while retries < max_retries:
    try:
        engine = create_engine(db_url)
        connection = engine.connect()
        connection.close()
        break
    except OperationalError:
        retries += 1
        print(f'Database connection attempt {retries}/{max_retries} failed. Retrying in 5 seconds...')
        time.sleep(5)

if retries == max_retries:
    raise Exception('Could not connect to database')
"

# Run Alembic migrations
alembic upgrade head

echo "Backend build completed successfully"
