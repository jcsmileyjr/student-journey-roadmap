# Aesthetics Updates

Ideas for increasing the visual enjoyment of the Your Journey roadmap. Some items touch things the original build prompt listed as out of scope (images, animations beyond the chevron, a progress bar, dark mode). Those are marked **(out of scope)** so adopting them is a deliberate choice.

## Summary

### Aesthetics
- **Typography:** Bolder, larger banner title and more space between cards. System fonts stay, so no external fonts.
- **Banner:** A subtle navy gradient or faint pattern (such as a dotted grid) instead of flat navy. Optionally a large step-number watermark behind the title.
- **Depth:** A softer shadow on all cards, with a slight lift on hover.
- **Timeline line:** Color the completed stretch navy and the upcoming stretch gray, so the line itself shows progress. CSS only, and not a progress bar.
- **Phase blocks:** A small label or colored left edge per phase so the five phases read as chapters, using the teal and gold accents.
- **Current step:** A soft gold glow or gentle pulse on its marker, with a reduced-motion fallback. **(animation: out of scope)**

### Imagery
- **Icons per step or phase:** Simple inline SVG or emoji icons (slide, rocket, certificate, palette, database, briefcase). Decorative icons are `aria-hidden`; any `<img>` needs a descriptive `alt`. **(images: out of scope)**
- **Brand phase visuals:** A small color-swatch strip or logo placeholder.
- **Example work thumbnails:** A thumbnail beside the "See an example" link, only after a student has given explicit consent.
- **Hero illustration:** A simple road or path graphic in the banner with a flag at the end, supporting the "see the finish" goal.

### User experience
- **Phase-grouped navigation:** A small sticky bar showing the five phases with the current one highlighted.
- **"Jump to you are here" button:** Especially useful on long mobile scrolls.
- **Expand and collapse all.**
- **Smooth open and close for panels:** Panels currently show and hide instantly. **(animation: out of scope)**
- **Keyboard shortcuts:** Arrow keys move between cards.
- **Friendly counts:** A text line such as "8 of 16 steps done" in the banner. It is text, not a progress bar.
- **Per-student check-offs:** Saved in `localStorage` for personal progress. This changes the instructor-owned progress model, so decide it on purpose. **(persistence: out of scope)**

### Wow factor
- **Scroll-reveal:** Cards fade up as they enter the viewport (`IntersectionObserver`), with a reduced-motion fallback. **(animation: out of scope)**
- **Celebration when advancing:** A brief confetti burst or checkmark pop when the step dropdown completes a step. **(animation: out of scope)**
- **Milestone messages:** Short encouraging lines at the halfway point and when entering the hardest step (the Supabase step), supporting the persevere goal.
- **Finish line graphic:** A flag or trophy at the bottom that lights up as the student gets closer.
- **Dark mode toggle:** Visually striking. **(out of scope)**

## Plan

Phases are grouped so each can be built and checked together. Every animated item must honor `prefers-reduced-motion`, and the code should stay small enough for a beginner to read in one sitting.

### Phase 1: CSS polish (no JavaScript, no new content)
Low risk, high visual payoff.
- Typography and spacing pass.
- Banner gradient or pattern.
- Card shadows and hover lift.
- Two-tone timeline line (navy for completed, gray for upcoming).
- Phase block accents (colored left edge or label).

### Phase 2: Icons and imagery
Adds visual identity to steps and phases.
- Per-step and per-phase icons (inline SVG or emoji, `aria-hidden`).
- Brand phase swatch strip or logo placeholder.
- Hero road/path graphic in the banner.
- Example-work thumbnails, only once consent exists.

### Phase 3: Motivation and orientation
Directly serves the mid-course focus goal.
- "X of 16 steps done" line in the banner.
- Milestone messages (halfway point, entering the Supabase step).
- "Jump to you are here" button.
- Expand and collapse all.

### Phase 4: Motion
Small, tasteful animation, all with reduced-motion fallbacks.
- Gentle glow or pulse on the current step's marker.
- Smooth panel open and close.
- Scroll-reveal for cards.

### Phase 5: Wow features (build last, once content is final)
Heavier items.
- Celebration when advancing a step with the dropdown.
- Finish line graphic that lights up near the end.
- Sticky phase navigation bar.
- Keyboard arrow-key navigation between cards.

### Deferred (decide deliberately)
- Per-student check-offs in `localStorage`: changes the instructor-owned progress model.
- Dark mode toggle: out of scope in the original prompt.
