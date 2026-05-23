<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchAirTemperature,
		fetchWaterTemperature,
		type TemperatureSummary
	} from './temperatures';
	import { fetchCurrentWeather, weatherEmoji, type CurrentWeather } from './weather';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	let air = $state<TemperatureSummary | null>(null);
	let water = $state<TemperatureSummary | null>(null);
	let weather = $state<CurrentWeather | null>(null);

	function fmt(n: number): string {
		return `${Math.round(n)}°`;
	}

	onMount(() => {
		fetchAirTemperature()
			.then((data) => {
				air = data;
			})
			.catch((err) => {
				console.error('Error fetching air temperature:', err);
			});

		fetchWaterTemperature()
			.then((data) => {
				water = data;
			})
			.catch((err) => {
				console.error('Error fetching water temperature:', err);
			});

		fetchCurrentWeather()
			.then((data) => {
				weather = data;
			})
			.catch((err) => {
				console.error('Error fetching weather:', err);
			});
	});
</script>

<div class={['temperatures', className]}>
	<div class="temp-row">
		<span class="icon" aria-label="Current weather">{weather ? weatherEmoji(weather) : ''}</span>
		{#if air}
			<span class="current">{fmt(air.current)}</span>
			<span class="range">H {fmt(air.high)} / L {fmt(air.low)}</span>
		{:else}
			<span class="range">—</span>
		{/if}
	</div>
	<div class="temp-row">
		<span class="icon" aria-label="Water">🌊</span>
		{#if water}
			<span class="current">{fmt(water.current)}</span>
			<span class="range">H {fmt(water.high)} / L {fmt(water.low)}</span>
		{:else}
			<span class="range">—</span>
		{/if}
	</div>
</div>

<style>
	.temperatures {
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 13px;
		color: #424242;
		line-height: 1;
	}

	.temp-row {
		display: flex;
		align-items: center;
		gap: 7px;
		white-space: nowrap;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		font-size: 16px;
		line-height: 1;
		transform: translateY(-2px);
	}

	.current {
		font-weight: 700;
		color: #26554a;
	}

	.range {
		color: #777;
	}
</style>
