import os
import re

directories = [
    'apps/web/app/farmer',
    'apps/web/app/fpo',
    'apps/web/app/buyer',
    'apps/web/app/government'
]

glass_class = 'bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm'

updated_files = 0

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file == 'page.tsx':
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace `<div className="mb-6">` that wraps an `<h1>`
                new_content = re.sub(
                    r'(<div className=")([^"]*mb-[4-8][^"]*)(">\s*<h1)',
                    r'\g<1>\g<2> ' + glass_class + r'\g<3>',
                    content
                )
                
                # Handle `flex flex-col ... pb-3`
                new_content = re.sub(
                    r'(<div className=")([^"]*flex flex-col[^"]*pb-3[^"]*)(">\s*<h1)',
                    r'\g<1>\g<2> ' + glass_class + r'\g<3>',
                    new_content
                )
                
                # Handle `justify-between` headers with `<div>` wrapping the `<h1>`
                new_content = re.sub(
                    r'(<div className=")([^"]*justify-between[^"]*border-b border-border[^"]*)(">\s*(?:<div>\s*)?<h1)',
                    r'\g<1>\g<2> ' + glass_class + r'\g<3>',
                    new_content
                )

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    updated_files += 1
                    print(f"Updated: {path}")

print(f'Updated {updated_files} files with glass headers.')
