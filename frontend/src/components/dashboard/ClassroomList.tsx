import { ClassroomCard } from "./ClassroomCard";
import { EmptyState } from "./EmptyState";

interface Classroom {
  id: string;
  name: string;
  role: "owner" | "member";
  participantCount: number;
  codePreview?: string;
  language?: string;
}

interface ClassroomListProps {
  classrooms: Classroom[];
  onCreateClassroom?: () => void;
}

export const ClassroomList = ({
  classrooms,
  onCreateClassroom,
}: ClassroomListProps) => {
  if (classrooms.length === 0) {
    return <EmptyState onCreateClassroom={onCreateClassroom} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {classrooms.map((classroom) => (
        <ClassroomCard
          key={classroom.id}
          id={classroom.id}
          name={classroom.name}
          role={classroom.role}
          participantCount={classroom.participantCount}
          codePreview={classroom.codePreview}
          language={classroom.language}
        />
      ))}
    </div>
  );
};
