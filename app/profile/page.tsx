import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Profile from "@/components/profileCard";


export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/");
  }

  return (
    <Profile/>
    
  );
}
