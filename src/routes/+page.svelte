<script lang="ts">
	import { onMount } from 'svelte';
	import CamCard from '$lib/components/CamCard.svelte';
	import TideChart from '$lib/components/tide-chart/TideChart.svelte';
	import Temperatures from '$lib/components/temperatures/Temperatures.svelte';
	import { streams, RESOLVED_URL } from '$lib/data/streams';

	let resolved = $state<Record<string, string> | null>(null);
	let loading = $derived(resolved === null);

	onMount(async () => {
		try {
			const res = await fetch(RESOLVED_URL, { cache: 'no-cache' });
			resolved = res.ok ? await res.json() : {};
		} catch {
			resolved = {};
		}
	});
</script>

<svelte:head>
	<title>Maine Surf Cams</title>
</svelte:head>

<header class="flex flex-col items-center justify-between gap-4 lg:flex-row">
	<h1 class="font-display text-[2.5rem] font-normal">Maine Surf Cams</h1>
	<div
		class="mx-auto flex w-full max-w-[470px] flex-col items-center gap-1 sm:flex-row sm:items-end sm:gap-2 lg:mx-0"
	>
		<Temperatures />
		<TideChart width={350} height={100} />
	</div>
</header>

<main class="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
	{#each streams as stream (stream.id)}
		<CamCard {stream} videoId={resolved?.[stream.id] ?? null} {loading} />
	{/each}
</main>

<footer class="mt-12 border-t border-[#333] pt-4 text-center">
	<h4 class="font-bold">Notice a cam is down? Got a new one to add to the site?</h4>
	<p>
		<a class="font-bold hover:underline" href="mailto:tucker.gordon18@gmail.com">✉️ Email me</a>
		(or just text me if you have my number)
	</p>
	<p>
		<a class="font-bold hover:underline" href="https://www.tuckergordon.dev/">tuckergordon.dev</a>
	</p>
</footer>
