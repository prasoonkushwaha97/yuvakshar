const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'page.tsx');
console.log('Reading file:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// The target broken code is:
// ctx.fillText("प्रमाणित कि        {/* TAB: QUIZ MANAGEMENT */}
// {activeTab === "quiz-management" && (() => {

// Let's find the position of: ctx.fillText("प्रमाणित कि
const index = content.indexOf('ctx.fillText("प्रमाणित कि');
if (index === -1) {
  console.error('Target string not found!');
  process.exit(1);
}

console.log('Found target string at index:', index);

// Let's find the start of the next tab: {activeTab === "quiz-management"
const nextTabStr = '{activeTab === "quiz-management"';
const nextTabIndex = content.indexOf(nextTabStr, index);
if (nextTabIndex === -1) {
  console.error('Next tab string not found!');
  process.exit(1);
}

console.log('Found next tab string at index:', nextTabIndex);

// We want to replace everything from the start of the broken line to the start of the next tab check.
// Let's find the start of the line containing ctx.fillText
const lineStartIndex = content.lastIndexOf('\n', index) + 1;

// The replacement text is the complete certificate drawer code, closing tags, and the beginning of the quiz-management tab.
const replacement = `                                  ctx.fillStyle = "#475569";
                                  ctx.font = "20px 'Noto Sans Devanagari', sans-serif";
                                  ctx.fillText("प्रमाणित किया जाता है कि", 600, 360);

                                  ctx.fillStyle = "#EA580C";
                                  ctx.font = "bold 42px 'Noto Serif Devanagari', serif";
                                  ctx.fillText(cert.userName, 600, 430);

                                  ctx.fillStyle = "#475569";
                                  ctx.font = "20px 'Noto Sans Devanagari', sans-serif";
                                  ctx.fillText(\`ने लेख '\${cert.articleTitle}' का सफलतापूर्वक अध्ययन किया और मूल्यांकन में\`, 600, 490);
                                  ctx.fillText(\`\${cert.percentage}% अंक प्राप्त कर यह सम्मान प्राप्त किया।\`, 600, 530);

                                  // Seal / Signature
                                  ctx.strokeStyle = "#EA580C";
                                  ctx.lineWidth = 3;
                                  ctx.beginPath();
                                  ctx.arc(600, 650, 45, 0, Math.PI * 2);
                                  ctx.stroke();
                                  ctx.fillStyle = "#EA580C";
                                  ctx.font = "bold 13px 'Noto Serif Devanagari', sans-serif";
                                  ctx.fillText("युवाक्षर", 600, 645);
                                  ctx.fillText("पीठ", 600, 663);

                                  // Date & Certification Details
                                  ctx.fillStyle = "#64748B";
                                  ctx.font = "13px monospace";
                                  ctx.textAlign = "left";
                                  ctx.fillText(\`दिनांक: \${new Date(cert.date).toLocaleDateString("hi-IN")}\`, 80, 700);
                                  ctx.fillText(\`ID: \${cert.id.toUpperCase()}\`, 80, 725);

                                  ctx.textAlign = "right";
                                  ctx.fillText("YUVAKSHAR COGNITIVE COUNCIL", 1120, 700);
                                  ctx.fillText("DIGITAL ACCREDITED SYSTEM", 1120, 725);

                                  const link = document.createElement("a");
                                  link.download = \`Yuvakshar_Certificate_\${cert.id}.png\`;
                                  link.href = canvas.toDataURL("image/png");
                                  link.click();
                                }}
                                className="mt-4 w-full bg-primary hover:bg-primary/95 text-white py-2 rounded-xl text-center text-xs font-bold transition-all shadow cursor-pointer"
                              >
                                प्रमाणपत्र डाउनलोड करें
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* TAB: QUIZ MANAGEMENT */}
        `;

// Perform the replacement
const newContent = content.slice(0, lineStartIndex) + replacement + content.slice(nextTabIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated the file!');
