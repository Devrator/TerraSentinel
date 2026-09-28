import json
import re

js_path = r"C:\Users\Deepak Sharma\.gemini\antigravity-ide\brain\c057849e-5ba7-467c-9e49-ea933f65edca\.system_generated\steps\1414\content.md"

with open(js_path, "r", encoding="utf-8") as f:
    code = f.read()

# Let's check how they fetch data / mock data
mock_data_clues = re.findall(r'(\[{"node_id":[^\]]+\])', code)
print(f"Hardcoded Node objects found: {len(mock_data_clues)}")
if mock_data_clues:
    print("Sample node data:", mock_data_clues[0][:300])

# Check their local backend url:
backends = re.findall(r'http://localhost:\d+/[^"\'`\s]+', code)
print("Configured Local Backend Endpoints:", set(backends))

# Check GIS layers
gis_layers = re.findall(r'(?:satellite|imagery|dark_gray|narol|vatva|hazira|nandesari)[^"\'`]*', code, re.IGNORECASE)
print("GIS layers mentioned:", set([g for g in gis_layers if len(g) < 60]))

# Check dispatch / alert integrations
agency = re.findall(r'(?:GSDMA|NDRF|SDRF|108|EMRI|Gujarat|Fire Service)[^"\'`]*', code)
print("Agency / integration claims:", set([a for a in agency if len(a) < 60]))
