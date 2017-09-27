import { centroidFor, styleFor, featureFor, latLng, getJSON } from './_utils.js';
import _sessionVue from './_session.vue.pug';

/* global Vue, fetch, ol */

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

// mount Vue app

const vm = new Vue({
  el: document.getElementById('menu'),
  props: ['referenceImage'],
  render(h) {
    return h(_sessionVue);
  },
  methods: {
    set(prop, value) {
      // FIXME: this is BAD
      vm.$children[0][prop] = value;
    },
  },
});

// FIXME: how to manage the application state per user session
// - each different shape must can be turn on/off its visibility
// - each different shape must anwser the two main questions
// - once all shapes' questions are resolved the session ends

const USER_ID = 'interpreter_1';

function loadFeature(result) {
  vectorSource.clear();

  result.features.forEach(data => {
    vectorSource.addFeatures(featureFor(data));
  });

  const center = centroidFor(result.features);

  map.getView().setCenter(latLng(center));

  // FIXME: gmaps is not working fine with lat/lon values
  const latLon = center.join(',');
  const url = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${latLon}&z=5&l=map&size=600,300&pt=${latLon},vkbkm`;

  vm.set('referenceImage', url);
}

function loadCluster(data) {
  const featureIds = data.features.map(f => f.geoserver_id).join(',');

  return getJSON(`/layers?user=${USER_ID}&features=${featureIds}`).then(loadFeature);
}

// FIXME: paginate over clusters
getJSON(`/clusters?user=${USER_ID}`)
  .then(result => {
    vm.set('clusters', result.results);
    loadCluster(result.results[0]);
  })
  .catch(e => {
    console.log(e);
  });
