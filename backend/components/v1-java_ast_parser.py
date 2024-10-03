import os
import javalang
from javalang.tree import MethodDeclaration, MethodInvocation
from javalang.parse import parse
from tabulate import tabulate
import logging
from datetime import datetime
import subprocess
import tempfile
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EndpointAnalyzer:
    def __init__(self):
        self.endpoints = []
        self.rest_count = 0
        self.soap_count = 0
        self.tsys_endpoints_rest = []
        self.amq_endpoints_rest = []
        self.tsys_endpoints_soap = []
        self.amq_endpoints_soap = []
        self.method_map = {}

    def list_java_files(self, dir_path):
        java_files = []
        for root, _, files in os.walk(dir_path):
            if 'test' not in root.split(os.sep):
                for file in files:
                    if file.endswith(".java"):
                        java_files.append(os.path.join(root, file))
        return java_files

    def build_method_map(self, java_files):
        total_files = len(java_files)
        logger.info(f"Total Java files to process for method map: {total_files}")

        for idx, java_file in enumerate(java_files, start=1):
            logger.info(f"Building method map from file {idx}/{total_files}: {java_file}")
            try:
                with open(java_file, "r") as file:
                    source_code = file.read()
                    tree = parse(source_code)

                    for path, node in tree.filter(MethodDeclaration):
                        method_name = node.name
                        class_name = path[-2].name
                        self.method_map[method_name] = (class_name, node)

            except Exception as e:
                logger.error(f"Error processing file {java_file}: {e}")



    def analyze_endpoints(self, project_dir):
        java_files = self.list_java_files(project_dir)
        all_java_files = java_files 
        self.build_method_map(all_java_files)
        
        total_files = len(java_files)
        logger.info(f"Total Java files to process for endpoints: {total_files}")

        for idx, java_file in enumerate(java_files, start=1):
            logger.info(f"Processing file {idx}/{total_files}: {java_file}")
            try:
                with open(java_file, "r") as file:
                    source_code = file.read()
                    tree = parse(source_code)

                    for path, node in tree.filter(MethodDeclaration):
                        if self.is_rest_or_soap_endpoint(node):
                            method_name = node.name
                            endpoint_type = self.get_endpoint_type(node)
                            method_flow, tsys_calls, amq_calls, proc_calls = self.get_method_flow(node)
                            self.endpoints.append({
                                "file": os.path.basename(java_file),
                                "method": method_name,
                                "endpoint_type": endpoint_type,
                                "flow": method_flow,
                                "tsys_calls": tsys_calls,
                                "amq_calls": amq_calls,
                                "proc_calls": proc_calls
                            })

                            if endpoint_type == "REST":
                                self.rest_count += 1
                                if tsys_calls:
                                    self.tsys_endpoints_rest.append(method_name)
                                if amq_calls:
                                    self.amq_endpoints_rest.append(method_name)
                            else:
                                self.soap_count += 1
                                if tsys_calls:
                                    self.tsys_endpoints_soap.append(method_name)
                                if amq_calls:
                                    self.amq_endpoints_soap.append(method_name)

            except Exception as e:
                logger.error(f"Error processing file {java_file}: {e}")

        self.save_output_to_file()

    def is_rest_or_soap_endpoint(self, node):
        for annotation in node.annotations:
            if annotation.name in {"RequestMapping", "GetMapping", "PostMapping", "PutMapping", "DeleteMapping", "PatchMapping", "PayloadRoot"}:
                return True
        return False

    def get_endpoint_type(self, node):
        for annotation in node.annotations:
            if annotation.name in {"RequestMapping", "GetMapping", "PostMapping", "PutMapping", "DeleteMapping", "PatchMapping"}:
                return "REST"
            if annotation.name == "PayloadRoot":
                return "SOAP"
        return "Unknown"

    def get_method_flow(self, node, visited=None, depth=0, max_depth=5):
        if visited is None:
            visited = set()
        method_flow = []
        tsys_calls = []
        amq_calls = []
        proc_calls = []

        for _, method_invocation in node.filter(MethodInvocation):
            if method_invocation not in visited:
                visited.add(method_invocation)
                method_name = method_invocation.member
                method_class = method_invocation.qualifier if method_invocation.qualifier else "UnknownClass"
                
                if not self.is_skippable_method(method_name):
                    method_flow.append((method_name, method_class))
                    if "tsys" in method_name.lower():
                        tsys_calls.append(f"{method_name} ({method_class})")
                    if "sendevent" in method_name.lower() or ("eventsutil" in method_class.lower()):
                        amq_calls.append(f"{method_name} ({method_class})")
                    proc_name = self.find_stored_procedure_name(method_invocation)
                    if proc_name:
                        proc_calls.append(f"{method_name} ({method_class}) - {proc_name}")

                    if method_name in self.method_map and depth < max_depth:
                        sub_flow, sub_tsys_calls, sub_amq_calls, sub_proc_calls = self.get_method_flow(self.method_map[method_name][1], visited, depth + 1, max_depth)
                        method_flow.extend(sub_flow)
                        tsys_calls.extend(sub_tsys_calls)
                        amq_calls.extend(sub_amq_calls)
                        proc_calls.extend(sub_proc_calls)

        return method_flow, tsys_calls, amq_calls, proc_calls

    def find_stored_procedure_name(self, node):
        for _, method_invocation in node.filter(MethodInvocation):
            if method_invocation.member == 'withProcedureName':
                for arg in method_invocation.arguments:
                    if isinstance(arg, javalang.tree.Literal):
                        return arg.value.strip('"')
        return None

    def is_skippable_method(self, method_name):
        skippable_methods = {
            "equals", "error", "LOG", "info", "parseLong", "size", "remove", "get",
            "isEmpty", "valueOf", "isValid", "addAll", "toString", "append", "name", "ok"
        }
        return any(method_name.lower() == sk for sk in skippable_methods)

    def save_output_to_file(self):
        output = {
            "endpoints": [],
            "summary": {}
        }

        for endpoint in self.endpoints:
            endpoint_data = {
                "method": endpoint['method'],
                "file": endpoint['file'],
                "endpoint_type": endpoint['endpoint_type'],
                "flow": [f"{method_name} ({method_class})" for method_name, method_class in endpoint['flow']],
                "tsys_calls": endpoint['tsys_calls'],
                "amq_calls": endpoint['amq_calls'],
                "proc_calls": endpoint['proc_calls']
            }
            output["endpoints"].append(endpoint_data)

        output["summary"] = {
            "total_endpoints": self.rest_count + self.soap_count,
            "soap_endpoints": {
                "count": self.soap_count,
                "tsys_calls": len(self.tsys_endpoints_soap),
                "tsys_endpoints": self.tsys_endpoints_soap,
                "amq_calls": len(self.amq_endpoints_soap),
                "amq_endpoints": self.amq_endpoints_soap
            },
            "rest_endpoints": {
                "count": self.rest_count,
                "tsys_calls": len(self.tsys_endpoints_rest),
                "tsys_endpoints": self.tsys_endpoints_rest,
                "amq_calls": len(self.amq_endpoints_rest),
                "amq_endpoints": self.amq_endpoints_rest
            },
            "stored_proc_calls": len([ep for ep in self.endpoints if ep['proc_calls']]),
            "stored_proc_endpoints": [ep['method'] for ep in self.endpoints if ep['proc_calls']]
        }

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"endpoint_analysis_{timestamp}.json"

        with open(file_name, "w") as f:
            json.dump(output, f, indent=2)

        logger.info(f"Analysis saved to {file_name}")

if __name__ == "__main__":
    project_directory = "E://projects//ast-project//backend//temp_repos//spring-test" # Replace with your project directory
    analyzer = EndpointAnalyzer()
    analyzer.analyze_endpoints(project_directory)
