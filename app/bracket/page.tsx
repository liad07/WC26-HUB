import { redirect } from "next/navigation";

export default function BracketPage() {
  redirect("/tournament?tab=knockout");
}
