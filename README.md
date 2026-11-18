# Pixvael

Pixvael is a browser based pixel art and Minecraft image tool site built with Next.js 16. Its image processing runs in the browser; the site can be exported as static files and hosted on Cloudflare Pages.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000> while the development server is running.

## Checks and production build

```bash
npm run check
npm run build
```

The build exports the site to `out/`. Generated pages include the site's metadata, sitemap, robots rules, and web app manifest. Files under `public/`, including the service worker, fonts, and images, are copied into the export.

To preview the static export locally with Cloudflare Pages behavior, run:

```bash
npm run preview
```

This builds the site and starts `wrangler pages dev ./out`. `npm start` is not provided because the static export has no Next.js server to run.

## Cloudflare Pages

Deployment status (2026-10-20): the primary site was deployed by manual direct upload to <https://pixvael-bi7.pages.dev>. Production domains `pixvael.com` and `www.pixvael.com` point to this project through verified proxied CNAME records. HTTPS has been verified at the Cloudflare edge for both domains; Pages certificate validation may still show pending during propagation. The firstdraft copy at <https://pixvael.pages.dev> is retained as a backup.

The repository's `wrangler.jsonc` configures Pages project `pixvael` with `out/` as its build output. Pages does not support `account_id` in this config. The `deploy` script fixes the production target using `CLOUDFLARE_ACCOUNT_ID=348735f3451f76b0c9b4d551fa6f0bfc`, the account owned by `123387447@qq.com` that holds the active `pixvael.com` zone. Project `pixvael` has been created in this account at <https://pixvael-bi7.pages.dev>. Before deploying, authenticate Wrangler as `123387447@qq.com`. Install dependencies and deploy the production branch with:

```bash
npm run deploy
```

This runs the production build and then invokes `wrangler pages deploy ./out --project-name pixvael --branch main` through `npx` with the QQ account environment variable above. With Wrangler 4.151.0, `--force` is used only for Pages project creation, not deployment. `public/_headers` carries the site's security headers into the static deployment and sets cache policy for the service worker and versioned Next.js assets.

The existing copy at <https://pixvael.pages.dev> in account `81bd3096d693d39b65e49832c357c315` (`firstdraft.ai.app@gmail.com`) is retained. To update that separate copy, authenticate Wrangler as `firstdraft.ai.app@gmail.com`, build the site, and run the following explicit account command instead of `npm run deploy`:

```bash
CLOUDFLARE_ACCOUNT_ID=81bd3096d693d39b65e49832c357c315 npx wrangler pages deploy ./out --project-name pixvael --branch main
```

The static export is intended for Pages static hosting. It does not run a Next.js server or provide runtime API routes.
