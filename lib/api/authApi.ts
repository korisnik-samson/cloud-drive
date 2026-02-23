import { http } from "./http";
import { z } from "zod";

const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().optional()
});

export async function loginApi(email: string, password: string) {
  const res = await http.post("/auth/login", { email, password });
  return LoginResponseSchema.parse(res.data);
}
