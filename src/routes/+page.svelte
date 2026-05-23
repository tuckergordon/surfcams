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

<header>
	<h1>Maine Surf Cams</h1>
	<div class="tide-temps">
		<Temperatures class="header-temps" />
		<TideChart class="tide-chart" width={350} height={100} />
	</div>
</header>

<main class="cam-grid">
	{#each streams as stream (stream.id)}
		<CamCard {stream} videoId={resolved?.[stream.id] ?? null} {loading} />
	{/each}
</main>

<footer>
	<h4>Notice a cam is down? Got a new one to add to the site?</h4>
	<p>
		<a href="mailto:tucker.gordon18@gmail.com">✉️ Email me</a>
		(or just text me if you have my number)
	</p>
	<p><a href="https://www.tuckergordon.dev/">tuckergordon.dev</a></p>
</footer>
