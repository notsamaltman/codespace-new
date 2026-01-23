import { useState } from "react";
import { Play, Square, Terminal, Loader2, AlertCircle, CheckCircle2, MessageSquare, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  code: string;
  roomId: string;
  onCodeUpdate: (newCode: string) => void;
  codeHistory: { code: string; timestamp: number; userId: string }[];
}

type ExecutionState = "idle" | "running" | "success" | "error";

const languages = [
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
];

export function SidePanel({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  code,
  roomId,
  onCodeUpdate,
  codeHistory,
}: SidePanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [executionState, setExecutionState] = useState<ExecutionState>("idle");
  const [activeTab, setActiveTab] = useState<"run" | "history" | "chat">("run");

  const handleRevert = (historyItem: { code: string; timestamp: number; userId: string }) => {
    const confirmRevert = confirm("Revert editor code to this version?");
    if (!confirmRevert) return;

    onCodeUpdate(historyItem.code);
  };

  const handleRun = async () => {
    setExecutionState("running");
    setOutput("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language, stdin: input }),
        }
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      if (data.success) {
        setOutput(data.output || "Program completed with no output.");
        setExecutionState("success");
      } else {
        setOutput(data.error || "Unknown error occurred.");
        setExecutionState("error");
        toast.error("Execution failed");
      }
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setExecutionState("error");
      toast.error("Failed to execute code");
    }
  };

  const handleStop = () => {
    setExecutionState("idle");
    setOutput("Execution stopped by user.");
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 lg:w-96 border-l border-border bg-card flex flex-col shrink-0 transition-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab("run")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === "run" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Terminal className="w-4 h-4 inline-block mr-1.5" /> Run
          </button>
          <button onClick={() => setActiveTab("history")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === "history" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <History className="w-4 h-4 inline-block mr-1.5" /> History
          </button>
          <button onClick={() => setActiveTab("chat")} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === "chat" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <MessageSquare className="w-4 h-4 inline-block mr-1.5" /> Chat
          </button>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors lg:hidden">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Run Tab (exactly your UI) */}
      {activeTab === "run" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Language & Actions */}
          <div className="p-4 space-y-4 border-b border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Language</label>
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-full bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {executionState === "running" ? (
                <Button onClick={handleStop} variant="destructive" className="flex-1 shadow-button"><Square className="w-4 h-4 mr-2" /> Stop</Button>
              ) : (
                <Button onClick={handleRun} className="flex-1 bg-primary hover:bg-primary/90 shadow-button"><Play className="w-4 h-4 mr-2" /> Run Code</Button>
              )}
            </div>
          </div>

          {/* Input section */}
          <div className="p-4 border-b border-border">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Input (stdin)</label>
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter input here..." className="font-mono text-sm bg-secondary border-border resize-none h-20" />
            <p className="text-xs text-muted-foreground mt-2">Add program input if your code reads from stdin</p>
          </div>

          {/* Output section */}
          <div className="flex-1 flex flex-col min-h-0 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Output</label>
              {executionState === "running" && <span className="flex items-center gap-1.5 text-xs text-primary"><Loader2 className="w-3 h-3 animate-spin" /> Executing...</span>}
              {executionState === "success" && <span className="flex items-center gap-1.5 text-xs text-success"><CheckCircle2 className="w-3 h-3" /> Completed</span>}
              {executionState === "error" && <span className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="w-3 h-3" /> Error</span>}
            </div>
            <ScrollArea className="flex-1 rounded-md bg-secondary/50 border border-border">
              <div className="p-3 font-mono text-sm">{output ? <pre className="whitespace-pre-wrap">{output}</pre> : <p className="text-muted-foreground italic">Output will appear here after running your code.</p>}</div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <ScrollArea className="flex-1 rounded-md bg-secondary/50 border border-border">
            <div className="p-3 font-mono text-sm">
              {codeHistory.length === 0 ? (
                <p className="text-muted-foreground italic">No code history yet.</p>
              ) : (
                codeHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 border-b border-border hover:bg-secondary cursor-pointer"
                    onClick={() => handleRevert(item)}
                  >
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()} by {item.userId === "self" ? "You" : item.userId}
                    </p>
                    <pre className="whitespace-pre-wrap">{item.code}</pre>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Session chat coming soon</p>
              <p className="text-xs text-muted-foreground/70">Discuss code with your collaborators in real-time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
