import os
import re

emoji_map = {
    'Tomato': '🍅 Tomato',
    'Tomatoes': '🍅 Tomatoes',
    'Onion': '🧅 Onion',
    'Onions': '🧅 Onions',
    'Coconut': '🥥 Coconut',
    'Coconuts': '🥥 Coconuts',
    'Copra': '🥥 Copra',
    'Turmeric': '🫚 Turmeric',
    'Paddy': '🌾 Paddy',
    'Rice': '🍚 Rice',
    'Grapes': '🍇 Grapes',
    'Mango': '🥭 Mango',
    'Mangoes': '🥭 Mangoes',
    'Chilli': '🌶️ Chilli',
    'Chillies': '🌶️ Chillies',
    'Groundnut': '🥜 Groundnut',
    'Groundnuts': '🥜 Groundnuts',
    'Banana': '🍌 Banana',
    'Bananas': '🍌 Bananas',
    'Wheat': '🌾 Wheat',
    'Mustard': '🌼 Mustard',
    'Maize': '🌽 Maize',
    'Brinjal': '🍆 Brinjal'
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    for crop, emoji_crop in emoji_map.items():
        # Replace >Crop< in JSX
        content = re.sub(rf'>\s*{crop}\s*<', f'>{emoji_crop}<', content)
        # Replace Crop followed by words in JSX
        content = re.sub(rf'>\s*{crop} Collective', f'>{emoji_crop} Collective', content)
        content = re.sub(rf'>\s*{crop} Price', f'>{emoji_crop} Price', content)
        content = re.sub(rf'>\s*{crop} Group', f'>{emoji_crop} Group', content)
        content = re.sub(rf'>\s*{crop} supply', f'>{emoji_crop} supply', content)
        # Replace in mock message strings:
        content = re.sub(rf"'\s*{crop} prices", f"'{emoji_crop} prices", content)
        content = re.sub(rf"group for {crop}", f"group for {emoji_crop}", content)
        content = re.sub(rf"'{crop} supply", f"'{emoji_crop} supply", content)
        content = re.sub(rf"Primary Crops: {crop}", f"Primary Crops: {emoji_crop}", content)
        content = re.sub(rf"Mandi {crop.lower()}", f"Mandi {emoji_crop.lower()}", content)
        content = re.sub(rf"\*\*{crop}", f"**{emoji_crop}", content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

app_dir = r'c:\Users\mohan\OneDrive\Antigravity\SmartAg\apps\web\app'
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done replacing.")
