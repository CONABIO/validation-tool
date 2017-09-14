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
    center: latLng([-102.38705181291395, 23.572312362011846]),
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

// mocked data -- update with API
const data = [
    {
        "cluster_id": "14659",
        "edited": false,
        "features": [
            {
                "geoserver_id": 147231,
                "postgres_id": "7287_1349926_32"
            },
            {
                "geoserver_id": 147230,
                "postgres_id": "7226_1349926_32"
            },
            {
                "geoserver_id": 147229,
                "postgres_id": "7070_1349926_32"
            },
            {
                "geoserver_id": 147228,
                "postgres_id": "7033_1349926_32"
            },
            {
                "geoserver_id": 147227,
                "postgres_id": "6982_1349926_32"
            },
            {
                "geoserver_id": 147226,
                "postgres_id": "6937_1349926_32"
            },
            {
                "geoserver_id": 147225,
                "postgres_id": "6924_1349926_32"
            },
            {
                "geoserver_id": 147224,
                "postgres_id": "6739_1349926_32"
            },
            {
                "geoserver_id": 147223,
                "postgres_id": "6999_1349926_32"
            }
        ]
    }
];

app.set('isEdited', data[0].edited);
app.set('features', data[0].features);

const featureIds = data[0].features.map(f => f.geoserver_id).join(',');

getJSON(`/layers?features=${featureIds}`)
  .then(result => {
    vectorSource.clear();

    result.features.forEach(data => {
      vectorSource.addFeatures(featureFor(data));
    });

    map.getView().setCenter(centroidFor(result.features));
  })
