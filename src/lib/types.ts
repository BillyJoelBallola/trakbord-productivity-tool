interface ITag {
  tag: { id: string; name: string; color: string };
}

interface ITask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  order: number;
  columnId: string;
  projectId: string;
  assignee: { id: string; username: string; avatar: string | null } | null;
  tags: ITag[];
  _count: { comments: number };
}

interface ITaskModal {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  columnId: string;
  projectId: string;
  assignee: IMember | null;
  createdBy: IMember;
  comments: IComment[];
  column: { id: string; name: string };
  tags: { tag: { id: string; name: string; color: string } }[];
}

interface IColumn {
  id: string;
  name: string;
  order: number;
  tasks: ITask[];
}

interface IMember {
  id: string;
  username: string;
  avatar: string | null;
}

interface IComment {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; username: string; avatar: string | null };
}

interface IProject {
  id: string;
  name: string;
  color: string;
  description: string | null;
}

interface IWorkspace {
  id: string;
  name: string;
  description: string | null;
}

interface IUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
}
