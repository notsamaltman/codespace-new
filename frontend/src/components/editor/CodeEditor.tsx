import { useState, useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monacoType from "monaco-editor"; // ✅ import monaco types

export interface Participant {
  userId: string;
  name: string;
  color: string;
  cursor?: { line: number; ch: number };
}

export interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  participants?: Participant[];
  onCursorChange?: (cursor: { line: number; ch: number }) => void;
}

const languageMap: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  python: "python",
  javascript: "javascript",
  java: "java",
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  participants = [],
  onCursorChange,
}) => {
  const [editorValue, setEditorValue] = useState(code);
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monacoType | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("codesync-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "60a5fa" },
        { token: "string", foreground: "4ade80" },
        { token: "number", foreground: "c084fc" },
        { token: "type", foreground: "22d3d3" },
        { token: "function", foreground: "fbbf24" },
        { token: "variable", foreground: "e2e8f0" },
        { token: "constant", foreground: "c084fc" },
        { token: "operator", foreground: "e2e8f0" },
        { token: "delimiter", foreground: "94a3b8" },
        { token: "preprocessor", foreground: "a78bfa" },
      ],
      colors: {
        "editor.background": "#0a0f1a",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#1e293b40",
        "editor.selectionBackground": "#3b82f650",
        "editorLineNumber.foreground": "#4b5563",
        "editorLineNumber.activeForeground": "#9ca3af",
        "editorCursor.foreground": "#3b82f6",
      },
    });

    monaco.editor.setTheme("codesync-dark");
    editor.focus();

    // Local cursor change
    // In CodeEditor.tsx
editor.onDidChangeCursorPosition((e) => {
  const cursor = { line: e.position.lineNumber - 1, ch: e.position.column - 1 };
  onCursorChange?.(cursor);  // send to parent immediately
});


  };

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || "";
    setEditorValue(newValue);
    onChange?.(newValue);
  };

  // -----------------------------
  // Remote cursors
  // -----------------------------
  // -----------------------------
// Remote cursors
// -----------------------------
useEffect(() => {
  const editor = editorRef.current;
  const monaco = monacoRef.current;
  if (!editor || !monaco) return;

  // Filter only participants that have a cursor
  const decorations: monacoType.editor.IModelDeltaDecoration[] = participants
    .filter((p) => p.cursor)
    .map((p) => {
      const line = p.cursor!.line + 1; // Monaco is 1-indexed
      const col = p.cursor!.ch + 1;

      return {
        range: new monaco.Range(line, col, line, col),
        options: {
          className: `remote-cursor-${p.userId}`,
          afterContentClassName: `remote-cursor-label-${p.userId}`,
          stickiness: monaco.editor.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges,
        },
      };
    });

  decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decorations);

  participants.forEach((p) => {
    if (!p.cursor) return;
    const styleId = `remote-cursor-style-${p.userId}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .remote-cursor-label-${p.userId}::after {
          content: "${p.name} is editing";
          color: white;
          font-weight: bold;
          font-size: 0.55rem;
          margin-left: 6px;
          background-color: ${p.color};
          padding: 0 4px;
          border-radius: 3px;
        }
        .remote-cursor-${p.userId} {
          border-left: 3px solid ${p.color};
          background-color: rgba(255, 255, 0, 0.2); /* subtle highlight behind cursor */
        }
      `;
      document.head.appendChild(style);
    }
  });
}, [participants]);

// -----------------------------
// Sync remote code → Monaco
// -----------------------------
useEffect(() => {
  if (!editorRef.current) return;

  const model = editorRef.current.getModel();
  if (!model) return;

  // Already in sync → do nothing
  if (model.getValue() === code) return;

  model.pushEditOperations(
    [],
    [
      {
        range: model.getFullModelRange(),
        text: code,
      },
    ],
    () => null
  );

  setEditorValue(code);
}, [code]);


  return (
    <div className="flex-1 flex flex-col bg-editor rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
          <div className="w-3 h-3 rounded-full bg-warning/80" />
          <div className="w-3 h-3 rounded-full bg-success/80" />
        </div>
        <span className="text-sm text-muted-foreground ml-2 font-mono">
          main.{language === "cpp" ? "cpp" : language === "python" ? "py" : language === "java" ? "java" : language === "javascript" ? "js" : "c"}
        </span>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={languageMap[language] || "python"}
          value={editorValue}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};
