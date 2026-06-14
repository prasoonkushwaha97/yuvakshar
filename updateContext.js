const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf8');

// Add import
content = content.replace(
  /import \{ supabase \} from "@\/lib\/supabaseClient";/,
  "import { supabase } from \"@/lib/supabaseClient\";\nimport { validateUsername, generateDeterministicUsername, RESERVED_USERNAMES } from \"@/utils/username\";"
);

// Add to CmsContextType
content = content.replace(
  /registerUser: \(email: string, role: string, customName: string, customMobile: string, passwordInput: string\) => Promise<boolean>;/,
  "registerUser: (email: string, username: string, role: string, customName: string, customMobile: string, passwordInput: string) => Promise<boolean>;\n  checkUsernameAvailability: (username: string) => { available: boolean; message: string };"
);

// Replace registerUser definition
content = content.replace(
  /const registerUser = async \(email: string, role: string, customName: string, customMobile: string, passwordInput: string\): Promise<boolean> => {/,
  "const checkUsernameAvailability = (username: string) => {\n    const validation = validateUsername(username);\n    if (!validation.valid) return { available: false, message: validation.error || 'Invalid username' };\n    \n    const lower = username.toLowerCase();\n    const isTaken = users.some(u => u.username.toLowerCase() === lower);\n    if (isTaken) return { available: false, message: 'Username is already taken.' };\n    \n    return { available: true, message: 'Available' };\n  };\n\n  const registerUser = async (email: string, username: string, role: string, customName: string, customMobile: string, passwordInput: string): Promise<boolean> => {\n    const availability = checkUsernameAvailability(username);\n    if (!availability.available) {\n      console.error(availability.message);\n      return false;\n    }"
);

// Ensure the new user object gets username
content = content.replace(
  /const newUser: Profile = \{\n\s*id: [^,]+,\n\s*name: customName,/,
  "const newUser: Profile = {\n          id: user.id,\n          name: customName,\n          username: username,"
);

// For local storage fallback
content = content.replace(
  /const newUser: Profile = \{\n\s*id: \local-\$\{Date.now\(\)\}\,\n\s*name: customName,/,
  "const newUser: Profile = {\n        id: \local-\\,\n        name: customName,\n        username: username,"
);

// Add checkUsernameAvailability to return object
content = content.replace(
  /registerUser,\n\s*logoutUser,/,
  "registerUser,\n        checkUsernameAvailability,\n        logoutUser,"
);

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('CmsContext updated');
