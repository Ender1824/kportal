# Kportal

The launch page for the apps hosted on Kportal, served at https://www.kportal.net by GitHub Pages. It's plain HTML, CSS and JavaScript, with no server, login, database or build step. Nothing loads from other websites, except the Minecraft status check.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure: header, app tiles, Minecraft card, footer |
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
2. In `index.html`, copy one `<li>…</li>` block inside `<ul class="apps">` and change:
   - `href` and `data-ping`: the app's address, e.g. `https://photos.kportal.net/`
   - `data-key`: the next free number key
   - the icon `src` and the name
3. With 4 or more apps, change `repeat(3, …)` under `.apps` in `styles.css` to the number of columns you want. Also update the shortcut hint in the footer and the Minecraft button's `data-key`.
4. Commit and push. GitHub Pages updates within about a minute.

## How things work

- **Status pills:** every 60 seconds while the tab is open, the visitor's browser sends each app a quick request. Any reply shows **Online**; an error or no reply within 6 seconds shows **Offline**. Browsers don't let a static page read another site's response, so this shows whether a site is reachable, not a full health check.
- **Minecraft:** player counts come from the public `api.mcsrvstat.us` service. **Copy address** copies `mc.kportal.net`.
- **Shortcuts:** `1`–`3` open the apps and `4` copies the server address.
- **Security:** the Content-Security-Policy in `index.html` only lets the page load its own files and contact `*.kportal.net` and the Minecraft status service. It allows no inline scripts or styles.
- **Motion:** with "Reduce motion" turned on in the device settings, the page is completely still.

## Testing locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
