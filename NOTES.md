# Special's Restro & Cafe — where we left off

Paused 2026-08-26. Everything below is current on disk.

## Run it

Opening `index.html` straight off disk works (`file://` safe — all scripts are
classic, no ES modules). To serve it instead:

```bash
python -m http.server 5177 --directory specials-restro-cafe
```

A `.claude/launch.json` config named `specials-static` already points at that.

## Files

| File | Lines | What it is |
| --- | --- | --- |
| `index.html` | 683 | All three routes (`#/home`, `#/menu`, `#/delivery`) in one document |
| `assets/css/style.css` | ~1260 | Dark-first tokens + `[data-theme="light"]`, all motion primitives |
| `assets/js/data.js` | 399 | Single source of truth — business info, 68 menu items, addons, coupons |
| `assets/js/art.js` | 1165 | Procedural SVG illustration engine (15 dish "kinds", 15 tones, 4 surfaces) |
| `assets/js/hero3d.js` | 380 | three.js r136 hero scene — lathed cup, latte-art texture, steam, beans |
| `assets/js/app.js` | 1626 | Router, reactive store, cart, bill math, menu filters, checkout, tracking |

## Verified working

Booted at `http://localhost:5177` with **zero console errors**. Confirmed live:

- All four CDNs loaded (three.js, GSAP, ScrollTrigger, Lenis)
- WebGL hero initialised — `.hero` got `has-3d`, canvas sized to the container
- `SRC.MENU.length === 68`
- 9 coverflow cards, 5 service flip-cards, 8 gallery tiles, 9 SVG illustrations rendered
- `window.SPECIALS` exposes `{ state, add, bill, toast, go }` for console poking
- Hero headline: all three lines present, opacity 1, transform identity

## Fixed during the CSS pass

- **`[hidden] { display: none !important }`** — the app toggles the `hidden`
  attribute on the cart, modal, scrim, order bar and empty states. Author
  `display` rules were beating the UA sheet and would have left them all visible.
- **Reveal animates `translate`, not `transform`** — `.gtile` carries both
  `data-reveal` and `.tilt`; on `transform` the reveal selector won the cascade
  and killed the tilt entirely. Separate properties compose. Has a
  `@supports not (translate: 0 1px)` fallback.
- **`swap()` scoped to `.page[data-page]`** — `app.js` mirrors the route onto
  `<html data-page>`, so the old `$$('[data-page]')` was also toggling
  `is-active` on the `<html>` element.
- **Track step icons** — `font-size: 0` collapses the step number so the ✓ / ●
  can take its place inside the same grid cell.
- **`[data-route-path]` / `[data-route-fill]` strokes moved to CSS** so the
  delivery route re-themes in light mode (the SVG had a hardcoded
  `rgba(255,255,255,.12)`).
- **`data-par` wired up** — `app.js` had the parallax scroll loop but no element
  declared the attribute. Now on the `#story` / `#gallery` / `#reviews` headings.

## In progress when we stopped

**Hero composition.** The first screenshot showed the 3D cup rendering
dead-centre at nearly full frame height, swallowing the headline. Two edits
landed to fix it, both **unverified in a browser**:

1. `hero3d.js` `resize()` now computes the visible half-width from the camera
   frustum and parks the cup low and right (`world.position.x = halfW * 0.5`,
   `scale 0.8`, `baseY -0.95`) on screens ≥1024px, centred and smaller
   (`scale 0.62`) below that. Added a `baseY` variable that `frame()` reads
   instead of the old hardcoded `-0.55`.
2. `style.css` `.hero__vig` gained a directional wash so the headline column
   always has a dark backing regardless of what the 3D does.

**Next step: reload and screenshot the hero at 1440×900 to check the cup
actually clears the headline and sits sensibly behind the chef's-pick card.**
The browser pane stopped compositing frames before this could be confirmed.

## Still to do

- Verify the hero fix above
- Walk `#/menu` (68 cards, filters, search, category rail) and `#/delivery`
  (address → slot → payment → place order → rider tracking) in the browser
- Light theme pass — tokens exist, never looked at
- Check degradation with the CDNs blocked (everything is guarded, but untested)
- `README.md`

## Placeholders to replace before this goes anywhere real

In `assets/js/data.js`:

- `phone: '+91 90000 00000'` and the matching `whatsapp` — invented
- `email: 'hello@specialsrestrocafe.in'`, `instagram: '@specials.jamnagar'` — invented
- `SRC.REVIEWS` — six sample testimonials, not real Google reviews
- `starSplit` — an illustrative 5/4/3/2/1 breakdown. It sums to 1,737 and
  averages 4.608, so it's consistent with the real rating, but the per-star
  counts are made up
- Opening hours are modelled as 9:00 am – 12:30 am every day, extrapolated from
  the listing's "Closes 12:30 am"

The menu itself is invented (68 dishes, pure veg + egg). Dish "photos" are
procedurally drawn SVG, so there are no image files and nothing 404s offline —
swap `art:` for `<img>` if real photography turns up.
