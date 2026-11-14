# kPortal

A static, space-themed launch page for kportal.net. It replaces the Homarr dashboard. It has no server, no login and no database, so there is nothing to attack. GitHub Pages serves plain files.

## What's here

| File | Purpose |
|---|---|
| `index.html` | The whole page: styles, starfield, search, status checks |
| `assets/logo.png` | The kPortal logo, copied from Homarr |
| `assets/space.jpg` | Background image (the Webb/Hubble image Homarr used, compressed from 30 MB to 650 KB) |
| `assets/icons/*.svg` | App icons, stored here so the page doesn't load anything from a CDN |
| `CNAME` | Tells GitHub Pages to serve this page at `kportal.net` |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Adding or changing an app

Copy one of the `<a class="card">` blocks in `index.html`, then change the `href`, `data-ping`, icon, name and host. More icons are at https://github.com/homarr-labs/dashboard-icons (download the `.svg` into `assets/icons/`).

## Deploy to GitHub Pages

1. Create a new repository on GitHub (for example `kportal`). It can be public or private, but Pages on a private repository needs a paid plan.
2. Push this folder to it:
   ```bash
   git init && git add . && git commit -m "kPortal static page"
   git branch -M main
   git remote add origin https://github.com/<you>/kportal.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**. Set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and save. The custom domain should fill in as `kportal.net` from the `CNAME` file.
4. In Cloudflare DNS for kportal.net:
   - Remove the Cloudflare Tunnel / proxy route that sends the bare `kportal.net` to Homarr. Leave the `request.`, `audiobooks.`, `calibreweb.` and `mc.` routes alone.
   - Add `A` records for `kportal.net` pointing at GitHub: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Add a `CNAME` record for `www` pointing to `<you>.github.io` (right now `www` returns a 404).
   - At first, set these records to **DNS only** (grey cloud) so GitHub can issue the HTTPS certificate. When it's issued, turn the orange cloud back on if you like and set SSL mode to *Full*.
5. Back in **Settings → Pages**, tick **Enforce HTTPS** once it's available.
6. When the new page is live, stop the Homarr container so it's no longer reachable.

## Notes

- **Status dots:** each app gets a quick request from the visitor's browser. Green means the host answered and red means it didn't. Browsers don't let a static page read another site's response, so this shows whether a host is reachable, not a full health check.
- **Minecraft status:** this uses the public `api.mcsrvstat.us` service. Clicking the card copies `mc.kportal.net` to the clipboard.
- **Content-Security-Policy:** the page can only load its own files and talk to `*.kportal.net` and the Minecraft status API.
- **Shortcuts:** `/` jumps to search, `Enter` opens the first match and `Esc` clears the search.
