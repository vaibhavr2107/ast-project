import os
import json
import javalang
import logging
import sys
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_java_file(file_path: str) -> Dict[str, List[str]]:
    """Parse a single Java file and return its methods."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            tree = javalang.parse.parse(file.read())
        
        methods = []
        for _, node in tree.filter(javalang.tree.MethodDeclaration):
            methods.append(node.name)
        
        return {file_path: methods}
    except Exception as e:
        logger.error(f"Error parsing file {file_path}: {str(e)}")
        return {file_path: []}

def parse_project(project_path: str) -> Dict[str, List[str]]:
    """Parse all Java files in the project and return their methods."""
    project_structure = {}
    for root, _, files in os.walk(project_path):
        if 'test' in root.split(os.path.sep):
            continue  # Skip test folders
        for file in files:
            if file.endswith('.java'):
                file_path = os.path.join(root, file)
                project_structure.update(parse_java_file(file_path))
    return project_structure

def main(project_path: str):
    """Main function to parse the project and print results."""
    try:
        logger.info(f"Starting to parse project at: {project_path}")
        project_structure = parse_project(project_path)
        
        # Convert the result to JSON and print
        print(json.dumps(project_structure, indent=2))
        
        logger.info("Parsing completed successfully")
    except Exception as e:
        logger.error(f"Error in main function: {str(e)}")
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Project path not provided"}))
        sys.exit(1)
    
    project_path = sys.argv[1]
    main(project_path)