import streamsJson from './streams.json' with { type: 'json' };

export interface Stream {
	id: string;
	name: string;
	channelId: string;
	titleMatch?: string;
	// Manual fallback for channels with so many concurrent live streams that
	// YouTube's /streams page paginates past our cam. Used to bootstrap the
	// updater's "is current video still live?" fast path.
	seedVideoId?: string;
}

export const streams: Stream[] = streamsJson;

// Resolved videoIds live on the `data` branch and are refreshed hourly by
// .github/workflows/update-data.yml. Fetched at runtime so updates don't
// require a rebuild.
//
// In dev, fetch the local copy at /resolved-videos.json (written by
// `bun run update-streams` into static/). In production, fetch from the
// data branch on GitHub.
export const RESOLVED_URL = import.meta.env.DEV
	? '/resolved-videos.json'
	: 'https://raw.githubusercontent.com/tuckergordon/surfcams/data/resolved-videos.json';
