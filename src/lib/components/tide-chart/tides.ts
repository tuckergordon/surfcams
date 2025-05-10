interface TideData {
  time: string;
  height: number;
  type: string;
}

interface TideOptions {
  stationId?: string;
  datum?: string;
  timezone?: string;
  units?: string;
  clock?: string;
  decimalPlaces?: string;
}

const baseUrl = "https://tidesandcurrents.noaa.gov/cgi-bin/stationtideinfo.cgi";

export async function fetchTides({
  stationId = "8418150",
  datum = "MLLW",
  timezone = "LST_LDT",
  units = "english",
  clock = "12hour",
  decimalPlaces = "2",
}: TideOptions = {}): Promise<TideData[]> {
  const apiString =
    `${baseUrl}?Stationid=${stationId}` +
    `&datum=${datum}` +
    `&timezone=${timezone}` +
    `&units=${units}` +
    `&clock=${clock}` +
    `&decimalPlaces=${decimalPlaces}`;

  try {
    const response = await fetch(apiString);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    const tidesArray = data.split("\n").filter((line) => line.trim() !== "");
    // Last element is the next tide, which we don't need
    tidesArray.pop();
    const tidesJson = tidesArray.map((line) => {
      const [time, height, type] = line.split("|");
      return { time, height: parseFloat(height), type: type.trim() };
    });
    return tidesJson;
  } catch (error) {
    console.error("Error fetching tides:", error);
    return [];
  }
}
