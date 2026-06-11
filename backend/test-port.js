
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d.toString() + '\n');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
