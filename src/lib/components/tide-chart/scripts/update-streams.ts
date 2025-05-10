/// <reference types='node' />
import streams from '../../../../assets/streams.json' with { type: 'json' };
import { youtube_v3 } from 'googleapis';
import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';

interface Stream {
  name: string;
  channel_id: string;
  id: string;
  videoId?: string | null;
}

dotenv.config();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('VITE_YOUTUBE_API_KEY is not set in environment variables');
  process.exit(1);
}

async function updateLiveStreamEmbed(
  name: string,
  channelId: string
): Promise<string | null> {
  const keyword = name.toLowerCase().replace(/ /g, '+');
  const apiUrl = new URL(
    'https://www.googleapis.com/youtube/v3/search?' +
      'part=snippet&' +
      `channelId=${channelId}&` +
      'eventType=live&' +
      'type=video&' +
      `q=${keyword}&` +
      `key=${YOUTUBE_API_KEY}`
  );

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data =
      (await response.json()) as youtube_v3.Schema$SearchListResponse;
    const videoId = data.items?.[0]?.id?.videoId;
    return videoId || null;
  } catch (error) {
    console.error(
      `Error fetching data for ${name}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

const updatedStreams = await Promise.all(
  streams.map(async (stream: Stream) => {
    const videoId = await updateLiveStreamEmbed(stream.name, stream.channel_id);
    return {
      ...stream,
      videoId,
    };
  })
);

await writeFile(new URL('../../../../assets/streams.json', import.meta.url), JSON.stringify(updatedStreams, null, 2));

