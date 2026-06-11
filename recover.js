const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4a03fc30-5dd6-44e1-9172-41ac07dd0957\\.system_generated\\logs\\transcript.jsonl';
console.log('Reading logs from:', logPath);

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let stepCount = 0;
rl.on('line', (line) => {
  stepCount++;
  try {
    const data = JSON.parse(line);
    // Check if the step index has tool calls to write_to_file or replace_file_content on admin/page.tsx
    if (data.tool_calls) {
      data.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          const args = tc.args || {};
          const file = args.TargetFile || args.AbsolutePath || '';
          if (file.includes('admin/page.tsx') || file.includes('admin\\page.tsx')) {
            console.log(`Step ${data.step_index || stepCount}: Tool ${tc.name}`);
            console.log('Instruction:', args.Instruction || args.Description);
            if (tc.name === 'write_to_file' && args.CodeContent) {
              console.log('Found full write of size:', args.CodeContent.length);
              fs.writeFileSync('recovered_admin_page.tsx', args.CodeContent, 'utf8');
              console.log('Saved to recovered_admin_page.tsx');
            }
          }
        }
      });
    }
  } catch (e) {
    // ignore parse error
  }
});

rl.on('close', () => {
  console.log('Finished reading logs. Checked steps:', stepCount);
});
