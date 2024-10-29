import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ClientsList from "@/components/clients-list";


export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/");
  }

  return (
    <ClientsList/>
  );
}
