export type Person = {
  _id: string;
  name: string;
  email?: string;
  avatar: number;
  major: string;
  university: string;
  year: string;
  bio: string;
  location: string;
  availability: string;
  skillsOffered: string[];
  skillsWanted: string[];
  category: string;
  rating: number;
  reviewCount: number;
  match?: number;
  connected?: boolean;
  connections?: string[];
  savedResources?: string[];
};
export type Session = {
  _id: string;
  title: string;
  requester: Person;
  recipient: Person;
  startsAt: string;
  duration: number;
  format: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  notes?: string;
};
export type Post = {
  _id: string;
  author: Person;
  title: string;
  body: string;
  tags: string[];
  likes: string[];
  createdAt: string;
  comments: { _id: string; author: Person; body: string; createdAt: string }[];
};
export type Group = {
  _id: string;
  name: string;
  description: string;
  category: string;
  members: string[];
};
export type Resource = {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: Person;
  content?: string;
  downloads: number;
  createdAt: string;
};
export type Notification = {
  _id: string;
  text: string;
  link: string;
  read: boolean;
  createdAt: string;
};
export type Message = {
  _id: string;
  sender: string;
  recipient: string;
  body: string;
  createdAt: string;
};
export type Review = {
  _id: string;
  author: Person;
  rating: number;
  body: string;
  createdAt: string;
};
