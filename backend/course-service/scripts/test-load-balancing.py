#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
import time
from collections import defaultdict

def run_command(command):
    """Run a command and return its output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}", file=sys.stderr)
        return None

def format_duration(seconds):
    """Format duration in a human-readable way"""
    if seconds < 1:
        return f"{seconds*1000:.2f}ms"
    return f"{seconds:.2f}s"

def main():
    parser = argparse.ArgumentParser(description='Test load balancing for Kubernetes service')
    parser.add_argument('--service', default='course-service', help='Name of the service to test')
    parser.add_argument('--requests', type=int, default=20, help='Number of requests to make')
    parser.add_argument('--interval', type=float, default=1.0, help='Interval between requests in seconds')
    args = parser.parse_args()

    # Print test configuration
    print("\033[34m=== Load Balancing Test Configuration ===\033[0m")
    print(f"Service: {args.service}")
    print(f"Number of requests: {args.requests}")
    print(f"Interval between requests: {args.interval}s")

    # Create test pod
    print("\n\033[33mCreating test pod...\033[0m")
    run_command("kubectl delete pod curl-test --grace-period=0 --force 2>/dev/null || true")
    if not run_command("kubectl run curl-test --image=curlimages/curl --restart=Never -- sleep 3600"):
        print("\033[31mFailed to create test pod\033[0m")
        return 1

    # Wait for pod to be ready
    print("Waiting for pod to be ready...")
    for _ in range(30):
        if run_command("kubectl get pod curl-test -o jsonpath='{.status.phase}'") == "Running":
            break
        time.sleep(1)
    else:
        print("\033[31mTimeout waiting for pod\033[0m")
        return 1

    # Initialize stats
    successful_requests = 0
    failed_requests = 0
    min_response_time = float('inf')
    max_response_time = 0
    total_response_time = 0
    pod_stats = defaultdict(int)

    print(f"\n\033[34m=== Starting Load Balance Testing ===\033[0m")
    print(f"Making {args.requests} requests to {args.service}...")

    for i in range(args.requests):
        print(f"\nRequest {i + 1}:")
        
        # Make request
        cmd = f'kubectl exec curl-test -- curl -s -i -w "\\nTIME:%{{time_total}}\\nCODE:%{{http_code}}" http://{args.service}/'
        response = run_command(cmd)
        
        if response:
            # Parse response
            lines = response.splitlines()
            status_code = None
            response_time = None
            hostname = None
            body = None
            
            for line in lines:
                if line.startswith('TIME:'):
                    response_time = float(line.split(':')[1])
                elif line.startswith('CODE:'):
                    status_code = line.split(':')[1]
                elif line.lower().startswith('x-hostname:'):
                    hostname = line.split(':', 1)[1].strip()
                elif '"message":"Welcome to' in line:
                    body = line

            if status_code == '200' and 'Welcome to' in str(body):
                successful_requests += 1
                if hostname:
                    pod_stats[hostname] += 1
                
                # Update timing stats
                total_response_time += response_time
                min_response_time = min(min_response_time, response_time)
                max_response_time = max(max_response_time, response_time)
                
                print(f"\033[32m✓ Success\033[0m - Pod: {hostname or 'unknown'}, Response time: {format_duration(response_time)}")
            else:
                failed_requests += 1
                print(f"\033[31m✗ Failed\033[0m - Status: {status_code}")
        
        time.sleep(args.interval)

    # Print results
    print(f"\n\033[34m=== Test Results ===\033[0m")
    print(f"Total Requests: {args.requests}")
    print(f"\033[32mSuccessful Requests: {successful_requests}\033[0m")
    print(f"\033[31mFailed Requests: {failed_requests}\033[0m")

    if successful_requests > 0:
        print("\nResponse Time Statistics:")
        print(f"Min: {format_duration(min_response_time)}")
        print(f"Max: {format_duration(max_response_time)}")
        print(f"Average: {format_duration(total_response_time / successful_requests)}")

        print("\nLoad Distribution:")
        for pod, count in pod_stats.items():
            percentage = (count / successful_requests) * 100
            print(f"{pod}: {count} requests ({percentage:.1f}%)")
            
            # Get pod stats
            pod_metrics = run_command(f"kubectl top pod {pod} --containers | tail -n 1")
            if pod_metrics:
                print(f"Pod Stats: {pod_metrics.strip()}")

    # Cleanup
    print("\n\033[33mCleaning up...\033[0m")
    run_command("kubectl delete pod curl-test --grace-period=0 --force 2>/dev/null")
    print("\033[32mTest completed!\033[0m")

if __name__ == '__main__':
    sys.exit(main())
