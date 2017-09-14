const reqFast = require('req-fast');
const Grown = require('grown');
const app = new Grown();

Grown.env();

// in-memoery cache
const CACHED = {};

// proxy for geoserver
app.mount(conn => {
  if (conn.request_path !== '/layers') return;

  const featureIds = conn.params.features
    ? conn.params.features.split(',')
    : [];

  const url = `http://webportal.conabio.gob.mx:8085/geoserver/validation-tool/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=validation-tool:sample&featureID=${
    featureIds.map(f => `sample.${f}`).join(',')
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
});

app.listen(process.env.PORT || 8081).then(ctx => {
  console.log('Listening at', ctx.location.href);
});
