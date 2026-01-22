import { Users, Crown, User, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CodePreview } from "./CodePreview";

interface ClassroomCardProps {
  id: string;
  name: string;
  role: "owner" | "member";
  participantCount: number;
  codePreview?: string;
  language?: string;
}

export const ClassroomCard = ({
  id,
  name,
  role,
  participantCount,
  codePreview,
  language = "python",
}: ClassroomCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/editor?classroom=${id}`);
  };

  // ✅ DELETE ROOM — INLINE, NO EXTERNAL FILES
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this room? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not authenticated");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/rooms/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete room");
      }

      // simplest safe refresh
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete room");
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="group cursor-pointer border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {participantCount} participant
                  {participantCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={role === "owner" ? "default" : "secondary"}
              className="gap-1"
            >
              {role === "owner" ? (
                <Crown className="w-3 h-3" />
              ) : (
                <User className="w-3 h-3" />
              )}
              {role === "owner" ? "Owner" : "Member"}
            </Badge>

            {role === "owner" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {codePreview && (
          <CodePreview code={codePreview} language={language} />
        )}
      </CardContent>
    </Card>
  );
};
