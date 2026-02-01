(() => {
  function tryRegex(text) {
    // simple JSON-style capture
    let m = text.match(/"song_path"\s*:\s*"([^"]+)"/);
    if (m) return m[1];
    // single-quoted
    m = text.match(/'song_path'\s*:\s*'([^']+)'/);
    if (m) return m[1];
    // unescaped occurrences (script text sometimes has backslashes)
    const unescaped = text.replace(/\\"/g, '"').replace(/\\\//g, '/');
    m = unescaped.match(/"song_path"\s*:\s*"([^"]+)"/);
    if (m) return m[1];
    m = unescaped.match(/'song_path'\s*:\s*'([^']+)'/);
    if (m) return m[1];
    // fallback: look for song object block then extract song_path without strict quoting
    m = unescaped.match(/song_path"\s*:\s*("?)(https?:\/\/[^"'\s>]+)\1/);
    if (m) return m[2];
    m = unescaped.match(/song_path\s*:\s*(https?:\/\/[^\s'"<>]+)/);
    if (m) return m[1];
    return null;
  }

  function extractSongPathFromText(text) {
    if (!text) return null;
    try {
      // quick direct attempt first
      const direct = tryRegex(text);
      if (direct) return direct;
      // attempt limited unescape of common sequences then try again
      const t2 = text.replace(/\\u002F/g, '/').replace(/\\n/g, '').replace(/\\r/g, '');
      return tryRegex(t2);
    } catch {
      return null;
    }
  }

  function findEmbedUrlInDoc() {
    const playerAnchor = document.querySelector('#player a[href*="/songs/"], .player a[href*="/songs/"]');
    if (playerAnchor) {
      const href = playerAnchor.getAttribute('href');
      const m = href && href.match(/\/songs\/([A-Za-z0-9_\-]+)/);
      if (m) return `https://www.udio.com/embed/${m[1]}`;
    }
    for (const a of Array.from(document.querySelectorAll('a[href]'))) {
      const href = a.getAttribute('href');
      const m = href && href.match(/\/songs\/([A-Za-z0-9_\-]+)/);
      if (m) return `https://www.udio.com/embed/${m[1]}`;
    }
    const html = document.documentElement.outerHTML;
    let m = html.match(/\/songs\/([A-Za-z0-9_\-]+)/);
    if (m) return `https://www.udio.com/embed/${m[1]}`;
    m = html.match(/https?:\/\/www\.udio\.com\/embed\/[A-Za-z0-9_\-]+/);
    if (m) return m[0];
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length) {
      const id = parts.pop();
      if (/^[A-Za-z0-9_\-]+$/.test(id)) return `https://www.udio.com/embed/${id}`;
    }
    return null;
  }

  function navigateTo(url) {
    if (!url) return;
    // avoid navigating to blob: (not downloadable)
    if (url.startsWith('blob:')) return;
    location.href = url;
  }

  // If we're not on an embed page, navigate to the embed page if possible.
  if (!/\/embed\//i.test(location.pathname)) {
    const embedUrl = findEmbedUrlInDoc();
    if (embedUrl) {
      location.href = embedUrl;
      return;
    }
  }

  // Try immediate extraction from inline scripts first
  function scanForSongPath() {
    // search inline <script> tags' textContent
    for (const s of Array.from(document.scripts || [])) {
      const txt = s.textContent || '';
      const path = extractSongPathFromText(txt);
      if (path) return path;
    }
    // fallback: whole document
    const whole = document.documentElement.outerHTML || document.body?.outerHTML || '';
    return extractSongPathFromText(whole);
  }

  const found = scanForSongPath();
  if (found) {
    navigateTo(found);
    return;
  }

  // The below doesn't seem to be necessary, commenting out for now since I don't understand what it does anyway.

  // If not found yet, observe mutations briefly (page uses NextJS dynamic script pushes)
  // let observer;
  // let timedOut = false;
  // const timeout = setTimeout(() => {
  //   timedOut = true;
  //   if (observer) observer.disconnect();
  //   // final fallback: try audio src but ignore blob:
  //   const audioEl = document.querySelector('audio');
  //   if (audioEl) {
  //     let src = audioEl.src;
  //     if (!src) {
  //       const source = audioEl.querySelector('source');
  //       if (source) src = source.src;
  //     }
  //     if (src && !src.startsWith('blob:')) {
  //       navigateTo(src);
  //       return;
  //     }
  //   }
  //   alert('No "song_path" found. Run the extension on the embed page or try again after the page finishes loading.');
  // }, 5000);

  // observer = new MutationObserver((mutations) => {
  //   if (timedOut) return;
  //   const path = scanForSongPath();
  //   if (path) {
  //     clearTimeout(timeout);
  //     observer.disconnect();
  //     navigateTo(path);
  //   }
  // });

  // observer.observe(document.documentElement || document.body, {
  //   childList: true,
  //   subtree: true,
  //   characterData: true,
  // });
})();
