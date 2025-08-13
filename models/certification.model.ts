export type Certification = {
  _id: string;
  title: string;
  description?: string;
  issuedBy: string; // Institution
  recipient: string; // User
  issueDate: Date;
  expiryDate?: Date;
};
