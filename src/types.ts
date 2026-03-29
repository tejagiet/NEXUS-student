export interface Profile {
  id: string;
  fullName: string;
  pinNumber: string;
  role: string;
  roles: string[];
  branch?: string;
  section?: string;
  avatarUrl?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  urgent: boolean;
}

export interface FeedItem {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  title: string;
  content?: string;
  image?: string;
  likes: number;
  comments: number;
  type: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  attendance: number;
  status: 'ABOVE TARGET' | 'LOW ATTENDANCE' | 'EXCELLENT' | 'STABLE';
  color: string;
}

export interface Message {
  id: string;
  sender: string;
  role?: string;
  time: string;
  content: string;
  isMe?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  subtitle?: string;
  lastMessage: string;
  time: string;
  initials: string;
  color: string;
}

export interface Semester {
  id: string;
  number: string;
  status: 'Ongoing' | 'Completed';
  gpa?: number;
}
