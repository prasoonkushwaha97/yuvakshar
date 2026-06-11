const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4a03fc30-5dd6-44e1-9172-41ac07dd0957\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index === 1859) {
      console.log('--- STEP 1859 ---');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {}
});
