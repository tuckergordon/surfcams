import streamsJson from './streams.json' with { type: 'json' };

export interface StreamConfig {
	id: string;
	name: string;
	channelId: string;
	titleMatch?: string;
	// Manual fallback for channels with so many concurrent live streams that
	// YouTube's /streams page paginates past our cam. Used to bootstrap the
	// updater's "is current video still live?" fast path.
	seedVideoId?: string;
}

export interface Stream extends StreamConfig {
	videoId: string | null;
}

// Resolved videoIds are written by scripts/update-streams.ts and are gitignored.
// Use import.meta.glob so a missing file doesn't break the build — cams just
// render as offline until the updater runs.
const resolvedModules = import.meta.glob<{ default: Record<string, string> }>(
	'./resolved-videos.json',
	{ eager: true }
);
const resolved = Object.values(resolvedModules)[0]?.default ?? {};

const config: StreamConfig[] = streamsJson;

export const streams: Stream[] = config.map((s) => ({
	...s,
	videoId: resolved[s.id] ?? null
}));
