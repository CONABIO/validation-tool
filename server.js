const reqFast = require('req-fast');
const Grown = require('grown');
const app = new Grown();

Grown.env();

// in-memoery cache
const CACHED = {};

// proxy for geoserver
function getLayers(conn) {
  const featureIds = conn.params.features
    ? conn.params.features.split(',')
    : [];

  const url = `http://webportal.conabio.gob.mx:8085/geoserver/validation-tool/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=validation-tool:sample&featureID=${
    featureIds.map(f => `sample.${f.replace('sample.', '')}`).join(',')
  }&outputFormat=application/json`;

  if (CACHED[url]) {
    conn.resp_body = CACHED[url];
    return;
  }

  const auth = `${process.env.GEOSERVER_AUTH_USERNAME}:${process.env.GEOSERVER_AUTH_PASSWORD}`;

  return new Promise((resolve, reject) => {
    reqFast({
      url,
      headers: {
        Authorization: `Basic ${new Buffer(auth).toString('base64')}`,
      },
    }, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve(resp.body);
      }
    });
  })
  .then(result => {
    CACHED[url] = result;
    conn.resp_body = result;
  });
}

function getClusters(conn) {
  const apiCall = 'http://localhost:8000/clusters/?format=json';
  const auth = `${conn.params.user}:${conn.params.user}`;

  return new Promise((resolve, reject) => {
    reqFast({
      url: apiCall,
      headers: {
        Authorization: `Basic ${new Buffer(auth).toString('base64')}`,
      },
    }, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve(resp.body);
      }
    });
  })
  .then(result => {
    conn.resp_body = result;
  });
}

function sendFeatures(conn) {
  const featureId = conn.params.id.split('.').pop();
  const apiCall = `http://localhost:8000/features/${featureId}/?format=json`;
  const auth = `${conn.params.user}:${conn.params.user}`;

  return new Promise((resolve, reject) => {
    reqFast({
      url: apiCall,
      method: 'PATCH',
      data: {
        first_call: conn.params.first,
        second_call: conn.params.second,
      },
      headers: {
        Authorization: `Basic ${new Buffer(auth).toString('base64')}`,
      },
    }, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve(resp.body);
      }
    });
  })
  .then(result => {
    conn.resp_body = result;
  });
}

app.mount(conn => {
  if (conn.request_path === '/layers') return getLayers(conn);
  if (conn.request_path === '/clusters') return getClusters(conn);
  if (conn.request_path === '/save-features') return sendFeatures(conn);
});

app.listen(process.env.PORT || 8081).then(ctx => {
  console.log('Listening at', ctx.location.href);
});
