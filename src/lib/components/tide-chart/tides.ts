export interface TideEntry {
	time: string;
	height: number;
	type: string;
}

export interface TideOptions {
	stationId?: string;
	datum?: string;
	timezone?: string;
	units?: string;
	clock?: string;
	decimalPlaces?: string;
}

const BASE_URL = 'https://tidesandcurrents.noaa.gov/cgi-bin/stationtideinfo.cgi';

export async function fetchTides({
	stationId = '8418150',
	datum = 'MLLW',
	timezone = 'LST_LDT',
	units = 'english',
	clock = '12hour',
	decimalPlaces = '2'
}: TideOptions = {}): Promise<TideEntry[]> {
	const url =
		`${BASE_URL}?Stationid=${stationId}` +
		`&datum=${datum}` +
		`&timezone=${timezone}` +
		`&units=${units}` +
		`&clock=${clock}` +
		`&decimalPlaces=${decimalPlaces}`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Tide fetch failed: ${response.status}`);
	}

	const text = await response.text();
	const lines = text.split('\n').filter((line) => line.trim() !== '');
	// Last line is the next tide after the chart window — drop it.
	lines.pop();

	return lines.map((line) => {
		const [time, height, type] = line.split('|');
		return { time, height: parseFloat(height), type: type.trim() };
	});
}
