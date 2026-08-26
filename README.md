# laestoa.cl

Una cita estoica al día, en español, servida por un Cloudflare Worker. Las visitas del mismo día civil en America/Santiago ven la misma cita.

Fuentes y criterio de dominio público: [docs/fuentes.md](docs/fuentes.md).

## Local

Hace falta Node 24 (`.nvmrc`).

```bash
npm ci
npm test
npm run check
npm run dev
```

`npm run dev` abre el Worker en http://localhost:8787. Sin cabecera de navegador, `curl` recibe texto plano.

## Deploy

```bash
npm run deploy
```

GitHub Actions despliega al empujar a `main` (`cloudflare/wrangler-action@v4`). Secretos del repositorio:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

No hace falta activar Cloudflare Workers Builds: el Action ya publica el Worker.

## Dominio

`wrangler.toml` enlaza el Worker a `laestoa.cl` (`custom_domain = true`). La zona tiene que existir ya en la cuenta. Si el deploy falla por un CNAME anterior, bórralo en DNS y vuelve a desplegar. No se inventa un `zone_id`.

## Foro

No está hecho. Ver [docs/foro.md](docs/foro.md).
