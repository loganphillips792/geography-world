// Maps US Census FIPS codes (used by us-atlas) to postal abbreviations and names.
// Includes 50 states + DC + Puerto Rico (the territories us-atlas may include).
export const FIPS_TO_STATE = {
  '01': { postal: 'al', name: 'Alabama' },
  '02': { postal: 'ak', name: 'Alaska' },
  '04': { postal: 'az', name: 'Arizona' },
  '05': { postal: 'ar', name: 'Arkansas' },
  '06': { postal: 'ca', name: 'California' },
  '08': { postal: 'co', name: 'Colorado' },
  '09': { postal: 'ct', name: 'Connecticut' },
  10: { postal: 'de', name: 'Delaware' },
  11: { postal: 'dc', name: 'District of Columbia' },
  12: { postal: 'fl', name: 'Florida' },
  13: { postal: 'ga', name: 'Georgia' },
  15: { postal: 'hi', name: 'Hawaii' },
  16: { postal: 'id', name: 'Idaho' },
  17: { postal: 'il', name: 'Illinois' },
  18: { postal: 'in', name: 'Indiana' },
  19: { postal: 'ia', name: 'Iowa' },
  20: { postal: 'ks', name: 'Kansas' },
  21: { postal: 'ky', name: 'Kentucky' },
  22: { postal: 'la', name: 'Louisiana' },
  23: { postal: 'me', name: 'Maine' },
  24: { postal: 'md', name: 'Maryland' },
  25: { postal: 'ma', name: 'Massachusetts' },
  26: { postal: 'mi', name: 'Michigan' },
  27: { postal: 'mn', name: 'Minnesota' },
  28: { postal: 'ms', name: 'Mississippi' },
  29: { postal: 'mo', name: 'Missouri' },
  30: { postal: 'mt', name: 'Montana' },
  31: { postal: 'ne', name: 'Nebraska' },
  32: { postal: 'nv', name: 'Nevada' },
  33: { postal: 'nh', name: 'New Hampshire' },
  34: { postal: 'nj', name: 'New Jersey' },
  35: { postal: 'nm', name: 'New Mexico' },
  36: { postal: 'ny', name: 'New York' },
  37: { postal: 'nc', name: 'North Carolina' },
  38: { postal: 'nd', name: 'North Dakota' },
  39: { postal: 'oh', name: 'Ohio' },
  40: { postal: 'ok', name: 'Oklahoma' },
  41: { postal: 'or', name: 'Oregon' },
  42: { postal: 'pa', name: 'Pennsylvania' },
  44: { postal: 'ri', name: 'Rhode Island' },
  45: { postal: 'sc', name: 'South Carolina' },
  46: { postal: 'sd', name: 'South Dakota' },
  47: { postal: 'tn', name: 'Tennessee' },
  48: { postal: 'tx', name: 'Texas' },
  49: { postal: 'ut', name: 'Utah' },
  50: { postal: 'vt', name: 'Vermont' },
  51: { postal: 'va', name: 'Virginia' },
  53: { postal: 'wa', name: 'Washington' },
  54: { postal: 'wv', name: 'West Virginia' },
  55: { postal: 'wi', name: 'Wisconsin' },
  56: { postal: 'wy', name: 'Wyoming' },
  72: { postal: 'pr', name: 'Puerto Rico' },
}

const POSTAL_TO_STATE = Object.fromEntries(
  Object.values(FIPS_TO_STATE).map((s) => [s.postal, s]),
)

// 50 states only — excludes DC and Puerto Rico from quizzable pool.
export const PLAYABLE_STATES = Object.values(FIPS_TO_STATE).filter(
  (s) => !['dc', 'pr'].includes(s.postal),
)

export function getStateByFips(id) {
  return FIPS_TO_STATE[id] || FIPS_TO_STATE[String(id).padStart(2, '0')] || null
}

export function getStateByPostal(postal) {
  if (!postal) return null
  return POSTAL_TO_STATE[postal.toLowerCase()] || null
}
