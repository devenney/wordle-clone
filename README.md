# Wordle Clone

## Feature Checklist

## 🧩 Wordle Clone — Feature Progress Tracker

### ✅ Game Logic & Core Functionality

- [x] 6x5 grid layout generated from state
- [x] Guesses tracked using React state
- [x] Keyboard input (letters, Backspace, Enter)
- [x] Advance to next row on valid guess
- [x] Evaluate guess against solution (green/yellow/gray logic)
- [x] Detect win condition (guess === word)
- [x] Detect loss condition (no guesses left)
- [x] Prevent input after game ends
- [x] Prevent duplicate guesses
- [x] Validate guess is a real word

### 🎨 Visual Output & Feedback

- [x] Color tiles based on match evaluation
- [ ] Animate tile reveal on Enter
- [ ] Highlight active row visually
- [x] Display win/loss result message

### ⌨️ Input UX & Keyboard State

- [x] Physical keyboard input updates guesses
- [x] On-screen keyboard with clickable keys
- [x] Color key states (green/yellow/gray)
- [x] Disable typing after game ends

### 📦 Word Data & Game Content

- [x] Load word from mock fetch on mount
- [x] Use dynamic solution (with backend or such)
- [x] Rotate word (seeded by date/time)
- [ ] Optional hard mode (reuse hint letters)
- [ ] 2-pass evaluation strategy

### 🌱 Extras & Stretch Goals

- [ ] Dark mode toggle
- [ ] Share result as emoji grid (🟩🟨⬜)
- [ ] Streak tracker or stats
- [ ] Title screen or intro animation
