import os

replacements = {
    "bg-cg-neutral": "bg-base-100",
    "bg-cg-primary": "bg-primary",
    "text-cg-primary": "text-primary",
    "text-cg-accent": "text-accent",
    "text-cg-secondary": "text-secondary",
    "text-cg-info": "text-info",
    "text-cg-warning": "text-warning",
    "border-cg-accent": "border-accent",
    "bg-[#18181b]": "bg-base-200",
    "border-white/5": "border-base-content/10",
    "text-white": "text-base-content",
    "text-gray-200": "text-base-content/90",
    "text-gray-300": "text-base-content/80",
    "text-gray-400": "text-base-content/70",
    "text-gray-500": "text-base-content/60",
    "border-gray-500/20": "border-base-content/10",
    "bg-primary/10": "bg-primary/10",
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith(".html") or file.endswith(".css"):
            process_file(os.path.join(root, file))

