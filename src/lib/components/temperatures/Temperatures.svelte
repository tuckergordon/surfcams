<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchAirTemperature,
		fetchWaterTemperature,
		type TemperatureSummary
	} from './temperatures';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	let air = $state<TemperatureSummary | null>(null);
	let water = $state<TemperatureSummary | null>(null);

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
	});
</script>

<div class={['temperatures', className]}>
	<div class="temp-row">
		<span class="label">Air</span>
		{#if air}
			<span class="current">{fmt(air.current)}</span>
			<span class="range">H {fmt(air.high)} / L {fmt(air.low)}</span>
		{:else}
			<span class="range">—</span>
		{/if}
	</div>
	<div class="temp-row">
		<span class="label">Water</span>
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
		gap: 2px;
		font-size: 11px;
		color: #424242;
		line-height: 1.3;
	}

	.temp-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
		white-space: nowrap;
	}

	.label {
		font-weight: 700;
		min-width: 2.6rem;
	}

	.current {
		font-weight: 700;
		color: #26554a;
	}

	.range {
		color: #777;
	}
</style>
