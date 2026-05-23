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

// WMO weather codes → emoji.
// https://open-meteo.com/en/docs#weathervariables
export function weatherEmoji({ code, isDay }: CurrentWeather): string {
	if (code === 0) return isDay ? '☀️' : '🌙';
	if (code === 1) return isDay ? '🌤️' : '🌙';
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
