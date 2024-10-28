"use client";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Mail,Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { fetchSuppliersAction } from "@/app/actions";
import { Skeleton } from "./ui/skeleton";

const handlefetchSuppliers = async () => {
    const suppliers = await fetchSuppliersAction();
    return suppliers;
  };
const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState<{ name: string; email?: string; phone?: string, person_name?: string }[]>([]); // Asegúrate de que esto esté aquí
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const supabase = createClient();

    const fetchSuppliers = async () => {
        const suppliersData: { name: string; email?: string; phone?: string, person_name?: string }[] = await handlefetchSuppliers();
        setSuppliers(suppliersData.slice(0, 5)); 
        setIsLoading(false)
    };

    // Llamar a la función de inmediato para cargar los datos iniciales
    fetchSuppliers();

    // Suscribirse a eventos de INSERT y DELETE para la tabla 'clients'
    const supplierChannel = supabase
      .channel("custom-insert-delete-suppliers-list-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "suppliers" },
        (payload) => {;
          fetchSuppliers(); // Volver a cargar la lista cuando se inserte un cliente
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "suppliers" },
        (payload) => {
          fetchSuppliers(); // Volver a cargar la lista cuando se elimine un cliente
        }
      )
      .subscribe();

    // Limpiar la suscripción al desmontar el componente
    return () => {
      supabase.removeChannel(supplierChannel);
    };
  }, []);

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="space-y-8">
          {/* Mostrar 5 esqueletos como placeholders */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-9 w-9 rounded-full" /> {/* Avatar skeleton */}
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-24" /> {/* Nombre skeleton */}
                <Skeleton className="h-3 w-40" /> {/* Email skeleton */}
              </div>
              <Skeleton className="ml-auto h-4 w-4" /> {/* Chevron icon skeleton */}
            </div>
          ))}
        </div>
      ) : (
            suppliers.map((client, i) => (
            <div key={i} className="flex items-center">
                <Avatar className="h-9 w-9">
                <AvatarFallback>{client.name[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{client.name}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-3 w-3" />
                    {client.person_name}
                </div>
                </div>
                <Link href="/suppliers" className="ml-auto">
                <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                </Button>
                </Link>
            </div>
            ))
      )}
    </div>
  );
};

export default SuppliersList;
