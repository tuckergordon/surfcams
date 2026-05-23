#!/usr/bin/env bun
/**
 * Resolves the current live videoId for each cam and writes them to
 * src/lib/data/resolved-videos.json (gitignored). The build reads this file
 * and bakes the IDs into the static bundle.
 *
 * Strategy per cam:
 *   1. Fast path: if the previously-resolved videoId is still live, keep it.
 *      Channels with many concurrent live streams paginate the /streams page,
 *      so a full scan can miss our cam even when it's still broadcasting.
 *   2. Otherwise, scrape the channel's /streams page and pick the live video
 *      whose title contains `titleMatch` (case-insensitive substring).
 *   3. On any failure, preserve the previous resolved ID so the deployed site
 *      never breaks on a transient YouTube hiccup.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface StreamConfig {
	id: string;
	name: string;
	channelId: string;
	titleMatch?: string;
	seedVideoId?: string;
}

interface LiveVideo {
	videoId: string;
	title: string;
}

const DATA_DIR = join(import.meta.dir, '..', 'src', 'lib', 'data');
const CONFIG_PATH = join(DATA_DIR, 'streams.json');
const RESOLVED_PATH = join(DATA_DIR, 'resolved-videos.json');

const UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function isVideoLive(videoId: string): Promise<boolean> {
	const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
		headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }
	});
	if (!res.ok) return false;
	const html = await res.text();
	// isLive=true means actively broadcasting right now. isLiveContent alone can
	// be true for past streams that have ended.
	return /"isLive":true/.test(html);
}

async function fetchLiveVideos(channelId: string): Promise<LiveVideo[]> {
	const url = `https://www.youtube.com/channel/${channelId}/streams`;
	const res = await fetch(url, {
		headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
	const html = await res.text();

	const match = html.match(/var ytInitialData = (\{.+?\});<\/script>/s);
	if (!match) throw new Error('ytInitialData not found in page HTML');

	const data = JSON.parse(match[1]);
	const lockups: Record<string, unknown>[] = [];
	walk(data, (node) => {
		if (!node || typeof node !== 'object') return;
		const lv = (node as Record<string, unknown>).lockupViewModel as
			| Record<string, unknown>
			| undefined;
		if (lv) lockups.push(lv);
	});

	const live: LiveVideo[] = [];
	for (const lv of lockups) {
		if (!isLive(lv)) continue;
		const videoId = lv.contentId as string | undefined;
		const title = extractTitle(lv);
		if (videoId && title) live.push({ videoId, title });
	}
	return live;
}

function walk(node: unknown, visit: (n: unknown) => void) {
	visit(node);
	if (Array.isArray(node)) {
		for (const item of node) walk(item, visit);
	} else if (node && typeof node === 'object') {
		for (const v of Object.values(node)) walk(v, visit);
	}
}

function isLive(lv: Record<string, unknown>): boolean {
	const tvm = (lv.contentImage as Record<string, unknown> | undefined)?.thumbnailViewModel as
		| Record<string, unknown>
		| undefined;
	const overlays = tvm?.overlays as Array<Record<string, unknown>> | undefined;
	if (!overlays) return false;
	for (const o of overlays) {
		const bottom = o.thumbnailBottomOverlayViewModel as Record<string, unknown> | undefined;
		const badges = bottom?.badges as Array<Record<string, unknown>> | undefined;
		if (!badges) continue;
		for (const b of badges) {
			const tbv = b.thumbnailBadgeViewModel as Record<string, unknown> | undefined;
			const style = tbv?.badgeStyle as string | undefined;
			if (style && /_LIVE$/.test(style)) return true;
			if (tbv?.text === 'LIVE') return true;
		}
	}
	return false;
}

function extractTitle(lv: Record<string, unknown>): string | undefined {
	const meta = (lv.metadata as Record<string, unknown> | undefined)?.lockupMetadataViewModel as
		| Record<string, unknown>
		| undefined;
	const title = meta?.title as Record<string, unknown> | undefined;
	const content = title?.content;
	if (typeof content === 'string') return content;
	return undefined;
}

function pickVideo(live: LiveVideo[], titleMatch?: string): LiveVideo | undefined {
	if (live.length === 0) return undefined;
	if (live.length === 1) return live[0];
	if (titleMatch) {
		const needle = titleMatch.toLowerCase();
		const hit = live.find((v) => v.title.toLowerCase().includes(needle));
		if (hit) return hit;
	}
	return undefined;
}

async function resolve(
	stream: StreamConfig,
	prev: string | undefined
): Promise<{ videoId: string | null; log: string }> {
	const tag = `[${stream.id}]`;
	try {
		if (prev && (await isVideoLive(prev))) {
			return { videoId: prev, log: `${tag} unchanged (${prev}, still live)` };
		}
		const live = await fetchLiveVideos(stream.channelId);
		const pick = pickVideo(live, stream.titleMatch);
		if (!pick) {
			return {
				videoId: prev ?? null,
				log: `${tag} no match (${live.length} live found) — keeping ${prev ?? 'null'}`
			};
		}
		if (pick.videoId !== prev) {
			return {
				videoId: pick.videoId,
				log: `${tag} updated ${prev ?? 'null'} -> ${pick.videoId} ("${pick.title}")`
			};
		}
		return { videoId: pick.videoId, log: `${tag} unchanged (${pick.videoId})` };
	} catch (err) {
		return {
			videoId: prev ?? null,
			log: `${tag} error: ${(err as Error).message} — keeping ${prev ?? 'null'}`
		};
	}
}

async function main() {
	const config: StreamConfig[] = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
	const prev: Record<string, string> = existsSync(RESOLVED_PATH)
		? JSON.parse(readFileSync(RESOLVED_PATH, 'utf8'))
		: {};

	const results = await Promise.all(config.map((s) => resolve(s, prev[s.id] ?? s.seedVideoId)));

	const next: Record<string, string> = {};
	for (let i = 0; i < config.length; i++) {
		const { videoId, log } = results[i];
		console.log(log);
		if (videoId) next[config[i].id] = videoId;
	}

	writeFileSync(RESOLVED_PATH, JSON.stringify(next, null, '\t') + '\n');
}

await main();
