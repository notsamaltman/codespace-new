// Mock classroom data with code - this would come from a database in production
export interface Classroom {
  id: string;
  name: string;
  role: "owner" | "member";
  participantCount: number;
  language: string;
  code: string;
}


export const getCodePreview = (code: string): string => {
  // Return first 8 lines for preview
  return code.split("\n").slice(0, 8).join("\n");
};
