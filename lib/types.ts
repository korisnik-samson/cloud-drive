export type NodeType = "FILE" | "FOLDER";

export type StorageNode = {
  id: string;
  name: string;
  type: NodeType;
  mimeType?: string;
  sizeBytes?: number;
  parentId?: string | null;
  updatedAt?: string;
};

export type InitiateUploadResponse = {
  objectKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
};

export type CreateShareResponse = {
  token: string;
  url: string; // e.g. /share/<token>
};
