import { centroidFor, styleFor, featureFor, latLng, getJSON } from './_utils.js';
import _sessionVue from './_session.vue.pug';

/* global Vue, fetch */

// mount Vue app
const vm = new Vue({
  el: document.getElementById('app'),
  props: ['referenceImage'],
  render(h) {
    return h(_sessionVue);
  },
  methods: {
    set(prop, value) {
      // FIXME: this is BAD
      vm.$children[0][prop] = value;
    },
    call(method, ...args) {
      return vm.$children[0][method](...args);
    }
  },
});

// FIXME: how to manage the application state per user session
// - each different shape must can be turn on/off its visibility
// - each different shape must anwser the two main questions
// - once all shapes' questions are resolved the session ends

const USER_ID = 'interpreter_1';

let OFFSET = 0;

// FIXME: paginate over clusters
getJSON(`/clusters?user=${USER_ID}`)
  .then(result => {
    vm.set('offset', OFFSET);
    vm.set('clusters', result.count);
    vm.set('features', result.results[OFFSET].features);

    vm.call('loadCluster', USER_ID, result.results[OFFSET].features);
  })
  .catch(e => {
    console.log(e);
  });
