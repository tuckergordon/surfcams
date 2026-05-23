<script lang="ts">
	import CamCard from '$lib/components/CamCard.svelte';
	import TideChart from '$lib/components/tide-chart/TideChart.svelte';
	import { streams } from '$lib/data/streams';
</script>

<svelte:head>
	<title>Maine Surf Cams</title>
</svelte:head>

<header>
	<h1>Maine Surf Cams</h1>
	<TideChart class="tide-chart" width={350} height={100} />
</header>

<main class="cam-grid">
	{#each streams as stream (stream.id)}
		<CamCard {stream} />
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
