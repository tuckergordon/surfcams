<script lang="ts">
	import type { Stream } from '$lib/data/streams';

	let { stream }: { stream: Stream } = $props();

	const embedSrc = $derived(
		stream.videoId ? `https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=1` : null
	);
</script>

<article class="cam-card">
	<h2>{stream.name}</h2>
	{#if embedSrc}
		<iframe
			src={embedSrc}
			title="{stream.name} surf cam"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			loading="lazy"
		></iframe>
	{:else}
		<div class="offline" role="status">
			<p>Stream offline</p>
		</div>
	{/if}
</article>

<style>
	.cam-card {
		width: 100%;
	}

	iframe {
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		border: 0;
		display: block;
	}

	.offline {
		width: 100%;
		aspect-ratio: 16 / 9;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.4);
		border: 1px dashed #26554a;
		color: #26554a;
		font-style: italic;
	}
</style>
