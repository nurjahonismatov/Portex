# Portex — Personal Profile & Resume Builder

A complete, modern, responsive personal profile and resume builder website built with pure HTML, CSS, and Vanilla JavaScript.

## Features

- **Dashboard** — Profile completion, stats, and quick access
- **My Profile** — Personal information with photo upload
- **Education** — Multiple education records with timeline
- **Achievements** — Achievements with optional certificate images
- **Skills & Languages** — Skills and language proficiency levels
- **Experience** — Professional experience with "currently working" option
- **My Resume** — Live preview with Modern & Classic templates + PDF download
- **Settings** — Language (Uzbek / Russian / English), Theme (Light / Dark / System), Data export/import/clear

## Technology

- HTML5
- CSS3 (custom properties, responsive, themes)
- Vanilla JavaScript (ES6+)
- Lucide Icons
- jsPDF + html2canvas for PDF generation
- localStorage for data persistence

No frameworks (React, Vue, Angular, Tailwind, etc.).

## How to Run

### Option 1: Simple local server (recommended)

```bash
# Using Python 3
cd Portex
python -m http.server 8080

# Or using Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

### Option 2: Open directly

You can open `index.html` directly in a modern browser.  
Note: Some browsers restrict `fetch` for local files — using a local server is more reliable for loading language files.

## Data Storage

All data is stored in the browser's **localStorage**.  
This is a frontend-only application — no backend or cloud database.

- Export backup as JSON
- Import backup from JSON
- Clear all data (with confirmation)

## Languages

Interface fully supports:

- **English** (en)
- **O'zbek** (uz)
- **Русский** (ru)

Language preference is saved and restored on next visit.

## Themes

- Light Mode
- Dark Mode
- System (follows OS preference)

## Project Structure

```
Portex/
├── index.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   ├── themes.css
│   └── animations.css
├── js/
│   ├── app.js
│   ├── navigation.js
│   ├── storage.js
│   ├── dashboard.js
│   ├── profile.js
│   ├── education.js
│   ├── achievements.js
│   ├── skills.js
│   ├── experience.js
│   ├── resume.js
│   ├── settings.js
│   ├── language.js
│   ├── theme.js
│   ├── export.js
│   └── validation.js
├── locales/
│   ├── en.json
│   ├── uz.json
│   └── ru.json
├── assets/
│   ├── images/
│   └── icons/
└── README.md
```

## Browser Support

Modern browsers: Chrome, Firefox, Safari, Edge (latest versions).

## License

Free to use for personal and educational purposes.
