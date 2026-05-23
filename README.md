# Maine Surf Cams

A small site with all the Maine surf cams I use in one, easy to check spot.

Live at **https://tuckergordon.github.io/surfcams/**.

## Why this exists

Most of these cams are YouTube live streams run by other people. They go down, get replaced with a new live broadcast on the same channel (new `videoId`), or change names. Keeping the embeds working used to mean manually checking each channel - this repo automates that away.

## How it stays up to date

Each cam in [`src/lib/data/streams.json`](src/lib/data/streams.json) has a `channelId` and a `titleMatch` — config only, no live state. Resolved videoIds live on a separate `data` branch (just `resolved-videos.json`, nothing else) that's updated independently of the deployed site.

**The cron** ([`.github/workflows/update-data.yml`](.github/workflows/update-data.yml)) runs hourly:

1. For each cam, checks whether the previously-resolved `videoId` is still actively broadcasting — if so, nothing to do.
2. Otherwise, scrapes the channel's `/streams` page and picks the currently-live video whose title contains `titleMatch`.
3. Commits the updated `resolved-videos.json` to the `data` branch.

**The deploy** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) only runs on push to `main` — i.e. when actual code changes. It builds the static site and ships it to GitHub Pages.

**The page** fetches `resolved-videos.json` from the `data` branch at load time and renders the iframes. This means hourly updates never touch the site bundle, the cron has a tiny failure surface (just a fetch + git commit), and the `data` branch's git log doubles as a chronological record of every cam swap.

No API key, no quota, no server, no cost.

## Adding or changing a cam

Edit [`src/lib/data/streams.json`](src/lib/data/streams.json):

```json
{
	"id": "kebab-case-id",
	"name": "Display Name",
	"channelId": "UC...",
	"titleMatch": "substring of the live broadcast title",
	"seedVideoId": "optional-fallback-id"
}
```

- `channelId` is the YouTube channel ID (`UC...`), not the handle.
- `titleMatch` should be specific enough to disambiguate when a channel has multiple concurrent live streams. Case-insensitive substring match.
- `seedVideoId` is optional. YouTube's `/streams` page paginates, so on channels with dozens of concurrent broadcasts, the scrape may miss the right cam. If you know the current videoId, drop it here and the updater will use it to bootstrap its fast-path live check.

Push to `main` and the deploy workflow rebuilds the site. The next hourly cron run will resolve the new cam's `videoId` and write it to the `data` branch.

## Local development

```sh
bun install
bun run update-streams   # writes static/resolved-videos.json (gitignored)
bun run dev
```

In dev, the page fetches `/resolved-videos.json` from `static/` instead of the live `data` branch — so you can test against fresh IDs without ever touching GitHub. The updater step only needs to be re-run when you want fresh data.

If you skip `update-streams`, all cams render as offline (no file to fetch from).

To preview a production build:

```sh
bun run build
bun run preview
```

## Stack

- [SvelteKit](https://svelte.dev/docs/kit/introduction) (Svelte 5, runes mode)
- `@sveltejs/adapter-static` for prerendered output
- Tailwind v4
- [Bun](https://bun.com/) for installs and running the updater script
- Hosted on GitHub Pages, deployed via GitHub Actions
