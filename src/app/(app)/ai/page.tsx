export default function AIPage() {
  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-foreground">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Chat or ask by voice – powered by Gemini
        </p>
      </div>

      {/* Chat area placeholder */}
      <div className="flex-1 glass-card rounded-xl border-0 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">AI Tutor chat coming in Week 2</p>
      </div>

      {/* Input bar placeholder */}
      <div className="mt-3 glass-card rounded-xl border-0 p-3 flex items-center gap-3">
        <div className="flex-1 h-10 rounded-lg bg-muted flex items-center px-4">
          <span className="text-muted-foreground text-sm">Type or tap mic…</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground">&#128276;</span>
        </div>
      </div>
    </div>
  );
}
