# Kportal

The launch page for the apps hosted on Kportal, served at https://www.kportal.net by GitHub Pages. It's plain HTML, CSS and JavaScript, with no server, login, database or build step. Nothing loads from other websites, except the Minecraft status check.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure: status summary, orbit hero, app groups (Watch, Listen & read, Play), footer |
| `styles.css` | All styling. Colors are CSS variables at the top of the file |
| `app.js` | Clock, status checks, Minecraft status, copy button, keyboard shortcuts, starfield |
| `assets/logo.png` | Original logo (used as the favicon and phone home-screen icon) |
| `assets/logo-light.png` | Logo recolored with light outlines for the dark page |
| `assets/space.jpg` | Background for wide screens |
| `assets/space-mobile.jpg` | Smaller background for phones |
| `assets/icons/*.svg` | App icons |
| `CNAME`, `.nojekyll` | GitHub Pages settings for the custom domain. Don't change these |

## Adding an app

1. Download an icon `.svg` from https://github.com/homarr-labs/dashboard-icons into `assets/icons/`.
2. In `index.html`, copy one `<li>…</li>` card inside the group it belongs to (each group is a `<ul class="cards">`), or copy a whole `<section class="group">` to start a new group. Then change:
   - `href` and `data-ping`: the app's address, e.g. `https://photos.kportal.net/`
   - `data-name`, the `card-name` text and the `card-desc` one-line description
   - `data-key`: the next free number key
   - the icon `src`
3. Give the card an accent colour: add a class like `card-photos` and, in `styles.css` next to `.card-plex`, add `.card-photos { --accent: R, G, B; }`.
4. Renumber the footer shortcut hint and the Minecraft button's `data-key`.
5. Commit and push. GitHub Pages updates within about a minute.

## How things work

- **Status pills:** every 60 seconds while the tab is open, the visitor's browser sends each app a quick request. Any reply shows **Online**; an error or no reply within 6 seconds shows **Offline**. Browsers don't let a static page read another site's response, so this shows whether a site is reachable, not a full health check.
- **Summary pill (top left):** shows "All services online", or names whatever is down, e.g. "Minecraft is offline".
- **Minecraft:** player counts and the game version come from the public `api.mcsrvstat.us` service. **Copy address** copies `mc.kportal.net`.
- **Shortcuts:** `1`–`4` open the apps and `5` copies the server address.
- **Plex:** links to `https://app.plex.tv/`, where friends sign in with their own Plex account and see the libraries shared with them. It shows "app.plex.tv" instead of a status, because your Plex server is not at a kportal.net address the page can check.
- **Security:** the Content-Security-Policy in `index.html` only lets the page load its own files and contact `*.kportal.net` and the Minecraft status service. It allows no inline scripts or styles.
- **Motion:** with "Reduce motion" turned on in the device settings, the page is completely still.

## Testing locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
