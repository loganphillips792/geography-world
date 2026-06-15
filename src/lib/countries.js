import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { countries as COUNTRY_DATA, continents as CONTINENT_NAMES } from 'countries-list'

countries.registerLocale(enLocale)

export { CONTINENT_NAMES }

// Continents not in countries-list for territories the topology renders
// (e.g. N. Cyprus, Somaliland). Match by alpha-2 from NAME_OVERRIDES.
const CONTINENT_OVERRIDES = {
  cy: 'EU',
  so: 'AF',
  xk: 'EU',
}

export function getContinent(alpha2) {
  if (!alpha2) return null
  return COUNTRY_DATA[alpha2.toUpperCase()]?.continent || CONTINENT_OVERRIDES[alpha2] || null
}

// Natural Earth tags disputed/unrecognized territories with non-ISO numeric ids
// (e.g. -099 for Kosovo), so numericToAlpha2 returns undefined. Fall back to name.
export const NAME_OVERRIDES = {
  Kosovo: 'xk',
  'N. Cyprus': 'cy',
  Somaliland: 'so',
}

// Display-name overrides keyed by alpha-2, applied on top of i18n-iso-countries
// and topology names so the app shows the country's preferred endonym.
const DISPLAY_NAME_OVERRIDES = {
  tr: 'Türkiye',
}

export function getCountryName(alpha2, fallback = null) {
  if (!alpha2) return fallback
  const code = alpha2.toLowerCase()
  if (DISPLAY_NAME_OVERRIDES[code]) return DISPLAY_NAME_OVERRIDES[code]
  return countries.getName(code.toUpperCase(), 'en') || fallback
}

export function resolveAlpha2(geo) {
  const numericId = String(geo.id).padStart(3, '0')
  const fromNumeric = countries.numericToAlpha2(numericId)?.toLowerCase()
  if (fromNumeric) return fromNumeric
  return NAME_OVERRIDES[geo.properties.name]
}

export function extractCountriesFromTopology(topology) {
  if (!topology) return []
  const geoms = topology.objects?.countries?.geometries ?? []
  return geoms
    .map((g) => {
      const alpha2 = resolveAlpha2(g)
      return { alpha2, name: getCountryName(alpha2, g.properties.name), continent: getContinent(alpha2) }
    })
    .filter((c) => c.alpha2)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export { countries }
