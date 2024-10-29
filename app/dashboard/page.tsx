import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard";


export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/");
  } 

  return (
    <Dashboard/>
    
  );
}
