#!/bin/bash
# Script to run tests

set -e

echo "Running tests for Course Management API..."

# Set the Python path to include the current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Run pytest with coverage
python -m pytest --cov=app --cov-report=term-missing

echo "Tests completed!" 