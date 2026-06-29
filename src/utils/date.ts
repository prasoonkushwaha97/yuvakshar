export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  
  // If it's a raw ISO date string
  if (dateStr.includes("-") && dateStr.includes("T")) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("hi-IN", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }
    } catch (e) {}
  }
  
  // Otherwise split by comma if formatted previously
  return dateStr.split(",")[0] || "";
}
