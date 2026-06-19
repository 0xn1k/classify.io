import { redirect } from "next/navigation";

// Staff management now lives on /users.
export default function TeachersPage() {
  redirect("/users");
}
