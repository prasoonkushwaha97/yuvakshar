const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf8');

// Add toggleBookmark to CmsContextType
content = content.replace(/logout: \(\) => void;/, 'logout: () => void;\n  toggleBookmark: (articleId: string) => void;');

// Add toggleBookmark implementation
const impl = 
  const toggleBookmark = (articleId: string) => {
    if (!currentUser) return;
    
    const currentBookmarks = currentUser.bookmarks || [];
    const newBookmarks = currentBookmarks.includes(articleId) 
      ? currentBookmarks.filter(id => id !== articleId)
      : [...currentBookmarks, articleId];
      
    const updatedUser = { ...currentUser, bookmarks: newBookmarks };
    setCurrentUser(updatedUser);
    localStorage.setItem("yuvakshar_session_user", JSON.stringify(updatedUser));
    
    // Also update in allUsers array
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    logActivity(currentBookmarks.includes(articleId) ? \Removed bookmark: \\ : \Added bookmark: \\);
  };

  const logout;

content = content.replace(/const logout/, impl);

// Add toggleBookmark to provider value
content = content.replace(/logout,/, 'logout,\n    toggleBookmark,');

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Added toggleBookmark');
