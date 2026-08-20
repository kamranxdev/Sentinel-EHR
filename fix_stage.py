import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    # Replace (apt.stage || apt.status) with apt.status
    content = content.replace("(apt.stage || apt.status)", "apt.status")
    
    # Replace apt.stage || apt.status with apt.status
    content = content.replace("apt.stage || apt.status", "apt.status")
    
    # Replace apt.stage === 'X' || apt.status === 'X' with apt.status === 'X'
    content = re.sub(r"apt\.stage === '([^']+)' \|\| apt\.status === '\1'", r"apt.status === '\1'", content)
    
    # Replace apt.status === 'X' || apt.stage === 'X' with apt.status === 'X'
    content = re.sub(r"apt\.status === '([^']+)' \|\| apt\.stage === '\1'", r"apt.status === '\1'", content)

    # Replace apt.stage !== 'X' && apt.status !== 'X' with apt.status !== 'X'
    content = re.sub(r"apt\.stage !== '([^']+)' && apt\.status !== '\1'", r"apt.status !== '\1'", content)

    # Any remaining apt.stage === 'X' (where it wasn't paired)
    content = re.sub(r"apt\.stage === '([^']+)'", r"apt.status === '\1'", content)

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('/mnt/workspace/Sentinel-EHR/frontend/src/app'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.html'):
            process_file(os.path.join(root, file))
