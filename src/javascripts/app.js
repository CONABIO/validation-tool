import { centroidFor, styleFor, featureFor, latLng, getJSON, postJSON } from './_utils.js';
import _sessionVue from './_session.vue.pug';

/* global Vue, fetch */

// mount Vue app
const vm = new Vue({
  el: document.getElementById('app'),
  props: ['referenceImage'],
  render(h) {
    return h(_sessionVue);
  },
  // FIXME: this is BAD
  methods: {
    on(ev, callback) {
      vm.$children[0].$on(ev, callback);
    },
    set(prop, value) {
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

const search = new URLSearchParams(location.search);

const USER_ID = search.get('session');
const OFFSET = 0;

function main() {
  vm.on('sendPayload', data => {
    postJSON(`/save-features?user=${USER_ID}&id=${data.featureId}&first=${data.feature.first_call}&second=${data.feature.second_call}`, data)
      .then(() => {
        console.log(data, 'SENT!');
      });
  });

  getJSON(`/clusters?user=${USER_ID}`)
    .then(result => {
      vm.set('data', result.results);
      vm.set('count', result.count);
      vm.set('username', USER_ID);
      vm.set('offset', OFFSET);

      vm.call('loadCluster');
    })
    .catch(e => {
      console.log(e);
    });
}

if (USER_ID) {
  main();
}
