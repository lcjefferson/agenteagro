#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt

# Create tables
python create_missing_tables.py
