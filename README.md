# Bartending Simulator

A realistic, fully static web bar that teaches a beginner to make cocktails and lets them practise until they can work like a pro. No backend, no runtime API calls, works offline after the first load.

- **Free Bar** – shelves of bottles grouped by category, glass rack, shaker, mixing glass, blender, jigger, bar spoon, strainer, muddler, ice bucket (cubes and crushed), rim station (lime, salt, sugar), garnish tray and a garbage bin. Drag a bottle over a glass and hold to pour; a live counter shows ml and oz while the glass fills with the real liquid colour.
- **Recipe Library** – 212 cocktails (89 IBA official recipes plus popular bar drinks) with exact amounts in ml and oz, glass, method, ice, rim, garnish, difficulty and a photo or generated preview. Search and filter by base spirit, difficulty, method and glass. Guided mode walks you through each step with ±15 % tolerance.
- **Challenge Mode** – pick a difficulty, get only a name and a photo, build the drink from memory and press Serve for a score out of 100 with a full breakdown. Progress, best scores, mastered cocktails and streaks are saved in `localStorage`.

## Tech stack

React 19, Vite 8, TypeScript, Tailwind CSS 4, Framer Motion, Zustand, React Router. Unit tests with Vitest, end-to-end tests with Playwright.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ on http://127.0.0.1:4173
```

Quality checks:

```bash
npm run lint       # ESLint
npm test           # Vitest: scoring, pouring maths, guided steps, data integrity, image validation
npm run test:e2e   # Playwright against the production build (starts vite preview itself)
```

The data-integrity tests fail the build if any recipe uses an ingredient, glass or garnish that the bar does not have, if an amount is unrealistic or does not fit the glass, if a stirred drink contains juice or dairy, if an IBA recipe drifts from the official spec, or if any recipe image is missing, too small or not a real JPEG/PNG/SVG.

## Deploy to Cloudflare Pages (Connect to Git)

1. Push this repository to GitHub (or GitLab).
2. In the Cloudflare dashboard open **Workers & Pages → Create → Pages → Connect to Git** and select the repository.
3. Use these build settings:
   - **Framework preset:** Vite (or None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave empty)
   - **Environment variables:** set `NODE_VERSION` to `22` (the repo also ships a `.node-version` file). Do not set `NODE_ENV=production`, because the build tools are dev dependencies.
4. Click **Save and Deploy**. Every push to the production branch triggers a new deploy; other branches get preview URLs.

`public/_redirects` contains `/* /index.html 200` so client-side routes such as `/recipes/margarita` work when opened directly.

## Images

Recipe photos were downloaded once, during development, from [TheCocktailDB](https://www.thecocktaildb.com) (public test key) into `public/drinks/`. Each file was validated (exists, larger than 5 KB, real JPEG or PNG magic bytes). Any recipe without a valid photo gets a generated SVG of the finished drink in the correct glass with the correct liquid colour, ice, rim and garnish. The mapping lives in `src/data/recipeImages.json`; nothing is fetched at runtime.

To refresh the images (development only):

```bash
npm run images:fetch     # downloads/validates, generates SVG fallbacks, removes stale files
npm run images:verify    # offline re-validation; regenerates SVGs for anything invalid
```

Bottles, glasses, tools, ice and garnishes are SVG graphics drawn in code (`src/components/svg`, `src/lib/glassShapes.ts`).

## Demo video

`public/demo.mp4` is a 63-second, 1920x1080 walkthrough of every feature with an original lounge soundtrack. It is served at `/demo.mp4` once deployed. To regenerate it (development only):

```bash
npm run build && npm run preview &            # serve dist on 127.0.0.1:4173
node scripts/demo/record.mjs /tmp/demo-clips   # Playwright drives the site and records one clip per scene
python3 scripts/demo/music.py /tmp/lounge.wav 70   # composes the soundtrack with numpy
python3 scripts/demo/build_video.py /tmp/demo-clips /tmp/lounge.wav public/demo.mp4 63   # ffmpeg assembly
```

## Project layout

```
public/drinks/            bundled recipe images (jpg or generated svg)
scripts/                  development image pipeline
src/data/                 ingredients, glasses, garnishes, recipes, image map
src/lib/                  pure logic: units, pouring maths, colour mixing, scoring, guided steps, SVG renderer
src/store/                Zustand bar state and persisted progress
src/components/bar/       shelf, counter, drag layer, panels, result modal
src/components/svg/       bottle, glass and tool graphics
src/pages/                Home, Free Bar / Guided / Challenge, Recipes, Recipe detail, Challenge picker, Progress
e2e/                      Playwright tests; screenshots are written to docs/screenshots/
```

## How the simulation works

- **Pouring** – a bottle held over a vessel tilts after 250 ms and then flows at 25 ml/s (just under 1 oz/s). Dasher bottles release one dash every 0.4 s, sugar one teaspoon every 0.5 s, produce one piece every 0.45 s. Pouring too much is allowed; there is no undo, only the bin.
- **Jigger** – pour a bottle into the jigger (15/22.5/30/45/60 ml, never overfills), then drag the jigger to a glass or shaker.
- **Shaker / mixing glass / blender** – add ice and ingredients, press Shake / Stir / Blend (or drag the bar spoon onto the mixing glass), then Strain / Pour into the glass on the counter. Shaking without ice is recorded and costs method points.
- **Rimming** – drag the empty glass onto the lime dish to wet the rim, then onto salt or sugar. Salt only sticks to a wet rim.
- **Layering** – hook the bar spoon over the glass (drag it there or press "Layer over spoon") before pouring layered shots.
- **Scoring** – ingredients 30, amounts within ±15 % 20, glass 10, method 15, ice 10, rim 5, garnish 10. Score 70 to pass a challenge, 90 to master a cocktail.
