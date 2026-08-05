import { supabase } from "./supabase";

export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.user?.id) {
    headers["X-User-Id"] = session.user.id;
  }
  return headers;
}
