export type Status = 'todo' | 'wip' | 'review' | 'done';

export interface PptVersion {
  name: string; size: string; version: number; uploader: string; date: string;
}
export interface Attachment {
  name: string; size: string; date: string; icon: string;
}
export interface Chapter {
  id: string; name: string; parentId: string | null; order: number;
  status: Status; assignee: string | null; assigneeInitial: string | null; assigneeColor: string | null;
  intent: string; rfp: string[]; pptVersions: PptVersion[]; attachments: Attachment[]; text: string;
}
export interface Reply {
  id: string; author: string; initial: string; color: string; text: string; time: string;
}
export interface Comment {
  id: string; author: string; initial: string; color: string;
  text: string; time: string; resolved: boolean; replies: Reply[];
}
export interface Member {
  name: string; initial: string; color: string; email: string; role: 'PM' | '작성자' | '뷰어'; isMe?: boolean;
}
export interface Project {
  id: string; name: string; client: string; emoji: string;
  progress: number; deadline: string; members: Member[]; chapters: Chapter[];
  comments: Record<string, Comment[]>;
}

export interface SlideInfo {
  title: string;
  sub: string;
  color: 'rust' | 'forest' | 'navy' | 'amber' | 'navy';
}
