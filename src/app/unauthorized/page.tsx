export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md p-8 bg-card border border-border rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Unauthorized / अनाधिकृत</h1>
        <p className="text-lg mb-6">
          आपके पास इस क्षेत्र तक पहुँच की अनुमति नहीं है।
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          You do not have permission to access this area.
        </p>
        <a 
          href="/" 
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
