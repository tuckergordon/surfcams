<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchAirTemperature,
		fetchWaterTemperature,
		type TemperatureSummary
	} from './temperatures';
	import { fetchCurrentWeather, weatherEmoji, type CurrentWeather } from './weather';

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

<div class="flex shrink-0 flex-col gap-[5px] pb-5 text-[13px] leading-none text-[#424242]">
	<div class="flex items-center gap-[7px] whitespace-nowrap">
		<span
			class="inline-flex w-[22px] -translate-y-[2px] items-center justify-center text-base leading-none"
			aria-label="Current weather">{weather ? weatherEmoji(weather) : ''}</span
		>
		{#if air}
			<span class="font-bold text-surf-green">{fmt(air.current)}</span>
			<span class="text-surf-subtle">H {fmt(air.high)} / L {fmt(air.low)}</span>
		{:else}
			<span class="text-surf-subtle">—</span>
		{/if}
	</div>
	<div class="flex items-center gap-[7px] whitespace-nowrap">
		<span
			class="inline-flex w-[22px] translate-y-[-2px] items-center justify-center text-base leading-none"
			aria-label="Water">🌊</span
		>
		{#if water}
			<span class="font-bold text-surf-green">{fmt(water.current)}</span>
			<span class="text-surf-subtle">H {fmt(water.high)} / L {fmt(water.low)}</span>
		{:else}
			<span class="text-surf-subtle">—</span>
		{/if}
	</div>
</div>
