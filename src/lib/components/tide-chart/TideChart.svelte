<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { fetchTides, type TideEntry } from './tides';

	interface ParsedTide extends TideEntry {
		parsedTime: Date;
	}

	interface Props {
		class?: string;
		width?: number;
		height?: number;
	}

	let { class: className = '', width = 350, height = 100 }: Props = $props();

	const margin = { top: 30, right: 25, bottom: 20, left: 25 };

	let tideData = $state<ParsedTide[]>([]);
	let now = $state(new Date());

	const xScale = $derived.by(() => {
		if (tideData.length === 0) return null;
		return d3
			.scaleTime()
			.domain(d3.extent(tideData, (d) => d.parsedTime) as [Date, Date])
			.range([margin.left, width - margin.right]);
	});

	const yScale = $derived.by(() => {
		if (tideData.length === 0) return null;
		const min = d3.min(tideData, (d) => d.height) ?? 0;
		const max = d3.max(tideData, (d) => d.height) ?? 0;
		return d3
			.scaleLinear()
			.domain([min - 1, max + 1])
			.range([height - margin.bottom, margin.top]);
	});

	const linePath = $derived.by(() => {
		if (!xScale || !yScale) return null;
		return d3
			.line<ParsedTide>()
			.x((d) => xScale(d.parsedTime))
			.y((d) => yScale(d.height))
			.curve(d3.curveCatmullRom)(tideData);
	});

	const areaPath = $derived.by(() => {
		if (!xScale || !yScale) return null;
		return d3
			.area<ParsedTide>()
			.x((d) => xScale(d.parsedTime))
			.y0(height - margin.bottom)
			.y1((d) => yScale(d.height))
			.curve(d3.curveCatmullRom)(tideData);
	});

	const highLowTides = $derived(tideData.filter((d) => d.type === 'high' || d.type === 'low'));

	function formatHour(date: Date): string {
		const formatted = d3.timeFormat('%-I%p')(date).toLowerCase();
		return formatted === '12pm' ? 'Noon' : formatted;
	}

	const timeFormat = d3.timeFormat('%I:%M %p');

	onMount(() => {
		const parseTime = d3.timeParse('%I:%M %p');

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
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svg
	class={['tide-chart', className]}
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	aria-label="Tide chart for Portland, ME"
>
	{#if xScale && yScale && linePath && areaPath}
		<path class="tide-area" d={areaPath} />
		<path class="tide-line" d={linePath} />

		<g transform="translate(0,{height - 20})">
			{#each xScale.ticks(5) as tick (tick.getTime())}
				<g transform="translate({xScale(tick)},0)">
					<line y2="4" stroke="#777" />
					<text y="16" text-anchor="middle" class="tick">{formatHour(tick)}</text>
				</g>
			{/each}
		</g>

		{#each highLowTides as tide (tide.parsedTime.getTime())}
			<g class="group-high-low">
				<line
					class="line-{tide.type}"
					x1={xScale(tide.parsedTime)}
					x2={xScale(tide.parsedTime)}
					y1={yScale(tide.height)}
					y2={height - 20}
				/>
				<text x={xScale(tide.parsedTime)} y={yScale(tide.height) - 10} text-anchor="middle">
					{tide.height}ft
				</text>
				<text
					x={xScale(tide.parsedTime)}
					y={yScale(tide.height) - 22}
					text-anchor="middle"
					class="tide-time"
				>
					{timeFormat(tide.parsedTime)}
				</text>
			</g>
		{/each}

		<line class="line-current" x1={xScale(now)} x2={xScale(now)} y1="25" y2={height - 15} />
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
