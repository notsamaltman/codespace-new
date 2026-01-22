import { Users, Crown, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                <span>{participantCount} participant{participantCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
          <Badge
            variant={role === "owner" ? "default" : "secondary"}
            className="shrink-0 gap-1"
          >
            {role === "owner" ? (
              <Crown className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            {role === "owner" ? "Owner" : "Member"}
          </Badge>
        </div>

        {codePreview && (
          <CodePreview code={codePreview} language={language} />
        )}
      </CardContent>
    </Card>
  );
};
