const { Project } = require("ts-morph");
const fs = require("fs");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const data = JSON.parse(fs.readFileSync("batch1_warnings.json", "utf8"));

let filesFixed = 0;

for (const relPath in data) {
  const fileWarnings = data[relPath];
  const sf = project.getSourceFile(relPath);
  if (!sf) {
    console.log("Could not find file: " + relPath);
    continue;
  }

  let modified = false;

  fileWarnings.sort((a, b) => b.line - a.line);

  for (const warning of fileWarnings) {
    if (warning.rule === '@typescript-eslint/no-unused-vars') {
      const match = warning.message.match(/'([^']+)' is/);
      if (match) {
        const varName = match[1];
        if (varName.startsWith('_')) continue;
        
        const descendants = sf.getDescendants();
        const ident = descendants.find(d => d.getKindName() === 'Identifier' && d.getText() === varName && d.getStartLineNumber() === warning.line);
        
        if (ident) {
          const parent = ident.getParent();
          if (parent.getKindName() === 'ImportSpecifier') {
            parent.remove();
            modified = true;
          } else if (parent.getKindName() === 'ImportClause') {
            const importDecl = parent.getParent();
            importDecl.remove();
            modified = true;
          } else if (parent.getKindName() === 'Parameter') {
            ident.replaceWithText('_' + varName);
            modified = true;
          }
        }
      }
    }
  }

  // Remove empty imports
  sf.getImportDeclarations().forEach(importDecl => {
    const namedImports = importDecl.getNamedImports();
    const defaultImport = importDecl.getDefaultImport();
    const namespaceImport = importDecl.getNamespaceImport();
    if (namedImports.length === 0 && !defaultImport && !namespaceImport) {
      importDecl.remove();
      modified = true;
    }
  });

  if (modified) {
    sf.saveSync();
    filesFixed++;
  }
}

console.log("Fixed files: " + filesFixed);
