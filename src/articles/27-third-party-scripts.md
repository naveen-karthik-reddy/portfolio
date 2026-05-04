# Performance #27 - Third-Party Scripts & the Facade Pattern

You wrote a lean, fast application. Then you added a live chat widget, analytics, a cookie banner, social share buttons, and a marketing tag manager. Third-party scripts are often the single largest source of main-thread blocking time on production websites — and they're code you don't control.

---

## The Real Cost of Third-Party Scripts

A typical enterprise homepage loads 15–40 third-party scripts. Each one may:
- Add a DNS lookup and TCP connection (100–300ms each)
- Block the main thread during parse and execution
- Make its own additional network requests
- Inject inline CSS and manipulate the DOM
- Set up intervals and listeners that persist after load

Tag managers compound the problem by loading other scripts dynamically, making the total payload unpredictable.

Chrome UX Report data consistently shows that the largest contributor to poor TBT (Total Blocking Time) and INP scores is third-party JavaScript.

---

## Measuring Third-Party Impact

In DevTools, the **Network tab** with the "Third-party" filter shows every request not to your own origin. The **Performance tab** → Bottom-Up → Group by Domain shows which domains consume the most main-thread time.

Lighthouse generates a **"Reduce the impact of third-party code"** audit that attributes blocking time and transfer size per domain.

To test the impact of removing a specific third, use Chrome's **Request Blocking** feature (DevTools → Network → Request Blocking) to block a domain and re-run Lighthouse. The delta in scores tells you exactly what that script is costing.

---

## Loading Strategies

### async and defer

Always load third-party scripts with `async` or `defer`. Never load them as synchronous blocking scripts.

```html
<!-- async: downloads in parallel, executes immediately when ready — can still block parsing -->
<script async src="https://cdn.analytics.com/track.js"></script>

<!-- defer: downloads in parallel, executes after HTML is fully parsed, in order -->
<script defer src="https://cdn.chat.com/widget.js"></script>
```

`defer` is usually preferable for third parties because it doesn't interrupt HTML parsing.

### Load on Interaction

For widgets that most users never interact with (chat, video players, social embeds), defer loading entirely until the user signals intent.

```js
// The chat script is never downloaded unless the user actually clicks the button.
// { once: true } automatically removes the listener after first click.
document.getElementById('chat-button').addEventListener('click', () => {
  const script = document.createElement('script');
  script.src = 'https://cdn.chat.com/widget.js';
  document.head.appendChild(script);
}, { once: true });
```

This eliminates the script's cost entirely for the majority of users who never open the chat.

You can also trigger on hover or first scroll — anything that indicates the user is about to need it:

```js
// Load on first scroll — gives the script time to load before the user reaches
// the section of the page where it's visible
window.addEventListener('scroll', () => {
  loadThirdParty();
}, { once: true, passive: true });
```

---

## The Facade Pattern

A facade is a lightweight, static placeholder that looks like the real third-party widget. The actual script is loaded only when the user interacts with the facade.

The canonical example is a YouTube embed. A real YouTube `<iframe>` loads ~400KB of JavaScript immediately. A facade shows the video thumbnail and a play button, and loads the iframe only when clicked.

```jsx
function YouTubeFacade({ videoId, title }) {
  const [activated, setActivated] = useState(false);

  if (activated) {
    // Real iframe only loads after the user clicks — autoplay=1 so it starts immediately
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allowFullScreen
      />
    );
  }

  return (
    // Static thumbnail — zero JS cost, just a background image and a button
    <button
      onClick={() => setActivated(true)}
      style={{ backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)` }}
      aria-label={`Play ${title}`}
    >
      <span className="play-icon">▶</span>
    </button>
  );
}
```

The `lite-youtube-embed` web component is a production-ready version of this pattern. Similar facades exist for Google Maps (`maps-embed`), Intercom, Zendesk, and most chat widgets.

---

## Partytown

[Partytown](https://partytown.builder.io/) relocates third-party scripts to a Web Worker. Analytics, tag managers, and marketing scripts run off the main thread, communicating with the DOM via a synchronous proxy layer.

Setup requires copying the Partytown lib files to your public directory, then:

```html
<!-- Configure Partytown before the lib loads -->
<script>
  partytown = { lib: '/~partytown/' };
</script>

<!-- Scripts with type="text/partytown" are intercepted and run in the worker -->
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
<script type="text/partytown">
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXX');
</script>
```

For Vite or Next.js, use the official `@builder.io/partytown` integration which handles the lib copying automatically. DOM reads are proxied synchronously back to the main thread; writes are batched. The main thread stays free.

---

## Connection Warming

If you must load a third-party script on page load, at least warm the connection early so the DNS + TCP + TLS handshake is out of the way before the script is requested:

```html
<!-- preconnect does DNS + TCP + TLS upfront -->
<link rel="preconnect" href="https://cdn.analytics.com" crossorigin />
<!-- dns-prefetch as fallback for browsers that don't support preconnect -->
<link rel="dns-prefetch" href="https://cdn.analytics.com" />
```

This can save 100–300ms on script load time without changing when the script executes.

---

The load-on-interaction pattern and the facade pattern together can eliminate the cost of third-party scripts for the majority of your users — the ones who load the page but never interact with the widget. That's usually 80%+ of your traffic.
