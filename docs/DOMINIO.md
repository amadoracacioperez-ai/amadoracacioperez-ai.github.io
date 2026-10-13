# Conectar un dominio propio

Ahora mismo la web se publica en **https://amadoracacioperez-ai.github.io**, con GitHub Pages. Esta
guía explica cómo pasarla a un dominio propio (por ejemplo `amadoracacio.com`).

## 1. Comprar el dominio

Puedes comprarlo en cualquier registrador: Cloudflare, Namecheap, OVH, IONOS, Gandi… El precio habitual de
un `.com` está entre 10 y 15 € al año.

## 2. Configurar el DNS en el registrador

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | 185.199.108.153 |
| A | `@` | 185.199.109.153 |
| A | `@` | 185.199.110.153 |
| A | `@` | 185.199.111.153 |
| AAAA | `@` | 2606:50c0:8000::153 |
| AAAA | `@` | 2606:50c0:8001::153 |
| AAAA | `@` | 2606:50c0:8002::153 |
| AAAA | `@` | 2606:50c0:8003::153 |
| CNAME | `www` | `amadoracacioperez-ai.github.io` |

Si el DNS está en Cloudflare, pon los registros en modo **"DNS only"** (nube gris) mientras GitHub emite el
certificado HTTPS.

## 3. Verificar el dominio en GitHub (recomendado)

1. Ve a GitHub → *Settings* (de la cuenta) → *Pages* → *Add a domain*.
2. GitHub te da un registro TXT. Añádelo en el DNS y pulsa *Verify*.

Esto evita que otra persona pueda usar tu dominio en GitHub Pages.

## 4. Poner el dominio en el repositorio

1. Ve a *Settings* del repo → *Pages* → *Custom domain*.
2. Escribe `amadoracacio.com` (o el dominio que sea) y pulsa *Save*.

También se puede hacer desde la terminal:

```bash
GH_TOKEN=$(gh auth token -u amadoracacioperez-ai) gh api -X PUT \
  repos/amadoracacioperez-ai/amadoracacioperez-ai.github.io/pages -f cname=amadoracacio.com
```

> Si el despliegue se hace con GitHub Actions, el fichero `CNAME` se ignora. El dominio se configura
> solo en los ajustes de Pages.

## 5. Activar HTTPS

Cuando GitHub compruebe el DNS (de unos minutos a 24 h), marca **Enforce HTTPS** en *Settings → Pages*.

## 6. Actualizar la web

- `astro.config.mjs` → `SITE_URL = 'https://amadoracacio.com'`
- `src/config/site.ts` → `url: 'https://amadoracacio.com'`
- `public/robots.txt` → la línea `Sitemap:`
- `public/og/og-image.png` → la imagen lleva la URL escrita. Regenérala o pide a Claude que lo haga.

Después, haz commit y push. La dirección antigua `amadoracacioperez-ai.github.io` redirigirá sola al
dominio nuevo.
