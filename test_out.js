const fs = require('fs');
fs.writeFileSync('test_out.txt', 'Node runs successfully!', 'utf8');
console.log('Done writing');
