export type Institution = {
  _id: string;
  name: string;
  email: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Optional, if you want to track who created the institution
  updatedBy?: string; // Optional, if you want to track
}