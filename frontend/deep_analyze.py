import json
import re

js_path = r"C:\Users\Deepak Sharma\.gemini\antigravity-ide\brain\c057849e-5ba7-467c-9e49-ea933f65edca\.system_generated\steps\1414\content.md"

with open(js_path, "r", encoding="utf-8") as f:
    code = f.read()

# Let's inspect Zustand stores or React routes
# Look for navigation routes
routes = re.findall(r'path:\s*"([^"]+)"', code)
print("Routes:", set(routes))

# Look for component names / tabs
tabs = re.findall(r'id:\s*"([^"]+)"[,\s]+label:\s*"([^"]+)"', code)
print("Tabs/Items:", tabs)

# Look for specific keywords like Qualcomm, LoRa, GSDMA, ESP32, Emergency CAD, Models
keywords = ['qualcomm', 'gsdma', 'dispatch', 'esp32', 'lora', 'shap', 'tflite', 'edge', 'sqlite', 'redis', 'postgres', 'fastapi', 'socket.io', 'websocket', 'offline', 'buffer', 'mesh']
for kw in keywords:
    matches = re.findall(rf'[^.{{}}();\n]*{kw}[^.{{}}();\n]*', code, re.IGNORECASE)
    print(f"\nKeyword '{kw}': {len(matches)} matches")
    for m in matches[:5]:
        print("  - ", m.strip()[:120])
