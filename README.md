# Maine Surf Cams

A small site with all the Maine surf cams I use in one, easy to check spot.

Live at **https://tuckergordon.github.io/surfcams/**.

## Why this exists

Most of these cams are YouTube live streams run by other people. They go down, get replaced with a new live broadcast on the same channel (new `videoId`), or change names. Keeping the embeds working used to mean manually checking each channel - this repo automates that away.

## How it stays up to date

Each cam in [`src/lib/data/streams.json`](src/lib/data/streams.json) has a `channelId` and a `titleMatch` — config only, no live state. A GitHub Actions cron runs every hour and:

1. For each cam, checks whether the previously-resolved `videoId` is still actively broadcasting — if so, nothing to do.
2. Otherwise, scrapes the channel's `/streams` page and picks the currently-live video whose title contains `titleMatch`.
3. Writes resolved IDs to `src/lib/data/resolved-videos.json` (gitignored), rebuilds the site, and deploys to GitHub Pages.

Because resolved IDs aren't committed, the repo stays free of churn — the build is the source of truth for what's currently live, not any file in git.

No API key, no quota, no server, no cost. The build is fully static.

See [`scripts/update-streams.ts`](scripts/update-streams.ts) and [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

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

Push to `main` and the workflow does the rest.

## Local development

```sh
bun install
bun run dev
```

Runs the SvelteKit dev server with no base path (so URLs look like `/`, not `/surfcams/`). `dev` and `build` both invoke the updater first, so videoIds are always fresh.

To run just the updater:

```sh
bun run update-streams
```

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
