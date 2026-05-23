import streamsJson from './streams.json' with { type: 'json' };

export interface Stream {
	id: string;
	name: string;
	channelId: string;
	videoId: string | null;
}

export const streams: Stream[] = streamsJson;
