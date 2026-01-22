import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateJoinSpaceModal = ({ open, onClose }: Props) => {
  const [spaceName, setSpaceName] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [joinLink, setJoinLink] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCreateSpace = () => {
    if (!spaceName.trim()) {
      toast.error("Please enter a space name");
      return;
    }

    // MOCK link generation
    const fakeId = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/editor?space=${fakeId}`;

    setGeneratedLink(link);
    toast.success("Space created!");
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard");

    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSpace = () => {
    if (!joinLink.trim()) {
      toast.error("Paste an invite link");
      return;
    }

    toast.info("Joining space (backend coming soon)");
    console.log("Join link:", joinLink);
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

        <h2 className="text-xl font-semibold mb-6">Create or Join Space</h2>

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
            />
            <Button onClick={handleCreateSpace}>
              Create
            </Button>
          </div>

          {generatedLink && (
            <div className="flex items-center gap-2 mt-2">
              <Input readOnly value={generatedLink} />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="relative my-6">
          <div className="border-t border-border" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-3 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        {/* JOIN SPACE */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Join an existing space
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="Paste invite link"
              value={joinLink}
              onChange={(e) => setJoinLink(e.target.value)}
            />
            <Button variant="secondary" onClick={handleJoinSpace}>
              Join
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJoinSpaceModal;
