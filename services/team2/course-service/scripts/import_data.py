#!/usr/bin/env python3
import argparse
import logging
import sys
from pathlib import Path

from app.database.database import SessionLocal
from app.utils.data_import import DataImporter, DataImportError

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description='Import course and section data')
    parser.add_argument('--courses', type=str, help='Path to courses CSV or JSON file')
    parser.add_argument('--sections', type=str, help='Path to sections CSV file')
    parser.add_argument('--format', type=str, choices=['csv', 'json'], default='csv',
                      help='Format of the courses file (default: csv)')

    args = parser.parse_args()

    if not args.courses and not args.sections:
        logger.error("No input files specified. Use --courses or --sections")
        sys.exit(1)

    db = SessionLocal()
    importer = DataImporter(db)

    try:
        if args.courses:
            file_path = Path(args.courses)
            if not file_path.exists():
                logger.error(f"File not found: {args.courses}")
                sys.exit(1)

            if args.format == 'csv':
                result = importer.import_courses_from_csv(str(file_path))
            else:
                result = importer.import_courses_from_json(str(file_path))

            logger.info(f"Course import results: {result}")

        if args.sections:
            file_path = Path(args.sections)
            if not file_path.exists():
                logger.error(f"File not found: {args.sections}")
                sys.exit(1)

            result = importer.import_sections_from_csv(str(file_path))
            logger.info(f"Section import results: {result}")

    except DataImportError as e:
        logger.error(f"Import failed: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == '__main__':
    main() 