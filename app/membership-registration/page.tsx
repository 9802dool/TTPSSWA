import { redirect } from "next/navigation";

export default function MembershipRegistrationPage() {
  // Legacy page - redirect to current membership signup
  redirect("/become-a-member");
}
