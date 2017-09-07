import { latLng } from './_utils.js';

const mapLayer = new ol.layer.Tile();

const map = new ol.Map({
  controls: [],
  layers: [mapLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: latLng([-99.133209, 19.432608]),
    zoom: 5,
    minZoom: 5,
  }),
});

// TODO: change this dinamically!
mapLayer.setSource(new ol.source.OSM());

console.log(map)
