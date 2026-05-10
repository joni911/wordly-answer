import tkinter as tk
from tkinter import ttk, messagebox
import json
import os

ROWS = 6
COLS = 5
STATES = ["none", "correct", "present", "absent"]
STATE_COLORS = {
    "none": "#ffffff",
    "correct": "#6aaa64",
    "present": "#c9b458",
    "absent": "#787c7e",
}
STATE_TEXT_COLORS = {
    "none": "#000000",
    "correct": "#ffffff",
    "present": "#ffffff",
    "absent": "#ffffff",
}
STATE_HINT = {
    "none": "klik untuk ubah",
    "correct": "huruf benar (hijau)",
    "present": "salah posisi (kuning)",
    "absent": "tidak ada (abu)",
}


class WordleSolver:
    def __init__(self, root):
        self.root = root
        self.root.title("Wordle Solver")
        self.root.geometry("850x1050")
        self.root.resizable(False, False)

        self.words = []
        self.possible_words = []
        self.current_row = 0
        self.current_col = 0
        self.tile_states = [["none"] * COLS for _ in range(ROWS)]
        self.tiles = []
        self.key_states = {}
        self.guesses = [""] * ROWS

        self.template_words = ["stair", "lemon", "pudgy"]
        self.template_buttons = []

        self.build_ui()
        self.load_dictionary()

    def load_dictionary(self):
        dict_path = os.path.join(os.path.dirname(__file__), "data", "words.json")
        try:
            with open(dict_path, "r", encoding="utf-8") as f:
                self.words = json.load(f)
            self.possible_words = self.words[:]
            self.status_text.set(f"Kamus siap: {len(self.words)} kata")
            self.update_recommendations()
        except FileNotFoundError:
            messagebox.showerror("Error", f"File kamus tidak ditemukan:\n{dict_path}")
            self.status_text.set("Kamus tidak ditemukan")

    def build_ui(self):
        main_frame = ttk.Frame(self.root, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)

        header = ttk.Label(main_frame, text="Wordle Solver", font=("Helvetica", 20, "bold"))
        header.pack(pady=(0, 2))

        instructions = ttk.Label(
            main_frame,
            text="Klik tombol template untuk isi → Pilih mode → Klik tile untuk set flag → Submit",
            font=("Helvetica", 9),
            foreground="#666",
        )
        instructions.pack(pady=(0, 5))

        self.status_text = tk.StringVar(value="Memuat kamus...")
        ttk.Label(main_frame, textvariable=self.status_text, font=("Helvetica", 9)).pack(pady=(0, 3))

        self.message_text = tk.StringVar(value="")
        self.message_label = ttk.Label(main_frame, textvariable=self.message_text, font=("Helvetica", 10), foreground="blue")
        self.message_label.pack(pady=(0, 3))

        mode_frame = tk.Frame(main_frame)
        mode_frame.pack(pady=5)

        ttk.Label(mode_frame, text="Mode:", font=("Helvetica", 10, "bold")).pack(side=tk.LEFT, padx=(0, 10))

        self.mode_var = tk.StringVar(value="correct")

        mode_options = [
            ("correct", "Benar", STATE_COLORS["correct"]),
            ("present", "Salah Posisi", STATE_COLORS["present"]),
            ("absent", "Salah", STATE_COLORS["absent"]),
        ]

        for state, label, color in mode_options:
            btn = tk.Radiobutton(
                mode_frame,
                text=label,
                variable=self.mode_var,
                value=state,
                indicatoron=False,
                selectcolor=color,
                fg="white",
                font=("Helvetica", 10, "bold"),
                width=14,
            )
            btn.pack(side=tk.LEFT, padx=3)

        board_container = tk.Frame(main_frame)
        board_container.pack(pady=3)

        self.tiles = []
        self.template_buttons = []
        for r in range(ROWS):
            row_frame = tk.Frame(board_container)
            row_frame.pack(pady=1)

            row_tiles = []
            for c in range(COLS):
                tile = tk.Label(
                    row_frame,
                    text="",
                    width=3,
                    height=1,
                    font=("Helvetica", 14, "bold"),
                    relief=tk.SOLID,
                    borderwidth=2,
                    bg=STATE_COLORS["none"],
                    fg=STATE_TEXT_COLORS["none"],
                )
                tile.pack(side=tk.LEFT, padx=2, pady=2)
                tile.bind("<Button-1>", lambda e, row=r, col=c: self.apply_mode_to_tile(row, col))
                row_tiles.append(tile)
            self.tiles.append(row_tiles)

            if r < len(self.template_words):
                tbtn = tk.Button(
                    row_frame,
                    text=self.template_words[r].upper(),
                    width=8,
                    font=("Helvetica", 10, "bold"),
                    bg="#d3d6da",
                    command=lambda row=r: self.fill_template(row),
                )
                tbtn.pack(side=tk.LEFT, padx=10, pady=2)
                self.template_buttons.append(tbtn)
            else:
                spacer = tk.Label(row_frame, width=8)
                spacer.pack(side=tk.LEFT, padx=10, pady=2)

        keyboard_frame = tk.Frame(main_frame)
        keyboard_frame.pack(pady=4)

        self.keys = {}
        keyboard_rows_layout = [
            ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
            ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
            ["z", "x", "c", "v", "b", "n", "m"],
        ]

        for row_idx, row_keys in enumerate(keyboard_rows_layout):
            for col_idx, key in enumerate(row_keys):
                btn = tk.Button(
                    keyboard_frame,
                    text=key.upper(),
                    width=2,
                    height=1,
                    font=("Helvetica", 11, "bold"),
                    bg="#f0f0f0",
                    command=lambda k=key: self.add_letter(k),
                )
                btn.grid(row=row_idx, column=col_idx, padx=2, pady=2)
                self.keys[key] = btn

        controls_frame = tk.Frame(main_frame)
        controls_frame.pack(pady=4)

        ttk.Button(controls_frame, text="Submit", command=self.submit_guess, width=12).pack(side=tk.LEFT, padx=5)
        ttk.Button(controls_frame, text="Undo", command=self.undo_letter, width=12).pack(side=tk.LEFT, padx=5)
        ttk.Button(controls_frame, text="Clear", command=self.clear_board, width=12).pack(side=tk.LEFT, padx=5)
        ttk.Button(controls_frame, text="Reset", command=self.reset_game, width=12).pack(side=tk.LEFT, padx=5)

        suggestions_header = ttk.Label(main_frame, text="Rekomendasi Kata:", font=("Helvetica", 12, "bold"))
        suggestions_header.pack(pady=(5, 3))

        suggestions_container = tk.Frame(main_frame)
        suggestions_container.pack(fill=tk.BOTH, expand=True)

        left_frame = tk.Frame(suggestions_container)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))

        ttk.Label(left_frame, text="Kata Terbaik (Skor)", font=("Helvetica", 10, "bold")).pack()

        self.best_listbox = tk.Listbox(
            left_frame,
            height=12,
            font=("Consolas", 13),
            selectmode=tk.SINGLE,
            exportselection=False,
        )
        self.best_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.best_listbox.bind("<<ListboxSelect>>", self.on_suggestion_select)

        best_scroll = ttk.Scrollbar(left_frame, orient=tk.VERTICAL, command=self.best_listbox.yview)
        best_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.best_listbox.config(yscrollcommand=best_scroll.set)

        right_frame = tk.Frame(suggestions_container)
        right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(5, 0))

        ttk.Label(right_frame, text="Kata Filter (Uji Huruf Baru)", font=("Helvetica", 10, "bold")).pack()

        self.filter_listbox = tk.Listbox(
            right_frame,
            height=12,
            font=("Consolas", 13),
            selectmode=tk.SINGLE,
            exportselection=False,
        )
        self.filter_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.filter_listbox.bind("<<ListboxSelect>>", self.on_suggestion_select)

        filter_scroll = ttk.Scrollbar(right_frame, orient=tk.VERTICAL, command=self.filter_listbox.yview)
        filter_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.filter_listbox.config(yscrollcommand=filter_scroll.set)

        self.count_label = ttk.Label(main_frame, text="", font=("Helvetica", 9))
        self.count_label.pack(pady=(3, 0))

        stats_header = ttk.Label(main_frame, text="Statistik Huruf:", font=("Helvetica", 11, "bold"))
        stats_header.pack(pady=(8, 3))

        self.stats_frame = tk.Frame(main_frame)
        self.stats_frame.pack(pady=3)

        self.stat_labels = {}
        for i, c in enumerate("abcdefghijklmnopqrstuvwxyz"):
            lbl = tk.Label(
                self.stats_frame,
                text=c.upper(),
                width=2,
                height=1,
                font=("Helvetica", 10, "bold"),
                relief=tk.SOLID,
                borderwidth=1,
                bg="#e9ecef",
            )
            lbl.grid(row=0, column=i, padx=1, pady=1)
            self.stat_labels[c] = lbl

        filter_header = ttk.Label(main_frame, text="Huruf yang Perlu Diuji:", font=("Helvetica", 11, "bold"))
        filter_header.pack(pady=(8, 3))

        self.filter_frame = tk.Frame(main_frame)
        self.filter_frame.pack(pady=3)

        self.filter_labels = {}
        for i, c in enumerate("abcdefghijklmnopqrstuvwxyz"):
            lbl = tk.Label(
                self.filter_frame,
                text=c.upper(),
                width=2,
                height=1,
                font=("Helvetica", 10, "bold"),
                relief=tk.SOLID,
                borderwidth=1,
                bg="#e9ecef",
            )
            lbl.grid(row=0, column=i, padx=1, pady=1)
            self.filter_labels[c] = lbl

        self.filter_info = ttk.Label(main_frame, text="", font=("Helvetica", 9), foreground="#555")
        self.filter_info.pack(pady=(3, 0))

        self.root.bind("<Key>", self.handle_key_press)

    def handle_key_press(self, event):
        if event.char.isalpha() and len(event.char) == 1:
            self.add_letter(event.char.lower())
        elif event.keysym == "Return":
            self.submit_guess()
        elif event.keysym == "BackSpace":
            self.undo_letter()

    def update_current_row(self):
        for r in range(ROWS):
            if len(self.guesses[r]) < COLS:
                self.current_row = r
                self.current_col = len(self.guesses[r])
                return
        self.current_row = ROWS - 1
        self.current_col = COLS

    def add_letter(self, letter):
        self.update_current_row()
        if self.current_col >= COLS:
            return
        tile = self.tiles[self.current_row][self.current_col]
        tile.config(text=letter.upper())
        self.guesses[self.current_row] = self.get_row_word(self.current_row)
        self.current_col += 1

    def undo_letter(self):
        self.update_current_row()
        if self.current_col <= 0:
            return
        self.current_col -= 1
        tile = self.tiles[self.current_row][self.current_col]
        tile.config(text="")
        self.guesses[self.current_row] = self.get_row_word(self.current_row)

    def apply_mode_to_tile(self, row, col):
        mode = self.mode_var.get()
        self.tile_states[row][col] = mode

        tile = self.tiles[row][col]
        tile.config(bg=STATE_COLORS[mode], fg=STATE_TEXT_COLORS[mode])

        letter = tile.cget("text").lower()
        if letter:
            self.update_key_state(letter, mode)

        self.recalculate()

    def update_key_state(self, letter, state):
        priority = {"correct": 3, "present": 2, "absent": 1}
        current = self.key_states.get(letter)
        if not current or priority.get(state, 0) > priority.get(current, 0):
            self.key_states[letter] = state

        btn = self.keys.get(letter)
        if btn:
            btn.config(bg=STATE_COLORS[state], fg=STATE_TEXT_COLORS[state])

    def get_row_word(self, row):
        return "".join(self.tiles[row][c].cget("text").lower() for c in range(COLS))

    def submit_guess(self):
        if self.current_col < COLS:
            self.show_message("Masukkan 5 huruf terlebih dahulu!", "red")
            return

        guess = self.get_row_word(self.current_row)
        self.guesses[self.current_row] = guess

        if not self.words:
            self.show_message("Kamus tidak dimuat!", "red")
            return

        has_flags = any(self.tile_states[self.current_row][c] != "none" for c in range(COLS))
        if not has_flags:
            self.show_message("Klik tile untuk set flag (putih→hijau→kuning→abu)!", "red")
            return

        if all(self.tile_states[self.current_row][c] == "correct" for c in range(COLS)):
            self.show_message("Kata ditemukan!", "green")
            self.recalculate()
            return

        if self.current_row >= ROWS - 1:
            self.show_message("Semua baris terpakai.", "red")
            self.recalculate()
            return

        self.current_row += 1
        self.update_current_row()
        self.show_message(f"Baris {self.current_row + 1}: masukkan kata berikutnya", "blue")

    def recalculate(self):
        self.possible_words = self.words[:]

        for row in range(ROWS):
            guess = self.get_row_word(row)
            if len(guess) < COLS:
                continue

            correct_positions = {}
            present_letters = {}
            absent_letters = set()

            for i in range(COLS):
                letter = guess[i]
                state = self.tile_states[row][i]
                if state == "correct":
                    correct_positions[i] = letter
                elif state == "present":
                    present_letters.setdefault(letter, []).append(i)
                elif state == "absent":
                    absent_letters.add(letter)

            if not correct_positions and not present_letters and not absent_letters:
                continue

            new_possible = []
            for word in self.possible_words:
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
                    else:
                        correct_count = sum(1 for l in correct_positions.values() if l == letter)
                        present_count = len(present_letters.get(letter, []))
                        min_required = correct_count + present_count
                        if word.count(letter) < min_required:
                            valid = False
                            break
                if not valid:
                    continue

                new_possible.append(word)

            self.possible_words = new_possible

        self.update_letter_stats()
        self.update_filter_suggestions()
        self.update_recommendations()

    def update_recommendations(self):
        self.best_listbox.delete(0, tk.END)
        self.filter_listbox.delete(0, tk.END)

        if not self.possible_words:
            self.best_listbox.insert(tk.END, "Tidak ada kata yang cocok")
            self.filter_listbox.insert(tk.END, "Cek kembali flag Anda")
            self.count_label.config(text="")
            return

        used_letters = set()
        for row in range(ROWS):
            guess = self.get_row_word(row)
            for c in guess:
                used_letters.add(c)

        letter_freq = {}
        for word in self.possible_words:
            for c in set(word):
                letter_freq[c] = letter_freq.get(c, 0) + 1

        scored = []
        for word in self.possible_words:
            score = 0
            freq_score = 0
            new_letter_score = 0
            seen = set()
            for c in word:
                if c not in seen:
                    if self.key_states.get(c) in ("correct", "present"):
                        score += 10
                    elif self.key_states.get(c) is None:
                        score += 1
                    freq_score += letter_freq.get(c, 0)
                    if c not in used_letters:
                        new_letter_score += 1
                    seen.add(c)
            scored.append((word, score, freq_score, new_letter_score))

        scored.sort(key=lambda x: (-x[1], -x[2], x[0]))

        for word, *_ in scored[:50]:
            self.best_listbox.insert(tk.END, word.upper())

        correct_positions = {}
        for row in range(ROWS):
            guess = self.get_row_word(row)
            if len(guess) < COLS:
                continue
            for i in range(COLS):
                if self.tile_states[row][i] == "correct":
                    correct_positions[i] = guess[i]

        untested_freq = {}
        for word in self.possible_words:
            for c in set(word):
                if c not in used_letters:
                    untested_freq[c] = untested_freq.get(c, 0) + 1

        filter_candidates = []
        for word in self.words:
            match_correct = True
            for pos, letter in correct_positions.items():
                if word[pos] != letter:
                    match_correct = False
                    break
            if not match_correct:
                continue

            already_used = False
            for row in range(ROWS):
                guess = self.get_row_word(row)
                if word == guess:
                    already_used = True
                    break
            if already_used:
                continue

            eliminate_score = 0
            new_letters_in_word = set()
            for c in word:
                if c not in used_letters and c not in new_letters_in_word:
                    eliminate_score += untested_freq.get(c, 0)
                    new_letters_in_word.add(c)

            unique_untested = len(new_letters_in_word)
            if unique_untested > 0:
                filter_candidates.append((word, eliminate_score, unique_untested))

        filter_candidates.sort(key=lambda x: (-x[1], -x[2], x[0]))

        for word, elim_score, new_count in filter_candidates[:50]:
            self.filter_listbox.insert(tk.END, f"{word.upper()} (elim:{elim_score})")

        self.count_label.config(text=f"{len(scored)} kata sesuai filter | {len(filter_candidates)} kata uji huruf baru")

    def on_suggestion_select(self, event):
        self.update_current_row()
        for lb in [self.best_listbox, self.filter_listbox]:
            selection = lb.curselection()
            if selection:
                raw = lb.get(selection[0])
                word = raw.split()[0].lower()
                if self.current_col == 0:
                    for i in range(COLS):
                        self.tiles[self.current_row][i].config(text=word[i].upper())
                    self.current_col = COLS
                    self.guesses[self.current_row] = word
                break

    def update_letter_stats(self):
        for c in "abcdefghijklmnopqrstuvwxyz":
            lbl = self.stat_labels[c]
            state = self.key_states.get(c, None)
            if state == "correct" or state == "present":
                lbl.config(bg=STATE_COLORS["correct"], fg=STATE_TEXT_COLORS["correct"])
            elif state == "absent":
                lbl.config(bg=STATE_COLORS["absent"], fg=STATE_TEXT_COLORS["absent"])
            else:
                if self.possible_words:
                    freq = sum(1 for w in self.possible_words if c in w)
                    ratio = freq / len(self.possible_words)
                    if ratio > 0.4:
                        lbl.config(bg=STATE_COLORS["present"], fg=STATE_TEXT_COLORS["present"])
                    else:
                        lbl.config(bg="#e9ecef", fg="#000000")
                else:
                    lbl.config(bg="#e9ecef", fg="#000000")

    def update_filter_suggestions(self):
        used_letters = set()
        known_letters = set()
        absent_letters = set()

        for row in range(ROWS):
            guess = self.get_row_word(row)
            if len(guess) < COLS:
                continue
            for i, c in enumerate(guess):
                used_letters.add(c)
                state = self.tile_states[row][i]
                if state == "correct" or state == "present":
                    known_letters.add(c)
                elif state == "absent":
                    absent_letters.add(c)

        for c in "abcdefghijklmnopqrstuvwxyz":
            lbl = self.filter_labels[c]
            if c in known_letters:
                lbl.config(bg=STATE_COLORS["correct"], fg="white", text=c.upper())
            elif c in absent_letters:
                lbl.config(bg=STATE_COLORS["absent"], fg="white", text=c.upper())
            else:
                if self.possible_words:
                    freq = sum(1 for w in self.possible_words if c in w)
                    ratio = freq / len(self.possible_words)
                    if ratio > 0.5:
                        lbl.config(bg="#c9b458", fg="white", text=c.upper())
                    elif ratio > 0.2:
                        lbl.config(bg="#d3d6da", fg="#000", text=c.upper())
                    else:
                        lbl.config(bg="#e9ecef", fg="#aaa", text=c.upper())
                else:
                    lbl.config(bg="#e9ecef", fg="#aaa", text=c.upper())

        untested = [c for c in "abcdefghijklmnopqrstuvwxyz" if c not in used_letters]
        info_parts = []
        if untested:
            info_parts.append(f"Huruf belum diuji: {' '.join(untested[:13])}")
            if len(untested) > 13:
                info_parts.append(f"dan {len(untested) - 13} lainnya")

        present_in_word = [c for c in known_letters if self.key_states.get(c) == "present"]
        if present_in_word:
            info_parts.append(f"Perlu posisi tepat: {', '.join(sorted(present_in_word))}")

        self.filter_info.config(text=" | ".join(info_parts))

    def fill_template(self, row):
        word = self.template_words[row]
        for col_idx, letter in enumerate(word):
            self.tiles[row][col_idx].config(text=letter.upper(), bg=STATE_COLORS["absent"], fg=STATE_TEXT_COLORS["absent"])
            self.tile_states[row][col_idx] = "absent"
        self.guesses[row] = word
        self.template_buttons[row].config(bg=STATE_COLORS["absent"], fg="white")
        self.update_current_row()
        self.recalculate()

    def clear_board(self):
        self.current_row = 0
        self.current_col = 0
        self.tile_states = [["none"] * COLS for _ in range(ROWS)]
        self.key_states = {}
        self.possible_words = self.words[:]
        self.guesses = [""] * ROWS

        for r in range(ROWS):
            for c in range(COLS):
                self.tiles[r][c].config(text="", bg=STATE_COLORS["none"], fg=STATE_TEXT_COLORS["none"])

        for key, btn in self.keys.items():
            btn.config(bg="#f0f0f0", fg="#000000")

        for tbtn in self.template_buttons:
            tbtn.config(bg="#d3d6da")

        for c in "abcdefghijklmnopqrstuvwxyz":
            self.stat_labels[c].config(bg="#e9ecef", fg="#000000")
            self.filter_labels[c].config(bg="#e9ecef", fg="#000000")

        self.filter_info.config(text="")
        self.best_listbox.delete(0, tk.END)
        self.filter_listbox.delete(0, tk.END)
        self.count_label.config(text="")
        self.message_text.set("")

        self.update_recommendations()

    def reset_game(self):
        self.current_row = 0
        self.current_col = 0
        self.tile_states = [["none"] * COLS for _ in range(ROWS)]
        self.key_states = {}
        self.possible_words = self.words[:]
        self.guesses = [""] * ROWS

        for r in range(ROWS):
            for c in range(COLS):
                self.tiles[r][c].config(text="", bg=STATE_COLORS["none"], fg=STATE_TEXT_COLORS["none"])

        for key, btn in self.keys.items():
            btn.config(bg="#f0f0f0", fg="#000000")

        for tbtn in self.template_buttons:
            tbtn.config(bg="#d3d6da")

        for c in "abcdefghijklmnopqrstuvwxyz":
            self.stat_labels[c].config(bg="#e9ecef", fg="#000000")
            self.filter_labels[c].config(bg="#e9ecef", fg="#000000")

        self.filter_info.config(text="")

        self.best_listbox.delete(0, tk.END)
        self.filter_listbox.delete(0, tk.END)
        self.count_label.config(text="")
        self.message_text.set("")

        self.update_recommendations()

    def show_message(self, text, color):
        self.message_text.set(text)
        self.message_label.config(foreground=color)


if __name__ == "__main__":
    root = tk.Tk()
    app = WordleSolver(root)
    root.mainloop()
