# geography-world

## Docker

Build the image:

```sh
docker build -t geography-world .
```

Run the container (serves on http://localhost:8080):

```sh
docker run --rm -p 8080:80 geography-world
```

### Pushing to GitHub Container Registry

CI (`.github/workflows/docker.yml`) builds and pushes `ghcr.io/loganphillips792/geography-world`
automatically on every push to `main` (tagged `latest`, `main`, and `sha-<short>`) and on
`v*` git tags (tagged with the version). Pull requests only build; they don't push.

To push manually from your machine, create a
[personal access token (classic)](https://github.com/settings/tokens/new?scopes=write:packages)
with the `write:packages` scope, then:

```sh
# Log in (paste the token when prompted, or pipe it in)
echo "$GHCR_TOKEN" | docker login ghcr.io -u loganphillips792 --password-stdin

# Build and tag
docker build -t ghcr.io/loganphillips792/geography-world:latest .

# Push
docker push ghcr.io/loganphillips792/geography-world:latest
```

To push an additional version tag alongside `latest`:

```sh
docker tag ghcr.io/loganphillips792/geography-world:latest ghcr.io/loganphillips792/geography-world:1.0.0
docker push ghcr.io/loganphillips792/geography-world:1.0.0
```

Pull it anywhere with:

```sh
docker pull ghcr.io/loganphillips792/geography-world:latest
```

The package is **private by default** after the first push. To allow unauthenticated
pulls, open the package on GitHub → Package settings → Change visibility → Public.

## Country identifiers

The app uses **ISO 3166-1 alpha-2** as the canonical country ID (e.g. `us`, `fr`, `xk`),
resolved via the [`i18n-iso-countries`](https://www.npmjs.com/package/i18n-iso-countries)
library. These lowercase alpha-2 codes flow through URLs, click events, and rendering.

### How `resolveAlpha2` works

`resolveAlpha2(geo)` in `src/lib/countries.js` converts a world-atlas TopoJSON geography
into an alpha-2 code:

```js
export function resolveAlpha2(geo) {
  const numericId = String(geo.id).padStart(3, '0')
  const fromNumeric = countries.numericToAlpha2(numericId)?.toLowerCase()
  if (fromNumeric) return fromNumeric
  return NAME_OVERRIDES[geo.properties.name]
}
```

Each `geo` from the TopoJSON carries an `id` (an **ISO 3166-1 numeric** code, e.g. `840`
for the US) and a `properties.name` (display name, e.g. `"Kosovo"`).

1. **Normalize the numeric id.** ISO numeric codes are canonically 3 digits, but the
   TopoJSON drops leading zeros (Albania is `8`, not `008`) and mixes number/string types.
   `String(geo.id).padStart(3, '0')` coerces to a zero-padded string: `8 → "008"`.
2. **Numeric → alpha-2 via the standard.** `countries.numericToAlpha2("840")` maps the ISO
   numeric code to its alpha-2 code (`"US"`), lowercased to the app's canonical `"us"`.
3. **Name fallback.** Natural Earth tags disputed/unrecognized territories with non-ISO
   numeric ids (Kosovo is `-099`), so step 2 returns nothing. For those, it falls back to
   `NAME_OVERRIDES` — a hand-maintained map keyed by `geo.properties.name` (`Kosovo → "xk"`,
   `"N. Cyprus" → "cy"`, `Somaliland → "so"`).

If both fail, it returns `undefined`, and `extractCountriesFromTopology` filters that
geometry out of the game pool. **If a territory doesn't highlight or click, add it to
`NAME_OVERRIDES`.**
