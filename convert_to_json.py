import json
import re

input_file = "valid-wordle-words.txt"
output_file = "data/words.json"

with open(input_file, "r", encoding="utf-8") as f:
    words = [line.strip().lower() for line in f if re.match(r"^[a-z]{5}$", line.strip())]

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(words, f, separators=(",", ":"))

print(f"Converted {len(words)} words to {output_file}")
