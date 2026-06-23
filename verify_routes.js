const http = require('http');

const checkRoute = (path, expectedStatus) => {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let isSuccess = false;
      if (expectedStatus === 'redirect' && [301, 302, 303, 307, 308].includes(res.statusCode)) {
         isSuccess = true;
      } else if (res.statusCode === expectedStatus) {
         isSuccess = true;
      }
      
      console.log(`Path: ${path} | Status: ${res.statusCode} | Expected: ${expectedStatus} | Success: ${isSuccess}`);
      res.resume(); // drain response
      resolve(isSuccess);
    }).on('error', (e) => {
      console.log(`Path: ${path} | Error: ${e.message}`);
      resolve(false);
    });
  });
};

async function runTests() {
  // Wait a few seconds for server to boot fully
  await new Promise(r => setTimeout(r, 3000));
  
  const results = await Promise.all([
    checkRoute('/', 200),
    checkRoute('/community', 200),
    checkRoute('/about', 200),
    checkRoute('/login', 200),
    checkRoute('/founder', 'redirect'),
    checkRoute('/admin', 'redirect')
  ]);
  
  const allPassed = results.every(r => r);
  if (allPassed) {
    console.log('All route checks passed!');
  } else {
    console.log('Some route checks failed.');
  }
}

runTests();
