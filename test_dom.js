const { exec } = require('child_process');

(async () => {
  const child = exec('npm run start', { cwd: __dirname });
  
  await new Promise(r => setTimeout(r, 4000));
  
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  
  // Find all sections
  const fs = require('fs');
  fs.writeFileSync('output.html', html);
  console.log("HTML written to output.html");
  
  child.kill();
})();
