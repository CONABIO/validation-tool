/* global ol */

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

export default { featureFor, closestElement };
