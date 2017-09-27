/* global ol */

export const DEFAULT_VALUES = {
  0: 'Sin datos',
  1: 'Bosque de Coniferas de Oyamel Ayarin Cedro',
  2: 'Bosque de Coniferas de Pino y Tascate',
  3: 'Bosque de Encino y Bosque de Galeria',
  4: 'Chaparral',
  5: 'Mezquital y Submontano',
  6: 'Bosque Cultivado e Inducido',
  7: 'Selva Baja Perennifolia y Bosque Mesofilo',
  8: 'Selva Baja y Mediana Subperennifolia Galeria y Palmar Natural',
  9: 'Manglar y Peten',
  10: 'Selva Mediana y Alta Perennifolia',
  11: 'Selva Alta Subperennifolia',
  12: 'Selva Baja Caducifolia Subcaducifolia y Matorral Subtropical',
  13: 'Selva Mediana Caducifolia y Subcaducifolia',
  14: 'Mezquital Xerofilo Galeria y Desertico Microfilo',
  15: 'Matorral Crasicaule',
  16: 'Matorral Espinoso Tamaulipeco',
  17: 'Matorral Sarco-Crasicaule',
  18: 'Matorral Sarcocaule',
  19: 'Matorral Sarco-Crasicaule de Neblina',
  20: 'Matorral Rosetofilo Costero',
  21: 'Matorral Desertico Rosetofilo',
  22: 'Popal y Tular',
  23: 'Tular',
  24: 'Vegetacion de Dunas Costeras',
  25: 'Vegetacion de Desiertos Arenosos',
  26: 'Vegetacion Halofila Hidrofila',
  27: 'Vegetacion Halofila Xerofila y Gipsofila',
  28: 'Pastizales',
  29: 'Tierras Agricolas',
  30: 'Urbano y Construido',
  31: 'Suelo Desnudo ',
  32: 'Agua',
};

export const DEFAULT_STYLES = {
  on: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 100, 120, 0.5)',
      lineDash: [4],
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 100, 120, 0.2)',
    }),
  }),
  off: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 100, 120, 0.05)',
      lineDash: [4],
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 100, 120, 0.1)',
    }),
  }),
};

const STYLES = {
  Polygon: DEFAULT_STYLES.on,
  MultiPolygon: DEFAULT_STYLES.on,
  GeometryCollection: DEFAULT_STYLES.on,
};

export function latLng(coords, inverted) {
  if (inverted) {
    return ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
  }

  return ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
}

export function featureFor(location) {
  const _geometry = {
    type: location.geometry.type,
  };

  const _transform = coords => coords.map(_latLng => latLng(_latLng));

  if (_geometry.type === 'Polygon') {
    _geometry.coordinates = location.geometry.coordinates.map(_transform);
  }

  if (_geometry.type === 'MultiPolygon') {
    _geometry.coordinates = location.geometry.coordinates.map(x => x.map(_transform));
  }

  if (_geometry.type === 'GeometryCollection') {
    _geometry.geometries = location.geometry.geometries
      .map(geometry => ({
        type: geometry.type,
        coordinates: geometry.coordinates.map(_transform),
      }));
  }

  return (new ol.format.GeoJSON()).readFeatures({
    type: 'Feature',
    geometry: _geometry,
  });
}

export function closestElement(node, className) {
  let depth = 10;

  do {
    if (!(node && node.tagName) || !depth) {
      return null;
    }

    if (node.classList.contains(className)) {
      return node;
    }

    depth -= 1;

    node = node.parentNode;
  } while (node.parentNode);
}

export function getJSON(url, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers['Accept'] = 'application/json';

  return fetch(url, opts)
    .then(res => res.json());
}

export function styleFor(feature) {
  return STYLES[feature.getGeometry().getType()];
}

function calculateCentroid(coords) {
  let longitude = 0;
  let latitude = 0;

  for (let i = 0; i < coords.length; i++) {
    longitude += coords[i][0];
    latitude += coords[i][1];
  }

  return [longitude / coords.length, latitude / coords.length];
}

export function centroidFor(feature) {
  const centroidsByFeature = (!Array.isArray(feature) ? [feature] : feature)
    .map(x => calculateCentroid(x.geometry.coordinates[0][0]));

  return calculateCentroid(centroidsByFeature);
}

export default { featureFor, closestElement, latLng, getJSON };
