interface CodePreviewProps {
  code: string;
  language: string;
}

export const CodePreview = ({ code, language }: CodePreviewProps) => {
  // Simple syntax highlighting for common patterns
  const highlightCode = (line: string) => {
    // Keywords
    let highlighted = line.replace(
      /\b(def|class|import|from|return|if|else|elif|for|while|in|and|or|not|True|False|None|const|let|var|function|async|await|export|default)\b/g,
      '<span class="text-purple-400">$1</span>'
    );
    // Strings
    highlighted = highlighted.replace(
      /(["'`])(?:(?=(\\?))\2.)*?\1/g,
      '<span class="text-green-400">$&</span>'
    );
    // Comments
    highlighted = highlighted.replace(
      /(#.*|\/\/.*)$/g,
      '<span class="text-muted-foreground">$1</span>'
    );
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-amber-400">$1</span>'
    );
    // Function calls
    highlighted = highlighted.replace(
      /\b(\w+)(?=\()/g,
      '<span class="text-blue-400">$1</span>'
    );
    return highlighted;
  };

  const lines = code.split("\n").slice(0, 5); // Show max 5 lines

  return (
    <div className="mt-3 rounded-md bg-background/80 border border-border overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 border-b border-border">
        <div className="w-2 h-2 rounded-full bg-red-500/70" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
        <div className="w-2 h-2 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[10px] text-muted-foreground font-mono">
          main.{language === "python" ? "py" : language === "javascript" ? "js" : language}
        </span>
      </div>
      <div className="p-2 font-mono text-[10px] leading-relaxed overflow-hidden">
        {lines.map((line, index) => (
          <div
            key={index}
            className="flex gap-2 whitespace-pre"
          >
            <span className="text-muted-foreground/50 select-none w-3 text-right">
              {index + 1}
            </span>
            <span
              dangerouslySetInnerHTML={{ __html: highlightCode(line) || "&nbsp;" }}
              className="text-foreground/90"
            />
          </div>
        ))}
        {code.split("\n").length > 5 && (
          <div className="text-muted-foreground/50 text-center mt-1">...</div>
        )}
      </div>
    </div>
  );
};
