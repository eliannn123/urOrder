"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchClientsAction, updateClientAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Edit, Mail, Phone, User, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { addClientAction } from "@/app/actions";
import { Skeleton } from "./ui/skeleton";

const handlefetchClients = async () => {
  const clients = await fetchClientsAction();
  return (clients as unknown) as { name: string; email?: string; phone?: string; id?: number }[];
};
const handleUpdateClients = async (updateData: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}) => {
  await updateClientAction(updateData);
};
const ClientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clients, setClients] = useState<
    { name: string; email?: string; phone?: string; id?: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateData, setUpdateData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const supabase = createClient();

    const fetchClients = async () => {
      const clientsData = await handlefetchClients();
      setClients(clientsData);
      setIsLoading(false);
    };

    fetchClients();

    const clientChannel = supabase
      .channel("custom-insert-delete-update-clients-list-channel-two")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clients" },
        (payload) => {
          fetchClients();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "clients" },
        (payload) => {
          fetchClients();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clients" },
        (payload) => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientChannel);
    };
  }, []);

  return (
    <div className='container mx-auto p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Lista de Clientes</h1>
        <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Ingrese los detalles del nuevo cliente aquí. Haga clic en
                guardar cuando termine.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await addClientAction(formData);
                setClientDialogOpen(false);
              }}
            >
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='name' className='text-right'>
                    Nombre
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    className='col-span-3'
                    required
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='email' className='text-right'>
                    Email
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='phone' className='text-right'>
                    Teléfono
                  </Label>
                  <Input id='phone' name='phone' className='col-span-3' />
                </div>
              </div>
              <div className='flex justify-end'>
                <Button type='submit'>Guardar Cliente</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Input
        type='text'
        placeholder='Buscar clientes...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='mb-4'
      />
      {isLoading ? (
        <div className='container mx-auto p-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className='overflow-hidden'>
                <CardHeader className='flex flex-row items-center gap-4 pb-2'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-[150px]' />
                    <Skeleton className='h-4 w-[100px]' />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-2 mb-4'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-[120px]' />
                  </div>
                  <Skeleton className='h-9 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {clients
            .sort((a, b) => (a.name > b.name ? 1 : -1)) // Ordenar por nombre
            .map((client, i) => (
              <Card key={i}>
                <CardHeader className='flex flex-row items-center gap-4'>
                  <Avatar>
                    <AvatarFallback>{client.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{client.name}</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      {client.email}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Phone className='h-4 w-4' />
                    {client.phone}
                  </div>
                  <Dialog
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingClient(false);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant='outline' className='w-full mt-4'>
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingClient ? "Editar Cliente" : client.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className='grid gap-4 py-4'>
                        {editingClient ? (
                          <>
                            <div className='flex items-center gap-4'>
                              <User className='h-4 w-4 text-muted-foreground' />
                              <Input
                                placeholder='Nombre'
                                value={updateData.name}
                                onChange={(e) =>
                                  setUpdateData({
                                    ...updateData,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className='flex items-center gap-4'>
                              <Mail className='h-4 w-4 text-muted-foreground' />
                              <Input
                                placeholder='Email'
                                value={updateData.email}
                                onChange={(e) =>
                                  setUpdateData({
                                    ...updateData,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className='flex items-center gap-4'>
                              <Phone className='h-4 w-4 text-muted-foreground' />
                              <Input
                                placeholder='Teléfono'
                                value={updateData.phone}
                                onChange={(e) =>
                                  setUpdateData({
                                    ...updateData,
                                    phone: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className='flex items-center gap-4'>
                              <User className='h-4 w-4 text-muted-foreground' />
                              <span>{client.name}</span>
                            </div>
                            <div className='flex items-center gap-4'>
                              <Mail className='h-4 w-4 text-muted-foreground' />
                              <span>{client.email}</span>
                            </div>
                            <div className='flex items-center gap-4'>
                              <Phone className='h-4 w-4 text-muted-foreground' />
                              <span>{client.phone}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        {editingClient ? (
                          <Button
                            onClick={() => {
                              handleUpdateClients({
                                id: client.id?.toString() || "",
                                name: updateData.name || client.name,
                                email: updateData.email || client.email,
                                phone: updateData.phone || client.phone,
                              });
                              setEditingClient(false);
                            }}
                          >
                            Guardar Cambios
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setEditingClient(true);
                            }}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Editar
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default ClientList;
