<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import {
		fetchAirTemperature,
		fetchWaterTemperature,
		type TemperatureSummary
	} from './temperatures';
	import { fetchCurrentWeather, weatherEmoji, type CurrentWeather } from './weather';

	let air = $state<TemperatureSummary | null>(null);
	let water = $state<TemperatureSummary | null>(null);
	let weather = $state<CurrentWeather | null>(null);

	const airRowOpacity = new Tween(0, { duration: 500, easing: cubicOut });
	const waterRowOpacity = new Tween(0, { duration: 500, easing: cubicOut });

	$effect(() => {
		if (air && weather) airRowOpacity.target = 1;
	});
	$effect(() => {
		if (water) waterRowOpacity.target = 1;
	});

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
	<div
		class="flex items-center gap-[7px] whitespace-nowrap"
		style="opacity: {airRowOpacity.current};"
	>
		<span
			class="inline-flex h-4 w-[22px] -translate-y-[2px] items-center justify-center text-base leading-none"
			aria-label="Current weather">{weather ? weatherEmoji(weather) : ''}</span
		>
		{#if air}
			<span class="font-bold text-surf-green">{fmt(air.current)}</span>
			<span class="text-surf-subtle">H {fmt(air.high)} / L {fmt(air.low)}</span>
		{/if}
	</div>
	<div
		class="flex items-center gap-[7px] whitespace-nowrap"
		style="opacity: {waterRowOpacity.current};"
	>
		<span
			class="inline-flex h-4 w-[22px] translate-y-[-2px] items-center justify-center text-base leading-none"
			aria-label="Water">🌊</span
		>
		{#if water}
			<span class="font-bold text-surf-green">{fmt(water.current)}</span>
			<span class="text-surf-subtle">H {fmt(water.high)} / L {fmt(water.low)}</span>
		{/if}
	</div>
</div>
