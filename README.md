# cattaneo.uy

Sitio personal de Bruno Cattáneo. Es un sitio estático hecho con [Jekyll](https://jekyllrb.com/), bilingüe (español/inglés), sin build steps ni JavaScript de frontend más allá del toggle de idioma.

## Editar contenido

Todo el contenido es Markdown:

- `es/index.md` / `en/index.md` — página de inicio (perfil, investigación, docencia)
- `es/cursos/index.md` / `en/teaching/index.md` — overview de cursos
- `es/cursos/*.md` / `en/teaching/*.md` — una página por curso (descripción, cronograma, evaluación, bibliografía)

Para agregar un curso nuevo: copiá un archivo de curso existente (en ambos idiomas), ajustá el front matter (`title`, `alt_url`, `teaching_url`, `summary`) y el contenido, y sumalo a la lista en `es/cursos/index.md` / `en/teaching/index.md`.

## Compilar y ver el sitio localmente

```bash
jekyll serve
```

Y abrís `http://localhost:4000`. Si `jekyll` no está instalado: `gem install --user-install jekyll` (necesita `ruby-dev` para compilar extensiones nativas).

## Deploy

El deploy es automático vía **GitHub Pages** (Settings → Pages → "Deploy from a branch"). No hay ningún workflow de GitHub Actions: alcanza con hacer `git push` a la branch configurada y GitHub compila el sitio con Jekyll nativamente.
