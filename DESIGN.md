# Design

Visual system for Alan's personal site. Concept: **Hands & Horizons** — a nocturnal photo
essay. Near-black warm "gallery walls" where Alan's photographs hang lit like windows, with
a single ember-amber accent (oven light, tiki torch, magic-hour sun). Editorial, but driven
by imagery, not by ruled-column type.

Named aesthetic anchor: *the closing-credits sequence of an adventure film meets a candlelit
supper club.* Explicitly NOT the cream-paper editorial-magazine lane.

## Theme

Dark, committed. Depth comes from surface lightness (not shadow). Two art-directed worlds
share one dark voice:

- **Horizons** (intro, ledger, adventure): cool-leaning espresso black; photos of sky, sea,
  stone, and altitude glow against it.
- **Hands / The Table** (food, gathering): the same darkness warmed by a radial amber
  candle-glow, so stepping into it feels like walking into a lit dining room at night.

## Color (OKLCH)

Brand hue is amber (~62). Neutrals are tinted toward it (chroma 0.012–0.016) for cohesion.

```
--bg            oklch(0.171 0.012 62)   /* espresso near-black, page base            */
--bg-2          oklch(0.213 0.014 60)   /* raised band / section surface             */
--bg-3          oklch(0.255 0.016 58)   /* elevated chip / inset                     */
--ink           oklch(0.945 0.012 82)   /* primary text, warm off-white              */
--muted         oklch(0.760 0.014 74)   /* secondary text  (>= 4.5:1 on --bg)        */
--faint         oklch(0.620 0.013 70)   /* meta / captions, large or non-essential   */
--line          oklch(0.350 0.015 62)   /* hairlines                                 */
--accent        oklch(0.760 0.150 64)   /* ember amber — the glow, links, focus      */
--accent-2      oklch(0.610 0.150 44)   /* terracotta ember, the Table world         */
--on-accent     oklch(0.180 0.020 60)   /* ink on amber fills                        */

Table-world overrides:
--table-bg      oklch(0.190 0.026 52)   /* warm candlelit brown                      */
--table-glow    oklch(0.300 0.060 58)   /* radial ambient behind the food            */
```

Contrast (verified): ink/bg ~15:1, muted/bg ~6.0:1, accent/bg ~7.5:1, ink/table-bg ~13:1.
Decorative-only colors (faint on bg for captions) are kept at large sizes.

## Typography

Two families, paired on the serif × sans contrast axis. Neither is on the reflex-reject list.

- **Display / serif:** Spectral — weights 300, 400, 400 italic, 500. Used for the name, the
  greeting, section titles, the big logbook numerals, and pull quotes (italic).
- **Body / sans:** Hanken Grotesk — weights 300, 400, 500, 600, 700. Body, labels, nav, UI.

Body weight is 360–400 (light type on dark reads heavier; line-height +0.05). Self-hosted
woff2, `font-display: swap`, hero faces preloaded.

Fluid scale, ratio ~1.26, display capped at 6rem; display tracking -0.02 to -0.03em.

```
--t-2xs .72rem · --t-xs .8rem · --t-sm .9rem · --t-base 1.06rem · --t-md 1.32rem
--t-lg 1.72rem · --t-xl 2.4rem · --t-2xl 3.3rem · --t-display clamp(2.9rem … 6rem)
```

## Layout

- Editorial 12-column grid, max width ~1280px, fluid gutters via `clamp()`.
- Asymmetric, varied tile sizes (feature / wide / standard / tall) — never an identical
  card grid. Spacing varies for rhythm: generous between sections, tight within groups.
- Full-bleed cinematic imagery for hero and section features; the photo is the composition.
- A faint hand-drawn topographic contour line is the recurring divider motif (altitude /
  maps), echoing the Horizons theme. Used sparingly.

## Motion

One orchestrated hero load; everything else is motion that fits what it reveals.

- **Signature:** hero porthole "iris" — the circular self-portrait scales up and un-blurs as
  the greeting sets, scroll cue breathes. Fires once on load.
- **Ledger:** numerals count up when scrolled into view; hairline rules draw in.
- **Horizons:** subtle parallax on feature images; the bouldering triptych reveals left → right
  like watching one move; captions settle after their image.
- **Micro:** image scale 1.03 on hover, link-underline wipe, header condense on scroll.
- Easing: `--ease-out-quart/quint/expo`. Entrances 500–800ms, states 200–300ms, feedback
  100–150ms. No bounce/elastic.
- Texture: a very low-opacity film grain overlay for cinematic warmth (static, cheap).
- **Reduced motion + no-JS:** all content visible by default; reveals are enhancements with a
  failsafe; `prefers-reduced-motion` collapses to instant/crossfade and disables parallax.

## Components / sections

1. **Header** — wordmark + section nav; transparent over hero, condenses to a blurred bar on scroll.
2. **Hero** — full-viewport porthole portrait; "Hello, my name is Alan." + "Let me introduce myself."
3. **Thesis** — one-line statement of the two-worlds idea; bridges into content.
4. **The Logbook** — by-the-numbers ledger (count-up). Placeholder figures, clearly editable.
5. **The Table** — warm world: dinner party + baking; food brings people together.
6. **Horizons** — adventure gallery (skydiving, travel, climbing, marathon, triathlon, cliff
   jump, go-kart) + bouldering triptych.
7. **Connect** — real Instagram handles (@ashaqpics, @climberxclimber, @alansbakedgoods) + colophon.

## Images

All assets are Alan's own, in `assets/img` as optimized webp (+ jpg fallback, `-sm` variants)
served via `<picture>`/`srcset`, lazy below the fold, with voice-driven alt text.
