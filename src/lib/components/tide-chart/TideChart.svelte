<script lang="ts">
  import * as d3 from "d3";
  import { fetchTides } from "./tides";

  interface TideData {
    time: string;
    height: number;
    type: string;
    parsedTime?: Date;
  }

  interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  // Props
  const { className = "", width = 800, height = 400 } = $props<{
    className?: string;
    width?: number;
    height?: number;
  }>();

  let tideData = $state<TideData[]>([]);
  let scales = $state<{
    x: d3.ScaleTime<number, number>;
    y: d3.ScaleLinear<number, number>;
  } | null>(null);
  let line = $state<d3.Line<TideData> | null>(null);
  let area = $state<d3.Area<TideData> | null>(null);
  let currentTime = $state<Date>(new Date());

  $effect(() => {
    if (tideData.length > 0) {
      const margin: Margin = { top: 30, right: 25, bottom: 20, left: 25 };
      const parseTime = d3.timeParse("%I:%M %p");

      // Parse times
      tideData.forEach((d) => {
        const parsed = parseTime(d.time);
        if (parsed) {
          d.parsedTime = parsed;
        }
      });

      // Create scales
      scales = {
        x: d3
          .scaleTime()
          .domain(d3.extent(tideData, (d) => d.parsedTime) as [Date, Date])
          .range([margin.left, width - margin.right]),
        y: d3
          .scaleLinear()
          .domain([
            (d3.min(tideData, (d) => d.height) ?? 0) - 1,
            (d3.max(tideData, (d) => d.height) ?? 0) + 1,
          ] as [number, number])
          .range([height - margin.bottom, margin.top]),
      };

      // Create line generator
      line = d3
        .line<TideData>()
        .x((d) => scales!.x(d.parsedTime!))
        .y((d) => scales!.y(d.height))
        .curve(d3.curveCatmullRom);

      // Create area generator
      area = d3
        .area<TideData>()
        .x((d) => scales!.x(d.parsedTime!))
        .y0(height - margin.bottom)
        .y1((d) => scales!.y(d.height))
        .curve(d3.curveCatmullRom);

      // Update current time
      currentTime = new Date();
    }
  });

  $effect(() => {
    async function loadData() {
      const data = await fetchTides();
      if (data) {
        tideData = data;
      }
    }
    loadData();
  });

  function formatTime(date: Date): string {
    const formatHour = d3.timeFormat("%-I%p");
    let formattedTime = formatHour(date).toLowerCase();
    if (formattedTime === "12pm") {
      formattedTime = "Noon";
    }
    return formattedTime;
  }
</script>

<svg class="tide-chart {className}" {width} {height} viewBox="0 0 {width} {height}">
  {#if tideData.length > 0 && scales && line && area}
    <!-- Tide line -->
    <path class="tide-line" d={line(tideData)} />

    <!-- Tide area -->
    <path class="tide-area" d={area(tideData)} />

    <!-- X axis -->
    <g transform="translate(0,{height - 20})">
      {#each scales.x.ticks(5) as tick}
        <g transform="translate({scales.x(tick)},0)">
          <line y2="4" stroke="#777" />
          <text y="16" text-anchor="middle" class="tick">
            {formatTime(tick)}
          </text>
        </g>
      {/each}
    </g>

    <!-- High and Low tide marks -->
    {#each tideData.filter(d => d.type === "high" || d.type === "low") as tide}
      <g class="group-high-low">
        <line
          class="line-{tide.type}"
          x1={scales.x(tide.parsedTime!)}
          x2={scales.x(tide.parsedTime!)}
          y1={scales.y(tide.height)}
          y2={height - 20}
        />
        <text
          x={scales.x(tide.parsedTime!)}
          y={scales.y(tide.height) - 10}
          text-anchor="middle"
        >
          {tide.height}ft
        </text>
        <text
          x={scales.x(tide.parsedTime!)}
          y={scales.y(tide.height) - 22}
          text-anchor="middle"
          class="tide-time"
        >
          {d3.timeFormat("%I:%M %p")(tide.parsedTime!)}
        </text>
      </g>
    {/each}

    <!-- Current time line -->
    <line
      class="line-current"
      x1={scales.x(currentTime)}
      x2={scales.x(currentTime)}
      y1="25"
      y2={height - 15}
    />
  {/if}
</svg>

<style>
  .tide-line {
    stroke: black;
    stroke-width: 2;
    fill: none;
  }

  .tide-area {
    fill: #4682b4;
    fill-opacity: 0.3;
  }

  .group-high-low text {
    text-anchor: middle;
    font-size: 10px;
    font-weight: 600;
    line-height: 16px;
    fill: #424242;
  }

  .tide-time {
    font-weight: 700;
  }

  .line-high,
  .line-low {
    stroke: #333;
    stroke-width: 1;
    opacity: 0.4;
    fill: none;
  }

  .line-current {
    stroke: #333;
    stroke-width: 1;
    fill: none;
  }

  .tick {
    fill: #777;
    font-size: 10px;
  }
</style>
