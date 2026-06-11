
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5008,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d.toString());
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
