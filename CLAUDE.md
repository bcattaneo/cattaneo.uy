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
assets/                             → CSS and images
index.html                          → root page, detects/redirects to /es/ or /en/
```

## Internal links: `relurl.html`, not `relative_url`

Do **not** use Jekyll's built-in `relative_url` filter or `site.baseurl` for internal links/assets. Instead, every internal `href`/`src` goes through:

```liquid
{% include relurl.html to="/es/cursos/paradigmas-1/" %}
```

This computes a path relative to the *current page's* directory depth (e.g. `../../es/cursos/paradigmas-1/`), based only on `page.url`. It resolves correctly whether the site is served at a domain root or under a GitHub Pages project subpath, with zero config changes — `baseurl` in `_config.yml` is effectively unused/inert. If you add a new internal link anywhere (markdown body, layout, include), use `relurl.html`, not a hardcoded `/es/...` path or `relative_url`.

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
