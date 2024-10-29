import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SuppliersList from "@/components/suppliers-list";


export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/");
  } 

  return (
    <SuppliersList/>
  );
}
