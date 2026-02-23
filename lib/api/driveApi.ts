import { http } from "./http";
import { CreateShareResponse, InitiateUploadResponse, StorageNode } from "@/lib/types";

export const nodesApi = {
  async list(parentId: string | null): Promise<StorageNode[]> {
    const res = await http.get("/api/v1/nodes", { params: parentId ? { parentId } : {} });
    return res.data as StorageNode[];
  },
  async createFolder(parentId: string | null, name: string): Promise<StorageNode> {
    const res = await http.post("/api/v1/nodes/folders", { name }, { params: parentId ? { parentId } : {} });
    return res.data as StorageNode;
  },
  async trash(nodeId: string): Promise<void> {
    await http.delete(`/api/v1/nodes/${nodeId}`);
  },
  async getDownloadUrl(nodeId: string): Promise<{ url: string }> {
    const res = await http.get(`/api/v1/nodes/${nodeId}/download-url`);
    return res.data as { url: string };
  },
  async search(q: string): Promise<StorageNode[]> {
    const res = await http.get("/api/v1/nodes/search", { params: { q } });
    return res.data as StorageNode[];
  }
};

export const uploadsApi = {
  async initiate(req: { fileName: string; mimeType: string; sizeBytes: number; parentId: string | null }): Promise<InitiateUploadResponse> {
    const res = await http.post("/api/v1/uploads/initiate", { ...req, parentId: req.parentId ?? undefined });
    return res.data as InitiateUploadResponse;
  },
  async complete(req: { objectKey: string; fileName: string; mimeType: string; sizeBytes: number; parentId: string | null; checksumSha256?: string }): Promise<any> {
    const res = await http.post("/api/v1/uploads/complete", { ...req, parentId: req.parentId ?? undefined });
    return res.data;
  }
};

export const sharesApi = {
  async create(nodeId: string, opts: { expiresHours?: number; password?: string; maxDownloads?: number }): Promise<CreateShareResponse> {
    const res = await http.post("/api/v1/shares", { nodeId, ...opts });
    return res.data as CreateShareResponse;
  },
  async resolve(token: string, password?: string): Promise<any> {
    const res = await http.post(`/api/v1/shares/resolve/${token}`, password ? { password } : {});
    return res.data;
  }
};
