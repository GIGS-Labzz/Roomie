import { redirect } from "next/navigation";

// Auth check implemented in Phase 8
export default function AdminRootPage() {
  redirect("/login");
}
