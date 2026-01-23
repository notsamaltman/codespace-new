import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CreateJoinSpaceModal({ open, onClose }) {
  const router = useNavigate();
  const [spaceName, setSpaceName] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  if (!open) return null;

  // CREATE ROOM
  const handleCreateSpace = async () => {
  if (!spaceName.trim()) {
    toast.error("Please enter a space name");
    return;
  }

  setLoading(true);
  try {
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/rooms/create`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: spaceName }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create room");
    }

    const data = await res.json();
    const link = `/editor/${data.id}`;
    setGeneratedLink(link);
    toast.success("Space created! Share the link to invite others.");
    setSpaceName("");
    router(link);
  } catch (error) {
    toast.error(error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  // COPY LINK
  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // JOIN ROOM
  const handleJoinSpace = async () => {
  if (!joinLink.trim()) {
    toast.error("Paste invite link");
    return;
  }

  const match = joinLink.match(/\/join\/([a-zA-Z0-9-_]+)/);
  const roomId = match ? match[1] : joinLink;
  const token = localStorage.getItem("token");

  setLoading(true);
  try {
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    const res = await fetch(`${API_URL}/rooms/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to join room");
    }

    const data = await res.json();
    toast.success("Joined space!");
    onClose();
    router(`/space/${data.roomId || data.roomId}`);
  } catch (error) {
    toast.error(error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Create Space</h2>

        {/* CREATE SPACE */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-medium text-muted-foreground">
            Create a new space
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="Enter space name"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleCreateSpace} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>

          {/* {generatedLink && (
            <div className="flex items-center gap-2 mt-2">
              <Input readOnly value={generatedLink} />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )} */}
        </div>

        {/* DIVIDER
        <div className="relative my-6">
          <div className="border-t border-border" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-3 text-xs text-muted-foreground">
            OR
          </span>
        </div> */}

        {/* JOIN SPACE
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Join an existing space
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="Paste invite link"
              value={joinLink}
              onChange={(e) => setJoinLink(e.target.value)}
              disabled={loading}
            />
            <Button variant="secondary" onClick={handleJoinSpace} disabled={loading}>
              {loading ? "Joining..." : "Join"}
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
