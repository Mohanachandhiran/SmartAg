import os
import re

web_dir = r"c:\Users\mohan\OneDrive\Antigravity\SmartAg\apps\web"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace 'font-serif' with 'font-sans' in classNames where the tag contains a '₹' symbol.
    # A simpler approach: if a line contains '₹' and 'font-serif', replace 'font-serif' with 'font-sans tabnum'
    # 'tabnum' is a class defined in globals.css for tabular numbers.
    
    lines = content.split('\n')
    changed = False
    for i, line in enumerate(lines):
        if '₹' in line and 'font-serif' in line:
            lines[i] = line.replace('font-serif', 'font-sans tabnum')
            changed = True
            
        # also look for lines that might have the class and the next line has ₹
        elif 'font-serif' in line:
            # check if next few lines have ₹ before the tag closes
            for j in range(1, 4):
                if i+j < len(lines):
                    if '₹' in lines[i+j] and '</' in lines[i+j]:
                        lines[i] = line.replace('font-serif', 'font-sans tabnum')
                        changed = True
                        break
                    if '</' in lines[i+j]:
                        break

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(web_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
            process_file(os.path.join(root, file))
