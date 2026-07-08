# Product Requirements Document (PRD): NOTES ON WEB

## 1. Project Overview
**Name:** NOTES ON WEB
**Description:** A sophisticated, interactive web application acting as a digital storefront/experience for a premium tea brand ("NOTES ON").
**Design Aesthetic:** High-end, precise, monochromatic with strategic color highlights (Brand Orange: `#FF4000`). Focuses on geometric layouts, dynamic connection lines, and a minimalist, slightly brutalist interface.

## 2. Core Features & Components

### 2.1 Calendar Interface
- **Purpose:** Displays monthly events and daily tea recommendations.
- **Functionality:** 
  - Dynamic generation of days based on the current month/year.
  - Interactive `.week-box` elements that reveal daily details on hover/click.
  - Syncs with the right-side event details panel to display specific events.

### 2.2 Floating Video Player (`#floating-vid-player`)
- **Purpose:** Plays featured art films associated with the brand.
- **Features:**
  - Draggable interface via a custom drag handle.
  - Video play/pause toggle by clicking the screen (with an animated SVG icon).
  - Timecode box and dynamic progress bar (`.vid-progress-fill`) exactly centered horizontally between the timecode and right corner mark (`bot_mark`).
  - Animated data-processing dots (blinking randomly).
  - Connection lines (`<svg>`) linking the player's corners to the viewport corners.

### 2.3 Interactive Product Cards
- **Portrait Card (`.main-product-card[data-line-prefix="prod"]`)**
  - Displays featured seasonal tea.
  - Draggable anywhere on the screen.
  - Connected to screen corners via dotted SVG lines that turn solid (`stroke-dasharray: 0`) when interacted with.
- **Landscape Card (`.landscape-card[data-line-prefix="land"]`)**
  - Similar draggable behavior but with a 4:3 landscape ratio.
  - Images are scaled (`140%`) and cropped to hide baked-in PNG borders.
  - Uses its own independent SVG connection lines (`land-line-*`) that activate correctly upon drag.

### 2.4 Dynamic Label Overlay
- **Purpose:** Follows the mouse cursor with an orange highlight block.
- **UI Details:** 
  - Tracks cursor movement instantly.
  - Orange block (`mix-blend-mode: overlay`, `opacity: 0.9`) positioned exactly above a sleek info text box.
  - Horizontal offset of `-48px`.
  - Vertical offset calculated to sit exactly 20% above the bottom edge of hovered product cards.

## 3. Technical Stack
- **HTML5:** Semantic structure, unified into `index.html` (acts as an SPA).
- **CSS3:** Vanilla CSS (`index.css`), utilizing flexbox, grid, absolute positioning, CSS variables, and backdrop-filters (blur).
- **JavaScript Architecture:**
  - Safely modularized into functional scopes without using ES6 modules (to maintain `file://` compatibility).
  - `initCustomCursor()`
  - `initCalendar()`
  - `initVideoPlayer()`
  - `initProductCards()`
  - `initGsapPhysics()`
  - `initDynamicLabels()`

## 4. Current Work & Status
- **Recent Fixes & Refactoring:**
  - Migrated data persistence from local browser `localStorage` to **Firebase Cloud (Firestore for data, Firebase Storage for images)** to resolve storage quota limits and enable cross-device syncing.
  - Safely isolated 1200+ lines of monolithic JavaScript into independent `init*()` functions to ensure future code stability.
  - Re-aligned video player progress bar perfectly between timecode and bot mark (12px gap on both sides).
  - Zoomed landscape product images to 140% to completely hide baked-in black borders.
- **Backup Protocol:**
  - Automated `./backup.sh` scripts keep the 3 latest snapshots inside `_BACKUPS/002_NOTES_ON/`.

*Document automatically updated by AI Agent based on project progress.*

### 2.5 Admin Dashboard (`admin.html`)
- **Purpose:** A local content management system (CMS) to dynamically edit the landing page without altering HTML.
- **Features:**
  - Cloud State management via `dataStore.js` connected to **Firebase Firestore**.
  - Image uploads processed and stored in **Firebase Storage** instead of Base64 strings to prevent quota limits.
  - Form UI matching the brand's aesthetic.
  - Dynamic mapping of 'Tea of the Month', Calendar, Video Player, and Product Cards into `index.html`.

