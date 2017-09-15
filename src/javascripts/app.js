import { valuesFor, centroidFor, styleFor, featureFor, latLng, getJSON } from './_utils.js';
import _sessionTpl from './_session.rv.pug';

/* global fetch, ol */

// mount OL3 canvas
const mapLayer = new ol.layer.Tile();

const map = new ol.Map({
  interactions: ol.interaction.defaults({
    mouseWheelZoom: false,
  }),
  controls: [
    new ol.control.ZoomSlider(),
  ],
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
      currentFeature: 0,
      activeFeature: null,
      isEdited: null,
      features: [],
    };
  },
  computed: {
    isFinished() {
      return this.get('features').every(x => x.complete);
    },
  },
  doPrev() {
    console.log(-1);
  },
  doNext() {
    console.log(+1);
  },
});

// FIXME: how to manage the application state per user session
// - each different shape must can be turn on/off its visibility
// - each different shape must anwser the two main questions
// - once all shapes' questions are resolved the session ends

function loadFeature(result) {
  vectorSource.clear();

  result.features.forEach(data => {
    vectorSource.addFeatures(featureFor(data));
  });

  const center = centroidFor(result.features);

  map.getView().setCenter(latLng(center));

  const activeFeature = app.get(`features.${app.get('currentFeature')}`);

  app.set('activeFeature', activeFeature);
  app.set('activeFeature.primaryValue', valuesFor());
  app.set('activeFeature.secondaryValue', valuesFor());

  // FIXME: gmaps is not working fine with lat/lon values
  const latLon = center.join(',');
  const url = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${latLon}&z=5&l=map&size=600,300&pt=${latLon},vkbkm`;

  app.set('activeFeature.satelliteOverview', url);
  app.set('activeFeature.canContinue', false);
}

function loadCluster(data) {
  app.set('isEdited', data[0].edited);
  app.set('features', data[0].features);

  const featureIds = data[0].features.map(f => f.geoserver_id).join(',');

  return getJSON(`/layers?features=${featureIds}`).then(loadFeature);
}

// TODO: improve this shit...
const randomId = 14000; Math.round(Math.random() * 15000 + 1);

getJSON(`/clusters?clusterId=${randomId}`)
  .then(loadCluster)
  .catch(e => {
    console.log(e);
  });
