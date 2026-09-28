import json
import re

js_path = r"C:\Users\Deepak Sharma\.gemini\antigravity-ide\brain\c057849e-5ba7-467c-9e49-ea933f65edca\.system_generated\steps\1414\content.md"

with open(js_path, "r", encoding="utf-8") as f:
    code = f.read()

with open(r"C:\Users\Deepak Sharma\.gemini\antigravity-ide\brain\c057849e-5ba7-467c-9e49-ea933f65edca\scratch\competitor_strings.json", "r", encoding="utf-8") as f:
    strings = json.load(f)

# Group strings by domain categories
screens = [s for s in strings if any(w in s.lower() for w in ['overview', 'dashboard', 'analytics', 'prediction', 'sensor', 'node', 'map', 'simulation', 'alert', 'model', 'report', 'hardware', 'qnn', 'cad', 'dispatch'])]

print("--- Potential Screen / Feature Titles in Competitor Project ---")
for s in sorted(screens):
    if len(s) < 50 and not s.startswith("http") and not s.startswith("/"):
        print(" - ", s)
