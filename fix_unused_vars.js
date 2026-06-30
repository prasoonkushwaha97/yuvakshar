const { Project } = require("ts-morph");
const fs = require("fs");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

let raw = fs.readFileSync("batch1_check2.json", "utf16le");
const data = JSON.parse(raw.substring(raw.indexOf("["), raw.lastIndexOf("]") + 1));

let filesFixed = 0;

for (const file of data) {
  const unusedVars = file.messages.filter(m => m.ruleId === '@typescript-eslint/no-unused-vars');
  if (unusedVars.length === 0) continue;
  
  const relPath = file.filePath.split('yuvakshar\\\\')[1] || file.filePath.split('yuvakshar/')[1] || file.filePath;
  const sf = project.getSourceFile(relPath);
  if (!sf) continue;

  let modified = false;

  unusedVars.sort((a, b) => b.line - a.line);

  for (const warning of unusedVars) {
    const match = warning.message.match(/'([^']+)' is/);
    if (!match) continue;
    const varName = match[1];
    if (varName.startsWith('_')) {
        // If it already starts with _, it's because our eslint config isn't ignoring it yet. 
        // We will update eslint config to fix this.
        continue; 
    }
    
    const descendants = sf.getDescendants();
    const ident = descendants.find(d => d.getKindName() === 'Identifier' && d.getText() === varName && d.getStartLineNumber() === warning.line);
    
    if (ident) {
      const parent = ident.getParent();
      if (parent.getKindName() === 'VariableDeclaration') {
         // It's a const varName = ...
         // If we don't need it, we can't always just remove it if it has side effects like a hook call:
         // const loading = useCms().loading; (hook can't be removed if it's part of array destructuring, but object destructuring is fine)
         // To be safe, we prefix with _ (e.g. _loading)
         ident.replaceWithText('_' + varName);
         modified = true;
      } else if (parent.getKindName() === 'BindingElement') {
         // const { loading } = useCms();
         // Change to const { loading: _loading } = useCms();
         if (!parent.getPropertyNameNode()) {
             // It doesn't have a property name node, meaning it's shorthand.
             // We replace `loading` with `loading: _loading`
             ident.replaceWithText(varName + ': _' + varName);
             modified = true;
         } else {
             // It already has a property name, e.g. data: loading
             ident.replaceWithText('_' + varName);
             modified = true;
         }
      } else if (parent.getKindName() === 'Parameter') {
         ident.replaceWithText('_' + varName);
         modified = true;
      } else if (parent.getKindName() === 'ImportSpecifier') {
         parent.remove();
         modified = true;
      } else if (parent.getKindName() === 'PropertySignature' || parent.getKindName() === 'PropertyDeclaration') {
         // Do nothing for types
      }
    }
  }

  if (modified) {
    sf.saveSync();
    filesFixed++;
  }
}

console.log("Prefixed unused vars in files: " + filesFixed);
