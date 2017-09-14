import { centroidFor, styleFor, featureFor, latLng, getJSON } from './_utils.js';
import _sessionTpl from './_session.rv.pug';

/* global fetch, ol */

// mount OL3 canvas
const mapLayer = new ol.layer.Tile();

const map = new ol.Map({
  controls: [],
  layers: [mapLayer],
  target: document.getElementById('map'),
  view: new ol.View({
    center: latLng([-99.133209, 19.432608]),
    zoom: 16,
    minZoom: 5,
  }),
});

// TODO: change this dinamically!
mapLayer.setSource(new ol.source.OSM());

// mount vectors' canvas
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: styleFor,
});

map.addLayer(vectorLayer);
map.on('click', e => {
  console.log(e)
});

// mount Ractive app
const app = new Ractive({
  el: document.getElementById('menu'),
  template: _sessionTpl,
  data() {
    // initial state
    return {
      isEdited: null,
      features: [],
    };
  },
});

// TODO: improve this shit...
const randomId = Math.round(Math.random() * 15000 + 1);

getJSON(`/clusters?clusterId=${randomId}`)
  .then(data => {
    app.set('isEdited', data[0].edited);
    app.set('features', data[0].features);

    const featureIds = data[0].features.map(f => f.geoserver_id).join(',');

    return getJSON(`/layers?features=${featureIds}`)
      .then(result => {
        vectorSource.clear();

        result.features.forEach(data => {
          vectorSource.addFeatures(featureFor(data));
        });

        map.getView().setCenter(centroidFor(result.features));
      });
  })
  .catch(e => {
    console.log(e);
  });
