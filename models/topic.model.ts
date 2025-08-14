export type Topic = {
  _id: string;
  name: string;
  description: string;
  levels: number; // Max levels for this topic
  isActive: boolean;
  referenceDocumentUrl?: string; // Optional uploaded doc link
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}