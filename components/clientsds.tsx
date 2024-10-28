"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchClientsAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { ChevronRight, Divide, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const handlefetchClients = async () => {
  const clients = await fetchClientsAction();
  return clients;
};
const ClientList = () => {
  const [clients, setClients] = useState<
    { name: string; email?: string; phone?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchClients = async () => {
      const clientsData: { name: string; email?: string; phone?: string }[] =
        await handlefetchClients();
        setClients(clientsData.slice(0,5));
      setIsLoading(false);
    };

    fetchClients();

    const clientChannel = supabase
      .channel("custom-insert-delete-update-clients-list-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clients" },
        (payload) => {
          console.log("Nuevo cliente insertado:", payload);
          fetchClients(); // Volver a cargar la lista cuando se inserte un cliente
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "clients" },
        (payload) => {
          console.log("Cliente eliminado:", payload);
          fetchClients(); // Volver a cargar la lista cuando se elimine un cliente
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clients" },
        (payload) => {
          console.log("Cliente actualizado:", payload);
          fetchClients(); // Volver a cargar la lista cuando se elimine un cliente
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientChannel);
    };
  }, []);

  return (
    <div>
      {isLoading ? (<div className="space-y-8">
                        {/* Mostrar 5 esqueletos como placeholders */}
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className='flex items-center'>
                            <Skeleton className='h-9 w-9 rounded-full' />{" "}
                            {/* Avatar skeleton */}
                            <div className='ml-4 space-y-1'>
                              <Skeleton className='h-4 w-24' />{" "}
                              {/* Nombre skeleton */}
                              <Skeleton className='h-3 w-40' />{" "}
                              {/* Email skeleton */}
                            </div>
                            <Skeleton className='ml-auto h-4 w-4' />{" "}
                            {/* Chevron icon skeleton */}
                          </div>
                        ))}
                      </div>) : (
            <div className="space-y-8 ml-4">
              {clients.map((client, i) => (
                <div key={i} className='flex items-center'>
                  <Avatar className='h-9 w-9'>
                    <AvatarFallback>{client.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className='ml-3 space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {client.name}
                    </p>
                    <div className='flex items-center text-sm text-muted-foreground'>
                      <Mail className='mr-1 h-3 w-3' />
                      {client.email ? client.email : client.phone}
                    </div>
                  </div>
                  <Link href='/clients' className='ml-auto'>
                    <Button variant='ghost' size='sm'>
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </Link>
                </div>
              ))} </div>)}
  </div>
  );
};

export default ClientList;
