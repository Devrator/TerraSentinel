import re
import json

js_path = r"C:\Users\Deepak Sharma\.gemini\antigravity-ide\brain\c057849e-5ba7-467c-9e49-ea933f65edca\.system_generated\steps\1414\content.md"

with open(js_path, "r", encoding="utf-8") as f:
    code = f.read()

print(f"Total bundle size: {len(code)} bytes")

# Extract strings of length > 8
strings = re.findall(r'"([^"\\]{4,100})"', code)
print(f"Extracted {len(strings)} strings")

# Search for navigation items, titles, tabs, features, API calls, models
nav_candidates = [s for s in strings if any(k in s.lower() for k in ['dashboard', 'node', 'sensor', 'alert', 'risk', 'map', 'simulation', 'model', 'api', 'predict', 'consensus', 'network', 'twin', 'lora', 'esp32', 'flood', 'fire', 'pollution', 'offline', 'buffer', 'battery', 'health', 'explain', 'shap', 'feature', 'incident', 'protocol'])]

print(f"Key domain strings found: {len(nav_candidates)}")
with open(r"C:\Users\Deepak Sharma\.gemini\antigravity-ide\brain\c057849e-5ba7-467c-9e49-ea933f65edca\scratch\competitor_strings.json", "w", encoding="utf-8") as out:
    json.dump(list(set(nav_candidates)), out, indent=2)

# Check for fetch / axios / backend URLs
urls = re.findall(r'https?://[^\s"\'>]+', code)
print(f"URLs found: {urls}")

endpoints = re.findall(r'/(?:api|ws)/[a-zA-Z0-9_\-\/]+', code)
print(f"API endpoints found: {set(endpoints)}")
