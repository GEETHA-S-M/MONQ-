# monq. — website

A static site built from the product photography in this folder. No build step,
no dependencies — open `index.html` and it runs.

## Run it

Double-click `index.html`, or serve it locally (nicer, avoids `file://` quirks):

```bash
python -m http.server 5599
```

Then open <http://localhost:5599>.

## Structure

```
index.html                    homepage — every marketing section
faq.html                      full FAQ, grouped by category
cart.html                     full cart page (line items, qty, subtotal)
checkout.html                 front-end checkout — address form + order summary
track-order.html              order lookup + a signed-in user's order history
shipping-delivery.html        customer-facing delivery FAQ (not the legal policy)
privacy-policy.html           legal — placeholder, needs a real review
terms.html                    legal — placeholder, needs a real review
shipping-policy.html          legal — placeholder, needs a real review
return-refund-policy.html     legal — placeholder, needs a real review
blog.html                     "The Journal" — article index
blog-*.html                   four articles (monk fruit, comparisons, baking, diabetes)
assets/css/style.css          all styling, design tokens at the top of the file
assets/js/main.js             tilt engine, hero slider, 360 viewer, cart, checkout, reveals
assets/img/                   web-optimised cut-outs derived from the source PNGs
```

Every page shares the same header, footer, cart drawer, and sign-in/sign-up
modal — copy-pasted into each file rather than templated, since there's no
build step. Editing shared chrome (nav links, footer columns, the WhatsApp
button) means repeating the change across every `.html` file.

The original photography stays untouched in the folder root. Everything in
`assets/img/` was generated from it — background-keyed, trimmed, and converted
to WebP (the 300 MB of source PNGs became about 3 MB of page weight).

| Asset | Source | What was done |
| --- | --- | --- |
| `sachet-hero.*` | `ChatGPT Image Aug 26 … 04_51_28 PM` | Rotated 13.2° upright (measured off the alpha mask's principal axis), trimmed, 1600 px tall. PNG + WebP. |
| `pack-0…5.webp` | `ChatGPT Image Aug 26 … 11_58_37 PM` | The 8-up sprite sheet split into separate poses, stray fragments from neighbouring cells removed, then scaled to a common pack length so the 360 viewer doesn't jump between frames. |
| `stick.webp`, `stick-pour.webp` | same sprite sheet | The two horizontal stick-pack poses. |
| `fruit-whole`, `fruit-float` | the white-background shots | White keyed out by flood-filling from the borders, with a soft alpha ramp at the edges so there's no halo on the dark background. |
| `fruit-cross`, `fruit-cracked` | already had alpha | Trimmed and resized. |
| `wood.webp` | `3D img_…` | Kept as a photograph for the Our Story figure. |
| `logo.png`, `logo-lockup.png` | `logo.png` | Cream wordmark separated from its brown field, so it sits on any background. `logo.png` is the wordmark alone; `logo-lockup.png` keeps the tagline. |

## The hero's 3D tilt

`assets/js/main.js` runs one `requestAnimationFrame` loop that eases the pointer
position and drives four things at once:

- **The pack** gets a real `rotateX/rotateY/rotateZ` inside a 1500 px perspective,
  pivoting at its base (`transform-origin: 50% 88%`) so it turns like an object
  standing on the plinth rather than spinning around its middle.
- **A specular sheen** masked to the pack's own silhouette. Its angle and
  brightness track the tilt, so light sweeps the foil as the face turns.
- **The cast shadow** shifts against the tilt.
- **Everything with `data-depth`** parallaxes — fruit toward the pointer, cards
  away from it. Depth is written as `--dx`/`--dy` custom properties rather than a
  full `transform`, so each element keeps whatever rotation its own rule sets.

With no pointer the loop breathes gently instead of freezing, and it stops
entirely when the hero scrolls out of view. `prefers-reduced-motion` skips it.

## Notes

- Scroll reveals use a position sweep rather than `IntersectionObserver`: an
  anchor jump can carry a section past the viewport without IO ever firing,
  which would strand that content invisible.
- The floating SHOP NOW pill only appears above 1180 px, where the layout
  reserves a slot for it above the card column. Narrower, it would land on the
  hero cards.
- The cart, checkout, and accounts are all front-end only — no server, no
  payment processor. The cart persists to `localStorage` (`monq.cart`) so it
  survives navigating between pages; checking out writes a mock order to
  `monq.orders`, keyed to the signed-in email, which `track-order.html` then
  reads back. Swap the `setTimeout` calls in `main.js` (cart, auth, checkout,
  contact form, newsletter) for real requests to make any of it live.
- Order "status" on the tracking page is simulated from elapsed time since
  the order was placed (Placed → Packed → Shipped → Delivered), not a real
  fulfilment feed.
- Fonts come from Google Fonts with system fallbacks, so the page still reads
  correctly offline.
