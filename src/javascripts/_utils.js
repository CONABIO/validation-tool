/* global ol */

const DEFAULT_STYLES = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 100, 120, 0.5)',
    lineDash: [4],
    width: 1,
  }),
  fill: new ol.style.Fill({
    color: 'rgba(0, 100, 120, 0.2)',
  }),
});

const STYLES = {
  Polygon: DEFAULT_STYLES,
  MultiPolygon: DEFAULT_STYLES,
  GeometryCollection: DEFAULT_STYLES,
};

function geojsonObject(location, transform) {
  const _geometry = {
    type: location.geometry.type,
  };

  const _transform = coords => coords.map(_latLng => transform(_latLng));

  if (_geometry.type === 'Polygon') {
    _geometry.coordinates = location.geometry.coordinates.map(_transform);
  }

  if (_geometry.type === 'MultiPolygon') {
    _geometry.coordinates = location.geometry.coordinates.map(x => x.map(_transform));
  }

  if (_geometry.type === 'GeometryCollection') {
    _geometry.geometries = location.geometry.geometries
      .map((geometry) => {
        return {
          type: geometry.type,
          coordinates: geometry.coordinates.map(_transform),
        };
      });
  }

  return {
    type: 'Feature',
    geometry: _geometry,
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
  };
}

export function latLng(coords, inverted) {
  if (inverted) {
    return ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
  }

  return ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
}

export function featureFor(location) {
  return (new ol.format.GeoJSON()).readFeatures(geojsonObject(location, latLng));
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
  return fetch(url, opts)
    .then(res => res.json());
}

export function styleFor(feature) {
  return STYLES[feature.getGeometry().getType()];
}

function calculateCentroid(coords) {
  var longitude = 0;
  var latitude = 0;
  for(var i=0; i < coords.length; i++) {
    longitude += coords[i][0];
    latitude += coords[i][1];
  }
  return [longitude / coords.length, latitude / coords.length];
}

export function centroidFor(feature) {
  const centroidsByFeature = (!Array.isArray(feature) ? [feature] : feature)
    .map(x => calculateCentroid(x.geometry.coordinates[0][0]));

  return latLng(calculateCentroid(centroidsByFeature));
}

export default { styleFor, featureFor, closestElement, latLng, getJSON };
