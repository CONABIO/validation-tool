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
  complete: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 150, 120, 0.3)',
      lineDash: [4],
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 150, 120, 0.1)',
    }),
  }),
  select: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 120, 0.1)',
      lineDash: [4],
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 200, 0.05)',
    }),
  }),
  undef: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(255, 0, 0, 0.3)',
      lineDash: [4],
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 100, 120, 0.1)',
    }),
  }),
};

export function latLng(coords, inverted) {
  if (inverted) {
    return ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
  }

  return ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
}

export function featureFor(location) {
  const _geometry = {
    type: location.data.geometry.type,
  };

  const _transform = coords => coords.map(_latLng => latLng(_latLng));

  if (_geometry.type === 'Polygon') {
    _geometry.coordinates = location.data.geometry.coordinates.map(_transform);
  }

  if (_geometry.type === 'MultiPolygon') {
    _geometry.coordinates = location.data.geometry.coordinates.map(x => x.map(_transform));
  }

  if (_geometry.type === 'GeometryCollection') {
    _geometry.geometries = location.data.geometry.geometries
      .map(geometry => ({
        type: geometry.type,
        coordinates: geometry.coordinates.map(_transform),
      }));
  }

  return (new ol.format.GeoJSON()).readFeatures({
    id: location.data.id,
    type: 'Feature',
    geometry: _geometry,
    properties: {
      edited: location.edited,
      first_call: location.first_call,
      second_call: location.second_call,
    },
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

// FIXME: support for JSON fields?
export function postJSON(url, opts) {
  opts = opts || {};
  opts.method = 'POST';
  opts.headers = opts.headers || {};
  opts.headers['Accept'] = 'application/json';

  return fetch(url, opts)
    .then(res => res.json());
}

export function styleFor(feature) {
  const props = feature.getProperties();

  if (props.edited) {
    return DEFAULT_STYLES.complete;
  }

  return DEFAULT_STYLES.undef;
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
