const fs = require('fs');
let content = fs.readFileSync('src/components/yuvakshar/AuthModal.tsx', 'utf8');

// Add username state
content = content.replace(
  /const \[name, setName\] = useState\(""\);/,
  "const [name, setName] = useState(\"\");\n  const [username, setUsername] = useState(\"\");\n  const [usernameMsg, setUsernameMsg] = useState(\"\");"
);

// Add validateUsername helper internally if checkUsernameAvailability isn't imported from CmsContext
content = content.replace(
  /const \{ \n\s*currentUser,/,
  "const { \n    currentUser,\n    checkUsernameAvailability,"
);

// Replace the username input right after the name input
const nameInputPattern = /<div className="space-y-1">\s*<label className="text-slate-550 dark:text-slate-400 font-medium">???<\/label>[\s\S]*?<\/div>/;
const usernameInput = 
                    {/* Grid: Name & Username */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-550 dark:text-slate-400 font-medium">???</label>
                        <input
                          type="text"
                          placeholder="???. ??????"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isLoading}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-550 dark:text-slate-400 font-medium">???????? (@)</label>
                        <input
                          type="text"
                          placeholder="???. prasoon"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            if (e.target.value) {
                              const check = checkUsernameAvailability(e.target.value);
                              setUsernameMsg(check.message);
                            } else {
                              setUsernameMsg("");
                            }
                          }}
                          disabled={isLoading}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                          required
                        />
                        {usernameMsg && (
                          <p className={\	ext-[10px] font-sans \\}>
                            {usernameMsg}
                          </p>
                        )}
                      </div>
                    </div>
;

content = content.replace(nameInputPattern, usernameInput);

// Update registerUser call in handleRegisterSubmit
content = content.replace(
  /const success = await registerUser\(email\.trim\(\), "Subscriber", name\.trim\(\), mobile\.trim\(\), password\);/,
  "const success = await registerUser(email.trim(), username.trim(), \"Subscriber\", name.trim(), mobile.trim(), password);"
);

// Clear username state on success
content = content.replace(
  /setName\(""\);/,
  "setName(\"\");\n          setUsername(\"\");\n          setUsernameMsg(\"\");"
);

fs.writeFileSync('src/components/yuvakshar/AuthModal.tsx', content);
console.log('AuthModal updated');
