import json
import os

with open("data/words.json", "r") as f:
    words = json.load(f)

possible = words[:]

print(f"Total words: {len(possible)}")

# Row 1: "stair" -> s=absent, t=present, a=present, i=correct, r=present
guess1 = "stair"
states1 = ["absent", "present", "present", "correct", "present"]

correct_positions = {}
present_letters = {}
absent_letters = set()

for i in range(5):
    letter = guess1[i]
    state = states1[i]
    if state == "correct":
        correct_positions[i] = letter
    elif state == "present":
        present_letters.setdefault(letter, []).append(i)
    elif state == "absent":
        absent_letters.add(letter)

print(f"\nAfter 'stair':")
print(f"  correct_positions: {correct_positions}")
print(f"  present_letters: {present_letters}")
print(f"  absent_letters: {absent_letters}")

new_possible = []
for word in possible:
    valid = True
    for pos, letter in correct_positions.items():
        if word[pos] != letter:
            valid = False
            break
    if not valid:
        continue
    for letter, bad_positions in present_letters.items():
        if letter not in word:
            valid = False
            break
        for pos in bad_positions:
            if word[pos] == letter:
                valid = False
                break
        if not valid:
            break
    if not valid:
        continue
    for letter in absent_letters:
        is_correct = letter in correct_positions.values()
        is_present = letter in present_letters
        if not is_correct and not is_present:
            if letter in word:
                valid = False
                break
    if not valid:
        continue
    new_possible.append(word)

possible = new_possible
print(f"  Words remaining: {len(possible)}")
print(f"  'ratio' in list: {'ratio' in possible}")

# Row 2: "lemon" -> l=absent, e=absent, m=absent, o=present, n=absent
guess2 = "lemon"
states2 = ["absent", "absent", "absent", "present", "absent"]

correct_positions2 = {}
present_letters2 = {}
absent_letters2 = set()

for i in range(5):
    letter = guess2[i]
    state = states2[i]
    if state == "correct":
        correct_positions2[i] = letter
    elif state == "present":
        present_letters2.setdefault(letter, []).append(i)
    elif state == "absent":
        absent_letters2.add(letter)

print(f"\nAfter 'lemon':")
print(f"  correct_positions: {correct_positions2}")
print(f"  present_letters: {present_letters2}")
print(f"  absent_letters: {absent_letters2}")

new_possible2 = []
for word in possible:
    valid = True
    for pos, letter in correct_positions2.items():
        if word[pos] != letter:
            valid = False
            break
    if not valid:
        continue
    for letter, bad_positions in present_letters2.items():
        if letter not in word:
            valid = False
            break
        for pos in bad_positions:
            if word[pos] == letter:
                valid = False
                break
        if not valid:
            break
    if not valid:
        continue
    for letter in absent_letters2:
        is_correct = letter in correct_positions2.values()
        is_present = letter in present_letters2
        if not is_correct and not is_present:
            if letter in word:
                valid = False
                break
    if not valid:
        continue
    new_possible2.append(word)

possible = new_possible2
print(f"  Words remaining: {len(possible)}")
print(f"  'ratio' in list: {'ratio' in possible}")

# Row 3: "pudgy" -> all absent
guess3 = "pudgy"
states3 = ["absent"] * 5

absent_letters3 = set(guess3)

print(f"\nAfter 'pudgy':")
print(f"  absent_letters: {absent_letters3}")

new_possible3 = []
for word in possible:
    valid = True
    for letter in absent_letters3:
        if letter in word:
            valid = False
            break
    if not valid:
        continue
    new_possible3.append(word)

possible = new_possible3
print(f"  Words remaining: {len(possible)}")
print(f"  'ratio' in list: {'ratio' in possible}")

if possible:
    print(f"\nTop 20 suggestions:")
    for w in possible[:20]:
        print(f"  {w}")
    if "ratio" in possible:
        print(f"\n'ratio' is at position: {possible.index('ratio')}")
