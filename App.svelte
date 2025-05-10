<script>
  import TideChart from "./lib/components/tide-chart/TideChart.svelte";
</script>

<header>
  <h1>Maine Surf Cams</h1>
  <TideChart className="tide-chart" width={350} height={100} />
</header>

<main class="cam-grid">
  <div class="cam-container" id="scarb">
    <h2>Higgins Beach</h2>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/9w7shRiOY60?si=nBwfSWTvfVU1-uKs&autoplay=1&mute=1"
      title="Higgins Beach surf cam"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
  <div class="cam-container" id="pine-point">
    <h2>Pine Point Beach</h2>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/JffKRIrpA1o?si=IzCZnovrnp-v3F-v&autoplay=1&mute=1"
      title="Pine Point surf cam"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
  <div class="cam-container" id="oob">
    <h2>Old Orchard Beach</h2>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/AB0Gmtrk9Pc?si=9OzEOAqy9c8xjLHb&autoplay=1&mute=1"
      title="Old Orchard Beach surf cam"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
  <div class="cam-container" id="scarb">
    <h2>Scarborough Beach</h2>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/ovbFXmkui38?si=X1AcJb3Uv60ZWLQy&autoplay=1&mute=1"
      title="Scarborough beach surf cam"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
  <div class="cam-container" id="kennebunk">
    <h2>Kennebunk Beach</h2>
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/m6DMs26S1e8?si=ytpdUB5hTtEO1MCt&autoplay=1&mute=1"
      title="Kennebunk beach surf cam"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </div>
</main>

<footer>
  <h4>Notice a cam is down? Got a new one to add to the site?</h4>
  <p>
    <a href="mailto:tucker.gordon18@gmail.com">✉️ Email me</a>
    (or just text me if you have my number)
  </p>
  <p><a href="https://www.tuckergordon.dev/">tuckergordon.dev</a></p>
</footer>
