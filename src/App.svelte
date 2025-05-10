<script lang="ts">
  import TideChart from './lib/components/tide-chart/TideChart.svelte';
  import streams from './assets/streams.json' with { type: 'json' };
</script>

<header>
  <h1>Maine Surf Cams</h1>
  <TideChart className="tide-chart" width={350} height={100} />
</header>

<main class="cam-grid">
  {#each streams as stream}
    <div class="cam-container" id={stream.id}>
      <h2>{stream.name}</h2>
      {#if stream.videoId}
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/{stream.videoId}?autoplay=1&mute=1"
          title="{stream.name} surf cam"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      {:else}
        <div
          class="offline-message"
          style="width: 100%; height: 315px; display: grid; place-items: center; background: #dddddd99; border-radius: 8px;"
        >
          <p>This camera is currently offline</p>
        </div>
      {/if}
    </div>
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
