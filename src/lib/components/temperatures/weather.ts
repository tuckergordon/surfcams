export interface CurrentWeather {
	code: number;
	isDay: boolean;
}

const URL =
	'https://api.open-meteo.com/v1/forecast' +
	'?latitude=43.6581&longitude=-70.2442' +
	'&current=weather_code,is_day';

export async function fetchCurrentWeather(): Promise<CurrentWeather | null> {
	const response = await fetch(URL);
	if (!response.ok) {
		throw new Error(`Weather fetch failed: ${response.status}`);
	}
	const json = (await response.json()) as {
		current?: { weather_code?: number; is_day?: number };
	};
	const current = json.current;
	if (!current || typeof current.weather_code !== 'number') return null;
	return { code: current.weather_code, isDay: current.is_day === 1 };
}

// Reference new moon: 2000-01-06 18:14 UTC (Julian date 2451550.1).
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
const SYNODIC_MONTH_MS = 29.530588853 * 24 * 60 * 60 * 1000;

export function moonPhaseEmoji(now: Date = new Date()): string {
	const elapsed = now.getTime() - REFERENCE_NEW_MOON_MS;
	const phase =
		((((elapsed % SYNODIC_MONTH_MS) + SYNODIC_MONTH_MS) % SYNODIC_MONTH_MS) / SYNODIC_MONTH_MS);
	if (phase < 0.03 || phase >= 0.97) return '🌑';
	if (phase < 0.22) return '🌒';
	if (phase < 0.28) return '🌓';
	if (phase < 0.47) return '🌔';
	if (phase < 0.53) return '🌕';
	if (phase < 0.72) return '🌖';
	if (phase < 0.78) return '🌗';
	return '🌘';
}

// WMO weather codes → emoji.
// https://open-meteo.com/en/docs#weathervariables
export function weatherEmoji({ code, isDay }: CurrentWeather): string {
	if (code === 0) return isDay ? '☀️' : moonPhaseEmoji();
	if (code === 1) return isDay ? '🌤️' : moonPhaseEmoji();
	if (code === 2) return isDay ? '⛅' : '☁️';
	if (code === 3) return '☁️';
	if (code === 45 || code === 48) return '🌫️';
	if (code >= 51 && code <= 57) return '🌦️';
	if (code >= 61 && code <= 67) return '🌧️';
	if (code >= 71 && code <= 77) return '🌨️';
	if (code >= 80 && code <= 82) return '🌧️';
	if (code === 85 || code === 86) return '🌨️';
	if (code >= 95 && code <= 99) return '⛈️';
	return '🌡️';
}
