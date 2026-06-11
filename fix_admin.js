const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the index of: value={qType}
// followed by the corrupted line: })()}-red-500 px-3 py-1...
const corruptStartStr = 'value={qType}\n                          })()}-red-500';
const corruptIndex = content.indexOf('value={qType}');
if (corruptIndex === -1) {
  console.error('Target corrupt string index not found!');
  process.exit(1);
}

// Find the start of the line where "प्रश्न प्रकार (Question Type)" begins
const lineStartIndex = content.lastIndexOf('<div className="space-y-1">', corruptIndex);
if (lineStartIndex === -1) {
  console.error('Could not find start of the div!');
  process.exit(1);
}

// Find the end of the tab: the closing tags of the tab before </main>
// That would be after the question list and drafts, closing activeTab === "quiz-management" check
// In our current page.tsx, it ends with:
//             )}
//           </div>
//         )}
//
//       </main>
const mainIndex = content.indexOf('</main>');
if (mainIndex === -1) {
  console.error('main tag not found!');
  process.exit(1);
}

// Find the tab closing before main tag
const tabEndIndex = content.lastIndexOf('}', mainIndex);
console.log('Replacing from index:', lineStartIndex, 'to index:', tabEndIndex);

const replacement = `                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">प्रश्न प्रकार (Question Type):</label>
                          <select
                            value={qType}
                            onChange={(e) => setQType(e.target.value as any)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="Fact Recall">Fact Recall</option>
                            <option value="Comprehension">Comprehension</option>
                            <option value="Analysis">Analysis</option>
                            <option value="Application">Application</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">व्याख्या (Educational Explanation):</label>
                          <textarea
                            rows={2}
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-500 font-medium">संबंधित तथ्य (Related Fact):</label>
                          <textarea
                            rows={2}
                            value={qRelatedFact}
                            onChange={(e) => setQRelatedFact(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={async () => {
                            if (!qQuestion || !qOption1 || !qOption2 || !qOption3 || !qOption4 || !qCorrectAnswer) {
                              alert("सभी अनिवार्य फ़ील्ड भरें।");
                              return;
                            }
                            
                            const newQuestion: any = {
                              id: quizEditQuestionId || \`q-\${selectedArticleIdForQuiz}-\${Date.now()}\`,
                              question: qQuestion,
                              options: [qOption1, qOption2, qOption3, qOption4],
                              correctAnswer: qCorrectAnswer,
                              explanation: qExplanation,
                              relatedFact: qRelatedFact,
                              difficultyLevel: qDifficulty,
                              questionType: qType,
                              isDraft: false
                            };
                            
                            await editQuizQuestion(selectedArticleIdForQuiz, newQuestion);
                            alert(quizEditQuestionId ? "प्रश्न सफलतापूर्वक संपादित किया गया।" : "नया प्रश्न सफलतापूर्वक जोड़ा गया।");
                            
                            setQuizEditQuestionId(null);
                            setIsAddingQuestion(false);
                            setQQuestion("");
                            setQOption1("");
                            setQOption2("");
                            setQOption3("");
                            setQOption4("");
                            setQCorrectAnswer("");
                            setQExplanation("");
                            setQRelatedFact("");
                            setQDifficulty("सरल");
                            setQType("MCQ");
                          }}
                          className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          {quizEditQuestionId ? "प्रश्न सुरक्षित करें" : "प्रश्न जोड़ें"}
                        </button>
                        <button
                          onClick={() => {
                            setQuizEditQuestionId(null);
                            setIsAddingQuestion(false);
                          }}
                          className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 py-2.5 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          रद्द करें
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question list for the selected article */}
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="font-serif font-bold text-sm text-primary">
                        प्रश्न बैंक सूची (सक्रिय लाइव प्रश्न)
                      </h3>
                      {!isAddingQuestion && !quizEditQuestionId && (
                        <button
                          onClick={() => {
                            setIsAddingQuestion(true);
                            setQuizEditQuestionId(null);
                            setQQuestion("");
                            setQOption1("");
                            setQOption2("");
                            setQOption3("");
                            setQOption4("");
                            setQCorrectAnswer("");
                            setQExplanation("");
                            setQRelatedFact("");
                            setQDifficulty("सरल");
                            setQType("MCQ");
                          }}
                          className="bg-primary hover:bg-primary/95 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>नया प्रश्न जोड़ें</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const quiz = quizzes.find(q => q.articleId === selectedArticleIdForQuiz);
                        const liveQuestions = quiz?.questions.filter(q => !q.isDraft) || [];

                        if (liveQuestions.length === 0) {
                          return <div className="text-center py-4 text-slate-400 text-xs font-serif">इस लेख के प्रश्न बैंक में कोई लाइव प्रश्न नहीं है।</div>;
                        }

                        return liveQuestions.map((q, qIdx) => (
                          <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-xs font-serif space-y-3 leading-relaxed">
                            <div className="flex justify-between items-start gap-4">
                              <span className="font-bold text-slate-800 dark:text-white">प्रश्न {qIdx + 1}: {q.question}</span>
                              <div className="flex space-x-1.5 shrink-0">
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  {q.difficultyLevel}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  {q.questionType}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                              {q.options.map((opt, oIdx) => (
                                <div 
                                  key={oIdx} 
                                  className={\`p-2 rounded border \${
                                    opt === q.correctAnswer 
                                      ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-bold" 
                                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                  }\`}
                                >
                                  {opt} {opt === q.correctAnswer && "✓"}
                                </div>
                              ))}
                            </div>

                            <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-primary/30">
                              <p><strong>व्याख्या:</strong> {q.explanation}</p>
                              <p><strong>संबद्ध तथ्य:</strong> {q.relatedFact}</p>
                            </div>

                            <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                              <button
                                onClick={() => {
                                  setQuizEditQuestionId(q.id);
                                  setQQuestion(q.question);
                                  setQOption1(q.options[0]);
                                  setQOption2(q.options[1]);
                                  setQOption3(q.options[2]);
                                  setQOption4(q.options[3]);
                                  setQCorrectAnswer(q.correctAnswer);
                                  setQExplanation(q.explanation);
                                  setQRelatedFact(q.relatedFact);
                                  setQDifficulty(q.difficultyLevel);
                                  setQType(q.questionType);
                                  setIsAddingQuestion(false);
                                }}
                                className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                संपादित करें
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("क्या आप इस प्रश्न को हटाना चाहते हैं?")) {
                                    await deleteQuizQuestion(selectedArticleIdForQuiz, q.id);
                                  }
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                हटाएँ
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          )
`;

const newContent = content.slice(0, lineStartIndex) + replacement + content.slice(tabEndIndex + 1);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully fixed the admin file!');
