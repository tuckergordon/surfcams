export interface TemperatureSummary {
	current: number;
	high: number;
	low: number;
}

export interface TemperatureOptions {
	stationId?: string;
	timezone?: string;
	units?: string;
}

const BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

async function fetchProduct(
	product: 'air_temperature' | 'water_temperature',
	{ stationId = '8418150', timezone = 'lst_ldt', units = 'english' }: TemperatureOptions = {}
): Promise<TemperatureSummary | null> {
	const url =
		`${BASE_URL}?product=${product}` +
		`&date=today` +
		`&station=${stationId}` +
		`&time_zone=${timezone}` +
		`&units=${units}` +
		`&format=json`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`${product} fetch failed: ${response.status}`);
	}

	const json = (await response.json()) as { data?: { t: string; v: string }[] };
	const data = json.data;
	if (!data || data.length === 0) return null;

	const values = data
		.map((d) => parseFloat(d.v))
		.filter((v) => Number.isFinite(v));
	if (values.length === 0) return null;

	return {
		current: values[values.length - 1],
		high: Math.max(...values),
		low: Math.min(...values)
	};
}

export function fetchAirTemperature(options?: TemperatureOptions) {
	return fetchProduct('air_temperature', options);
}

export function fetchWaterTemperature(options?: TemperatureOptions) {
	return fetchProduct('water_temperature', options);
}
