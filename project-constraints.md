# Life Dashboard: project constraints

A small To-Do List Life Dashboard. It shows the time and a greeting, a 25-minute focus timer, a task list, and quick links.

## Technical constraints
- HTML for structure, CSS for styling, vanilla JavaScript only (no frameworks).
- No backend. All data is stored client-side with the browser Local Storage API.
- Must work in modern browsers (Chrome, Firefox, Edge, Safari).

## Folder rules
- `index.html` at the root.
- Exactly one CSS file in `css/` (`style.css`).
- Exactly one JavaScript file in `js/` (`script.js`).
- Keep the code clean and readable. No test setup.

## Required features
- Greeting: current time, date, and a greeting based on the time of day.
- Focus timer: 25 minutes with Start, Stop, and Reset.
- To-do list: add, edit, mark done, delete, saved in Local Storage.
- Quick links: buttons that open favorite sites, saved in Local Storage.

## Chosen challenges
1. Light / dark mode
2. Custom name in the greeting
3. Prevent duplicate tasks

## Code conventions
- Build DOM with `textContent` and `createElement`, never `innerHTML` with user input.
- Only allow `http` and `https` addresses in quick links.
- Wrap Local Storage access in `try/catch`.
