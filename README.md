# Block Academy — Minecraft Tutorials Store

A static website to showcase Minecraft PVP and skygen tutorials. **Place order** sends the cart to a **Discord webhook** (what they ordered, who, when). **Login and signup** work in the browser (accounts stored locally). Ready to host on **GitHub Pages**.

## What's included

- **index.html** — Hero, PVP/skygen product cards, cart drawer, login/signup modal
- **styles.css** — Dark theme, auth modal, responsive layout
- **script.js** — Login/signup (hashed passwords in localStorage), cart, Discord webhook on “Place order”

## Discord webhook (required for orders)

1. In Discord: **Server → Channel → Edit channel → Integrations → Webhooks → New webhook**. Copy the webhook URL.
2. In **script.js**, set the URL at the top:
   ```js
   var DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/...';
   ```
3. When a logged-in user clicks **Place order**, the site sends one message to that webhook with: items, total, username, and timestamp.

## Login and signup

- **Sign up:** Users create an account (username + password). Passwords are hashed (SHA-256) before being stored in `localStorage`.
- **Log in:** Same username/password; session is stored until they log out.
- **Place order:** Only available when logged in. The order is sent to Discord with the logged-in username.

Accounts are stored only in the browser (no server). For production you’d typically use a real backend or auth provider.

## Run locally

Open `index.html` in a browser, or:

```bash
python -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy to GitHub

1. Create a new repo, then in the project folder:
   ```bash
   cd minecraft-tutorials
   git init
   git add index.html styles.css script.js README.md
   git commit -m "Initial commit: Block Academy store"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. **Settings → Pages →** Deploy from branch `main`, folder `/ (root)`.
3. **Important:** After deploying, edit `script.js` on GitHub to add your `DISCORD_WEBHOOK_URL`, then commit. (The URL will be visible in the repo; use a private repo or a server-side proxy if you need to hide it.)

Not affiliated with Mojang.
