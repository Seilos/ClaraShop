/**
 * Geographic data: countries and their states/provinces.
 * Structured to be extended with more countries over time.
 */

export const COUNTRIES = [
  { code: 'VE', name: 'Venezuela' },
];

export const STATES_BY_COUNTRY = {
  VE: [
    'Amazonas',
    'Anzoátegui',
    'Apure',
    'Aragua',
    'Barinas',
    'Bolívar',
    'Carabobo',
    'Cojedes',
    'Delta Amacuro',
    'Distrito Capital',
    'Falcón',
    'Guárico',
    'La Guaira',
    'Lara',
    'Mérida',
    'Miranda',
    'Monagas',
    'Nueva Esparta',
    'Portuguesa',
    'Sucre',
    'Táchira',
    'Trujillo',
    'Yaracuy',
    'Zulia',
  ],
};

/**
 * Returns the list of states for a given country code.
 * @param {string} countryCode
 * @returns {string[]}
 */
export function getStatesByCountry(countryCode) {
  return STATES_BY_COUNTRY[countryCode] ?? [];
}
