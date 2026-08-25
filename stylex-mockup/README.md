# StyleX mockup

A React + [StyleX](https://stylexjs.com) prototype of [samburkhard.com](https://samburkhard.com). It keeps the current layout, type, and colors, but moves styling from `public/styles.css` into compile-time StyleX tokens and atomic styles.

This is a review mockup. The production site still builds from the Python static site generator.

## Run

```bash
cd stylex-mockup
npm install
npm run dev
```

Then open http://127.0.0.1:5173/

```bash
npm run build
npm run preview
```

## What is ported

- Shared sidebar / main / footer layout, including the 1100px stacked breakpoint
- Light and dark palettes via `stylex.defineVars` and `prefers-color-scheme`
- Home, a published post, both project pages, and 404
- Code blocks with the existing syntax-color tokens
