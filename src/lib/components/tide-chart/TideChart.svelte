<script lang="ts">
	import {
		area,
		curveMonotoneX,
		extent,
		line,
		scaleLinear,
		scaleTime,
		timeFormat,
		timeParse
	} from 'd3';
	import { onMount } from 'svelte';
	import { fetchTides, type TideEntry } from './tides';

	const parseTime = timeParse('%I:%M %p');
	const formatTime = timeFormat('%I:%M %p');
	const formatTickHour = timeFormat('%-I%p');

	interface ParsedTide extends TideEntry {
		parsedTime: Date;
	}

	interface Props {
		width?: number;
		height?: number;
	}

	let { width = 350, height = 100 }: Props = $props();

	const margin = { top: 30, right: 25, bottom: 20, left: 25 };

	let tideData = $state<ParsedTide[]>([]);
	let now = $state(new Date());

	const xScale = $derived.by(() => {
		if (tideData.length === 0) return null;
		return scaleTime()
			.domain(extent(tideData, (d) => d.parsedTime) as [Date, Date])
			.range([margin.left, width - margin.right]);
	});

	const yScale = $derived.by(() => {
		if (tideData.length === 0) return null;
		const [min = 0, max = 0] = extent(tideData, (d) => d.height);
		return scaleLinear()
			.domain([min - 1, max + 1])
			.range([height - margin.bottom, margin.top]);
	});

	const linePath = $derived.by(() => {
		if (!xScale || !yScale) return null;
		return line<ParsedTide>()
			.x((d) => xScale(d.parsedTime))
			.y((d) => yScale(d.height))
			.curve(curveMonotoneX)(tideData);
	});

	const areaPath = $derived.by(() => {
		if (!xScale || !yScale) return null;
		return area<ParsedTide>()
			.x((d) => xScale(d.parsedTime))
			.y0(height - margin.bottom)
			.y1((d) => yScale(d.height))
			.curve(curveMonotoneX)(tideData);
	});

	const highLowTides = $derived(tideData.filter((d) => d.type === 'high' || d.type === 'low'));

	function formatHour(date: Date): string {
		const formatted = formatTickHour(date).toLowerCase();
		return formatted === '12pm' ? 'Noon' : formatted;
	}

	onMount(() => {
		fetchTides()
			.then((data) => {
				tideData = data
					.map((d) => {
						const parsed = parseTime(d.time);
						return parsed ? { ...d, parsedTime: parsed } : null;
					})
					.filter((d): d is ParsedTide => d !== null);
			})
			.catch((err) => {
				console.error('Error fetching tides:', err);
			});

		const interval = setInterval(() => {
			now = new Date();
		}, 60_000);

		return () => clearInterval(interval);
	});
</script>

<svg
	class="block h-auto max-w-full min-w-0 flex-1"
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	aria-label="Tide chart for Portland, ME"
>
	{#if xScale && yScale && linePath && areaPath}
		<path class="fill-[#4682b4]/30" d={areaPath} />
		<path class="fill-none stroke-black stroke-2" d={linePath} />

		<g transform="translate(0,{height - margin.bottom})">
			{#each xScale.ticks(5) as tick (tick.getTime())}
				<g transform="translate({xScale(tick)},0)">
					<line y2="4" stroke="#777" />
					<text y="16" text-anchor="middle" class="fill-surf-subtle text-[10px]"
						>{formatHour(tick)}</text
					>
				</g>
			{/each}
		</g>

		{#each highLowTides as tide (tide.parsedTime.getTime())}
			<g>
				<line
					class="fill-none stroke-[#333] stroke-1 opacity-40"
					x1={xScale(tide.parsedTime)}
					x2={xScale(tide.parsedTime)}
					y1={yScale(tide.height)}
					y2={height - margin.bottom}
				/>
				<text
					x={xScale(tide.parsedTime)}
					y={yScale(tide.height) - 10}
					text-anchor="middle"
					class="fill-surf-muted text-[10px] font-semibold"
				>
					{tide.height}ft
				</text>
				<text
					x={xScale(tide.parsedTime)}
					y={yScale(tide.height) - 22}
					text-anchor="middle"
					class="fill-surf-muted text-[10px] font-bold"
				>
					{formatTime(tide.parsedTime)}
				</text>
			</g>
		{/each}

		<line
			class="fill-none stroke-[#333] stroke-1"
			x1={xScale(now)}
			x2={xScale(now)}
			y1="25"
			y2={height - margin.bottom + 5}
		/>
	{/if}
</svg>
