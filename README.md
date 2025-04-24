# Wordle Clone

## Feature Checklist

## 🧩 Wordle Clone — Feature Progress Tracker

### ✅ Game Logic & Core Functionality

- [x] 6x5 grid layout generated from state
- [x] Guesses tracked using React state
- [x] Keyboard input (letters, Backspace, Enter)
- [x] Advance to next row on valid guess
- [x] Evaluate guess against solution (green/yellow/gray logic)
- [ ] Detect win condition (guess === word)
- [ ] Detect loss condition (no guesses left)
- [ ] Prevent input after game ends
- [ ] Restart or reset game after win/loss
- [ ] Prevent duplicate guesses
- [ ] Validate guess is a real word

### 🎨 Visual Output & Feedback

- [x] Color tiles based on match evaluation
- [ ] Animate tile reveal on Enter
- [ ] Highlight active row visually
- [ ] Display win/loss result message

### ⌨️ Input UX & Keyboard State

- [x] Physical keyboard input updates guesses
- [ ] On-screen keyboard with clickable keys
- [ ] Color key states (green/yellow/gray)
- [ ] Disable typing after game ends

### 📦 Word Data & Game Content

- [x] Load word from mock fetch on mount
- [ ] Use dynamic solution (with backend or such)
- [ ] Rotate word (seeded by date/time)
- [ ] Optional hard mode (reuse hint letters)

### 🌱 Extras & Stretch Goals

- [ ] Dark mode toggle
- [ ] Share result as emoji grid (🟩🟨⬜)
- [ ] Streak tracker or stats
- [ ] Title screen or intro animation
