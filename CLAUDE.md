# cattaneo.uy

Personal site for Bruno Cattáneo (computer engineer, researcher, lecturer at FIT/UCUDAL). Static Jekyll site, bilingual (Spanish/English), deployed via GitHub Pages' native Jekyll build — **no GitHub Actions workflow**. This constraint drives most of the technical decisions below: no custom Jekyll plugins, no theme gem, nothing that isn't in GitHub Pages' safe-mode gem list.

Repo: `bcattaneo/cattaneo.uy`. Production URL is currently `https://bcattaneo.github.io/cattaneo.uy/` (a project page under a subpath); a custom domain (`www.cattaneo.uy`) may be added later — see the linking approach below for why that transition needs no code changes.

## Structure

```
es/index.md, en/index.md            → home page (profile, research, teaching)
es/cursos/, en/teaching/            → course overview + one page per course
_layouts/default.html               → base layout (header/footer)
_layouts/course.html                → course page layout (back link, title, summary)
_includes/header.html, footer.html  → nav, lang toggle
_includes/relurl.html               → see "Internal links" below
_data/ui.yml                        → nav/UI strings per language (es/en)
assets/                             → CSS, images, vendored reveal.js (assets/reveal/)
es/cursos/<course>/slides/*.html+md → per-course reveal.js slide decks, see "Slides" below
index.html                          → root page, detects/redirects to /es/ or /en/
```

## Internal links: `relurl.html`, not `relative_url`

Do **not** use Jekyll's built-in `relative_url` filter or `site.baseurl` for internal links/assets. Instead, every internal `href`/`src` goes through:

```liquid
{% include relurl.html to="/es/cursos/paradigmas-1/" %}
```

This computes a path relative to the *current page's* directory depth (e.g. `../../es/cursos/paradigmas-1/`), based only on `page.url`. It resolves correctly whether the site is served at a domain root or under a GitHub Pages project subpath, with zero config changes — `baseurl` in `_config.yml` is effectively unused/inert. If you add a new internal link anywhere (markdown body, layout, include), use `relurl.html`, not a hardcoded `/es/...` path or `relative_url`.

`relurl.html` handles both permalink styles: pretty permalinks (`page.url` ends in `/`, backed by a real `.../index.html`) and flat file permalinks (`page.url` ends in a filename, e.g. `.../foo.html`) — in the latter, the last path segment is the file itself and doesn't count towards the `../` depth. Slide decks (below) use the flat-file style.

## Slides (reveal.js)

Course slide decks are [reveal.js](https://revealjs.com/) presentations written in plain Markdown, rendered entirely client-side — no build step. reveal.js itself is vendored under `assets/reveal/` (core + the `markdown` and `highlight` plugins). The npm package ships these as `.mjs`; they were renamed to `.esm.js` when vendoring, because some static hosts (GitHub Pages included, historically) don't map the `.mjs` extension to a JS MIME type, which breaks `<script type="module">` imports — `.js`-family extensions are always served correctly.

### Look and feel

The visual style was reverse-engineered from an older, pre-reveal.js deck (a pandoc/Google-IO-template export the user had from previous years) that the user wanted decks to keep looking like. It is **not** any reveal.js stock theme — it's two custom files, and any new deck should reuse them as-is rather than picking a different reveal.js theme:

- `assets/reveal/theme/cattaneo.css` — custom theme (not derived from `simple.css`/`white.css`/etc.). Left-aligned, top-anchored slide content by default (no reveal.js centering — combine with `center: false` in `Reveal.initialize`, see below), dark-gray sans-serif headings, custom bullet markers (`·` for level 1, `-` for nested levels), a flat 30px padding on every slide (`.reveal .slides section { padding: 30px; box-sizing: border-box }`, so cover/divider slides' `height: 100%` flex math stays correct), and `.reveal pre`/`.hljs` styled as a light-gray rounded code box (`#e8e8e8` background) rather than reveal.js's usual dark code theme.
- `assets/reveal/plugin/highlight/cattaneo-light.css` — custom highlight.js color overrides matching that gray code box: blue keywords, green strings, gray italic comments, and a reddish-orange for literals/built-ins (`Infinity`, `Array`, `Math`, etc.) — approximating the original deck's `google-code-prettify` coloring using highlight.js's token classes instead.
- The `<script type="module">` init block sets `center: false` (top-align instead of reveal.js's default vertical centering, so regular content slides get "title top-left" not centered) and `slideNumber: 'c/t'`.
- An untagged code fence lets highlight.js auto-detect the language, which can mis-highlight plain text/ASCII art as an unrelated language (seen once with an ASCII expression tree misdetected as GML) — always tag fences explicitly (` ```javascript `, ` ```haskell `, or ` ```text ` for non-code content).

**Cover/divider slides**: the deck's title slide and any slide meant to read as a section break (one per unit/topic, plus the closing "Fin" slide in the original deck) are visually different from regular content slides — instead of top-anchored, the heading is vertically centered within whatever space is left below the slide's own list content (or within the whole slide, if there's no list). These slides are marked with a per-slide Markdown attribute comment: `<!-- .slide: data-background-color="#ffffff" -->` for the title slide, `<!-- .slide: data-background-color="#4d4d4d" -->` for dividers.

They're keyed off **`data-background-color`, not a custom class** (e.g. NOT `<!-- .slide: class="segue" -->`) — this was a real bug, not just a style choice: the reveal.js markdown plugin's `.slide: class="..."` handling calls `element.setAttribute("class", ...)`, which *replaces* the whole class attribute rather than adding to it, and can race with reveal.js's own present/past/future state classes on that same `<section>` — in practice the class silently failed to have any visible effect. `data-background-color` doesn't have this problem: reveal.js core reads it directly off the section (`getAttribute("data-background-color")`) every time it updates backgrounds, so `section[data-background-color]` is a reliable CSS hook, and reveal.js *also* natively adds `has-dark-background`/`has-light-background` based on that color's luminance (used above for the white-text-on-dark rule) — both are core reveal.js behavior, not the markdown plugin's fragile attribute-comment path. If a future divider needs a *non-dark* background for some reason, giving it any explicit `data-background-color` value (even white, like the title slide) is what puts it in this "cover" layout — omitting the attribute entirely leaves a slide as a normal top-anchored content slide.

Mechanism: `section[data-background-color]` is a flex column (`height:100%`), with any `ul` given `order:1` (stays at its natural top position — nothing pushes it). The heading group is centered in the leftover space using auto margins on *both* sides of the group — an auto margin before it and another after it split the remaining space evenly, floating the group in the middle rather than pinning it to either edge:

- `h1` gets `order:2; margin-top:auto` only — it's always followed by `h3` (the title slide's subtitle) which carries the closing `margin-bottom:auto`, so the pair centers together as a unit with just their normal small margin between them (subtitle sits right under the title, not detached from it).
- `h2` (a divider's heading, never followed by a subtitle) gets `order:2` with **both** `margin-top:auto` and `margin-bottom:auto` on itself, since there's no later element to carry the closing margin — it centers alone.
- `h3`/`p` get `order:3; margin-bottom:auto`.

- **Title slide**: `data-background-color="#ffffff"` (explicit, not omitted — omitting it means "regular top-anchored slide", not "cover slide with a white background"). `h1` + `h3` center together as described above.
- **Unit/section dividers** (not the title slide): `data-background-color="#4d4d4d"` triggers both the layout above AND (via reveal.js's native `has-dark-background` class) white text. The slide's own bullet list (its content, e.g. "Cronograma / Metodología / Calificación" on the "Operativa del curso" slide) stays pinned near the top in a dimmer muted gray (`#b3b3b3`, not full white — de-emphasized relative to the title), while the big bold white `h2` centers in the space below it.
- All the `[data-background-color]` flex/order/margin rules use `!important` — added defensively while debugging why an early version of this appeared to have zero effect (turned out to be the `class="segue"` bug below, not a cascade problem, but the `!important` is harmless to leave in and guards against any future specificity surprise from reveal.js core).
- Don't reach for `justify-content: center` here — an earlier, wrong attempt centered the heading+list as one geometric block, which doesn't match the reference (list pinned top, heading pinned bottom, with a gap — not a single centered unit). The auto-margin approach above is the one that actually replicates it.

Do not reintroduce `simple.css`/`white.css`/`black.css` or highlight.js's bundled `monokai.css`/`zenburn.css` — they were deliberately removed (uppercase headings, centered text, dark code themes, or in `white.css`'s/`black.css`'s case a ~570KB embedded base64 webfont) in favor of the two custom files above.

### File layout

Each deck is a pair of sibling files, e.g. for Paradigmas 2 UT0:

```
es/cursos/paradigmas-2/slides/ut0-introduccion.html   ← reveal.js shell (front matter, no `layout:` key)
es/cursos/paradigmas-2/slides/ut0-introduccion.md      ← the actual slide content, NO front matter
```

The `.md` file has **no front matter**, so Jekyll copies it through unprocessed as a static file (Jekyll only converts markdown that has front matter) — this is required, because reveal.js's markdown plugin fetches it raw at runtime via `data-markdown="ut0-introduccion.md"` (bare relative filename, resolved by the browser against the `.html` file's own location).

The `.html` file has front matter with an **explicit flat `permalink`** matching its own source path (e.g. `permalink: /es/cursos/paradigmas-2/slides/ut0-introduccion.html`) and **no `layout` key** — this keeps Jekyll's Liquid processing (needed for `relurl.html` asset paths) but skips the site's `default` layout (a slide deck must not get the header/footer/site CSS) and, crucially, avoids `permalink: pretty` wrapping the page in its own directory, which would break the co-located `.md` reference.

Slides use reveal.js's default separators: a lone `---` on its own line between horizontal slides (this is also valid Markdown, so the file reads fine as plain markdown too).

### Converting an existing (non-reveal.js) deck

When the user hands over an old slide deck (e.g. a pandoc/Google-IO-style export, PowerPoint/Google Slides HTML export, etc.) to convert:

1. Read the raw HTML's slide markup directly (grep for the slide/section wrapper tags) rather than loading the whole file with Read — these exports commonly embed base64 images/fonts that are enormous in tokens.
2. Use BeautifulSoup + `pandoc -f html -t gfm` (both available) to convert each slide's inner HTML into clean Markdown — far more reliable than hand-transcribing.
3. Extract embedded `data:` image URIs to real files (decode the base64, save under e.g. `assets/img/slides/<deck>/`) rather than leaving huge inline data URIs in the Markdown; for simple decorative logos, consider just dropping them and keeping the text instead (avoids depending on hotlinked third-party image URLs).
4. Watch for slide content that was rendered dynamically at runtime by the original template (e.g. a Graphviz/htmlwidget `<div>` left empty in the static HTML) — the real data is often still present elsewhere in the file (e.g. in a sibling `<script type="application/json">` block); check before assuming the content is lost.
5. Tag every code fence with its real language, and double-check dates/years in the converted content against the current course page — old decks get reused as templates across years and commonly have last year's dates/year still in them. The user's course source material lives *outside* this repo, in `~/projects/ucu_cursos/<course>/<year>/` (e.g. `~/projects/ucu_cursos/paradigmas2/2026/`), typically containing the syllabus PDF, a `source.md` (the pandoc source the PDF was generated from), and a `slides/` folder with the old per-unit HTML decks to convert. If a slide's schedule looks stale, check that directory for `source.md` first — it's the authoritative, currently-maintained schedule (same content already used for this repo's course page), and is more likely to be current than a slide deck that's just been copied forward from a previous year's edition.
6. Do a `jekyll build` (or check `_site` output) to confirm the page/asset paths resolve and there are no build errors — but **do not** spin up `google-chrome --headless` or any browser automation to visually check the rendered slides. The user tests visual changes themselves with `jekyll serve` and reports back what's wrong (headless Chrome startup is slow here and redundant with the user just looking at it). A `curl`/build-output check for 200s and correct relative paths is the right amount of automated verification; anything visual is the user's call.

To add a brand-new deck (not converting anything): copy an existing `.html`/`.md` pair, update the `permalink` and `<title>` in the `.html`, replace the `.md` content (title slide + section-divider slides need the `data-background-color` attribute comment, see above), and link it from the course page via `{% include relurl.html to='/es/cursos/.../slides/....html' %}` (see the "Material" section pattern in `es/cursos/paradigmas-2.md`).

**Withholding a deck until its unit is over**: this is a fully static site with no backend/Actions, so there's no real access control available — anything client-side (a JS password prompt, hiding a `<section>` with CSS) is cosmetic, since the full page is still fetched by the browser regardless. The convention used instead is *unlisting*: the deck's `.html`/`.md` pair is committed and deployed as usual (so the user can reach it directly by URL), but its entry in the course page's "Material" list is written as plain struck-through text instead of a Markdown link — e.g. `~~UT1 — Programación funcional~~ (presentación disponible al finalizar la unidad)` instead of `[UT1 — Programación funcional]({% include relurl.html to='...' %})`. kramdown's `input: GFM` (see `_config.yml`) renders `~~...~~` as `<del>`, so no extra config is needed. This only deters casual browsing, not URL-guessing — the deck is still live at its normal permalink the whole time. Once the unit wraps up, swap the struck-through text back for a real link.

## Bilingual content

Every content page has front matter:

- `lang`: `es` or `en`
- `alt_url`: absolute path to the translated counterpart (consumed via `relurl.html` for the language toggle)
- `section`: `home` or `teaching` (drives active-nav highlighting)
- Course pages also have `teaching_url` (path back to the course overview in that language)

There's no shared content source between languages — `es/*.md` and `en/*.md` are independent files kept in sync by hand. When editing one language's content, check whether the same change applies to its `alt_url` counterpart.

## Adding a course

Copy an existing course file in both `es/cursos/` and `en/teaching/`, update the front matter (`title`, `alt_url`, `teaching_url`, `summary`) and body (description, schedule table, grading, bibliography), then add a list entry in `es/cursos/index.md` and `en/teaching/index.md`.

## Gemfile

`Gemfile` pins plain `jekyll` (not `github-pages`) so `jekyll serve`/`bundle install` work locally without installing the heavy `github-pages` gem bundle. GitHub Pages' native build **ignores the repo's Gemfile entirely** — it always builds with its own fixed Jekyll+plugin environment — so this simplification has no effect on production, only on local dev convenience.

## Working conventions

- **Never run `git commit` or `git push`** in this repo — the user commits and pushes everything themselves. Make the requested edits, leave them in the working tree, and say what changed.
- Don't add a theme gem, a custom Jekyll plugin, or a GitHub Actions workflow — the whole point of this setup is that `git push` alone rebuilds and deploys the site.
