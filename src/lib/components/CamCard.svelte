<script lang="ts">
	import type { Stream } from '$lib/data/streams';

	let { stream, videoId, loading }: { stream: Stream; videoId: string | null; loading: boolean } =
		$props();

	const embedSrc = $derived(
		videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : null
	);
</script>

<article class="w-full">
	<h2 class="font-display text-2xl font-normal">{stream.name}</h2>
	{#if embedSrc}
		<iframe
			class="block aspect-video w-full border-0"
			src={embedSrc}
			title="{stream.name} surf cam"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			loading="lazy"
		></iframe>
	{:else if loading}
		<div
			class="flex aspect-video w-full items-center justify-center border border-dashed bg-white/40 text-surf-green italic"
			role="status"
		>
			<p>Loading…</p>
		</div>
	{:else}
		<div
			class="flex aspect-video w-full items-center justify-center border border-dashed bg-white/40 text-surf-green italic"
			role="status"
		>
			<p>Stream offline</p>
		</div>
	{/if}
</article>
