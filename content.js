(() => {
  const audioEl = document.querySelector("audio");

  if (audioEl) {
    let src = audioEl.src;

    // Handle <audio><source src="..."></audio>.
    // Not currently applicable to Udio as of 31/10/2025 but here for futureproofing
    if (!src) {
      const source = audioEl.querySelector("source");
      if (source) src = source.src;
    }

    if (src) {
      window.location.href = src; // Navigate directly to audio file
    } else {
      alert("Audio element found, but no src attribute present. Make sure something is playing or paused at the bottom of your screen.");
    }
  } else {
    alert("No <audio> element found on this page. Make sure something is playing or paused at the bottom of your screen.");
  }
})();
