# Final report – Bartending Simulator

## What was built

A fully static React + Vite + TypeScript single-page app (Tailwind CSS 4, Framer Motion, Zustand, React Router) that deploys to Cloudflare Pages with `npm run build` and output folder `dist`. Everything is bundled locally; the site makes no network calls at runtime.

### Free Bar (`/bar`)
- Back bar with 14 shelf categories (Vodka, Gin, Rum, Tequila, Whiskey, Brandy & Others, Liqueurs, Vermouth & Bitters, Wine & Sparkling, Juices, Soft Drinks & Sodas, Syrups, Cream/Eggs/Coffee, Pantry & Produce) plus a Garnishes tray – 136 bottles/items drawn as SVG with distinct shapes, labels, glass tints and liquid colours.
- Tools: cobbler shaker (cap closes and shakes), mixing glass (bar spoon stir animation), blender, jigger with selectable sides (15/22.5/30/45/60 ml) that never overfills, bar spoon, Hawthorne strainer, muddler, ice bucket with cubes and crushed ice.
- Glasses: highball, collins, rocks, coupe, martini, margarita, shot, hurricane, flute, wine, copper mug, Irish coffee mug.
- Pouring: drag a bottle over a glass/shaker/mixing glass/blender/jigger and hold. The bottle tilts, a liquid stream animates into the vessel, a live counter shows ml and oz, the vessel fills with the ingredient colour and successive ingredients layer with their real colours. Over-pouring and overflowing are possible on purpose.
- Rimming: drag the empty glass onto the lime wedge dish (wet), then onto salt or sugar. Salt/sugar only sticks to a wet rim.
- Garnishes: 22 garnishes (lime wedge, lime wheel, lemon twist, lemon wheel, lemon wedge, orange slice, orange twist, mint sprig, cherry, olive, cucumber, umbrella, straw, nutmeg, pineapple wedge, celery, berries, coffee beans, cocktail onion, candied ginger, apple slice, cinnamon stick) dropped onto the glass with a spring animation.
- No undo. Drag the glass to the bin to dump it (animated) and start again. Side panel lists every ingredient and amount in the glass, shaker, mixing glass, blender and jigger.
- Serve in free mode identifies the closest recipe in the library and scores it.

### Recipe Library (`/recipes`)
- **212 cocktails**, 89 of them IBA official recipes (Unforgettables, Contemporary Classics and New Era), plus simple mixed drinks (Vodka 7Up, Rum & Coke, Gin & Tonic, Screwdriver…) and advanced drinks (Ramos Gin Fizz, Clover Club, Aviation, Last Word, Zombie, Mai Tai…).
- Every recipe has name, image, glass, ingredients with amounts in ml and oz, method (build/shake/stir/blend/layer), ice, rim, garnish, difficulty (67 easy / 110 medium / 35 hard) and a description.
- Search by name; filter by base spirit, difficulty, method and glass. The detail page shows the finished drink, the full spec and bartender's notes.
- Guided mode (`/bar/guided/:id`) builds an ordered step list (glass, rim, ice, each pour with amount, muddle, shake/stir/blend, strain, toppers, garnish, serve), highlights the exact bottle/tool/glass needed, auto-opens the right shelf, checks each amount at ±15 % and flags over-pours. Serving shows the score and a yours-vs-recipe comparison.

### Challenge Mode (`/challenge`, `/bar/challenge/:id`)
- Pick easy, medium, hard or any. Only the name and image are shown. Serve scores out of 100: correct ingredients (30), amounts within tolerance (20), glass (10), method (15), ice (10), rim (5), garnish (10), each with a plain-language explanation of what was wrong, and the real recipe afterwards.
- Progress page (`/progress`): mastered cocktails per difficulty, attempts, challenges, pass count, current and best streak, recent results and every cocktail tried – persisted in `localStorage`.

## Data integrity
- 136 ingredients with realistic liquid colours and opacities; brand variants (e.g. three vodkas) resolve to the canonical ingredient for scoring.
- Vitest data-integrity suite (`src/data/integrity.test.ts`) fails if a recipe uses an ingredient/glass/garnish the bar does not have, lacks a positive amount, has an unrealistic amount or does not fit its glass, stirs juice/dairy, blends without crushed ice, layers fewer than two ingredients, puts a rim where there should be none, or drifts from an IBA spec (87 IBA recipes cross-checked against a built-in table). It also validates that every recipe image exists locally and is a real JPEG/PNG over 5 KB or a valid SVG.

## Images
- 126 recipe photos downloaded during development from TheCocktailDB (`/large` variant, ~35 KB each) into `public/drinks/`, validated by size and magic bytes.
- 86 recipes with no exact match in TheCocktailDB use a generated SVG of the finished drink (correct glass, mixed liquid colour, ice, rim, garnish) produced by `src/lib/drinkSvg.ts`.
- The `<RecipeImage>` component also falls back to an inline-generated SVG if a file ever fails to load, so no image can be broken.
- Bottles, glasses, tools, ice and garnishes are SVG components drawn in code.

## Test results (final run)
| Check | Result |
| --- | --- |
| `npm run build` (tsc -b + vite build) | passes, 0 errors |
| `npm run lint` (ESLint 10 + typescript-eslint + react-hooks) | passes, 0 errors, 0 warnings |
| `npm test` (Vitest) | 38 tests passed in 5 files: units, pouring maths, scoring, guided steps, data integrity + images |
| `npm run test:e2e` (Playwright, Chromium, production build) | 14 tests passed: every screen loads with zero console errors and zero broken images; Vodka 7Up made in Free Bar; drink dumped in the bin; salt rim (and rejection without a wet rim); shaker shake/strain; jigger cap; guided Margarita completed (score ≥ 90); Negroni challenge scored (≥ 90) and saved to progress; a wrong challenge explains each error; mobile 390 px layout |

## Screenshots
Written by the e2e suite to `docs/screenshots/` (1440×1000 unless noted):

| File | Screen |
| --- | --- |
| `01-home.jpg` | Home |
| `02-free-bar.jpg` | Free Bar, empty counter |
| `03-recipes.jpg` | Recipe Library |
| `04-recipe-detail.jpg` | Recipe detail (Margarita) |
| `05-challenge-picker.jpg` | Challenge difficulty picker |
| `06-progress-empty.jpg` | Progress page, fresh |
| `07-mobile-bar.jpg` | Free Bar at 390×844 |
| `08-free-bar-vodka-7up.jpg` | Vodka 7Up built in Free Bar |
| `09-free-bar-served.jpg` | Free Bar serve result (identified as Vodka 7Up) |
| `10-after-dump.jpg` | After dumping a drink |
| `11-salt-rim.jpg` | Rim dip animation |
| `12-guided-margarita-built.jpg` | Guided Margarita, all steps done |
| `13-guided-result.jpg` | Guided result with comparison |
| `14-challenge-bar.jpg` | Challenge bar (name + image only) |
| `15-challenge-result.jpg` | Challenge score breakdown |
| `16-progress.jpg` | Progress after a mastered challenge |
| `17-challenge-wrong.jpg` | Challenge result explaining mistakes |

## Deployment
See the README section "Deploy to Cloudflare Pages": Connect to Git, build command `npm run build`, output directory `dist`, Node 22 (`.node-version`). `public/_redirects` handles client-side routing.
