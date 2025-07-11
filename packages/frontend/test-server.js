const http = require('http');

const testServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    console.log(`headers:`, res.headers);
    
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
};

testServer();