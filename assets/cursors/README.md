# Cursors

| File             | Used for                                             |
|------------------|------------------------------------------------------|
| `openhand.svg`   | cursor when hovering over the scratcher              |
| `closedhand.svg` | cursor while scratching                              |

Everywhere else on the site uses the visitor's normal system cursors.

Both are set in the "Custom cursors" section at the bottom of `style.css`,
each with a hotspot (the point that sits on the mouse position; `16 16` is the
center of a 32 × 32 image).

## Replacing images

- Keep them **32 × 32 or smaller**, with `width` and `height` on the `<svg>`
  tag, otherwise browsers treat them as 150 × 150.
- Keep a **contrasting outline** on the cursors so they're visible on both the
  gray cover and white.

## Accessibility

- Visitors with high contrast turned on in their system get system cursors
  automatically.
- Touch devices never get custom cursors.
