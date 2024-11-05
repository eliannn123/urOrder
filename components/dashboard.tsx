"use client";
import { useState, useEffect } from "react";
import { Users, Briefcase, Calendar, UserPlus, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import Link from "next/link";
import {
  signOutAction,
  addClientAction,
  addSupplierAction,
  countClientsAction,
  countSuppliersAction,
  getUserAction,
} from "@/app/actions";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import Clients from "./clientsds";
import Suppliers from "./suppliers";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("resumen");
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [clientsCount, setClientsCount] = useState<number | null>(null);
  const [suppliersCount, setSuppliersCount] = useState<number | null>(null);
  const [user, setUser] = useState<{ email: string; username: string } | null>(
    null
  );
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserAction();
      if (userData && "email" in userData && "username" in userData) {
        setUser(userData as { email: string; username: string });
      }
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    const supabase = createClient();

    const fetchClientsCount = async () => {
      const count = await countClientsAction();
      setClientsCount(Array.isArray(count) ? count.length : count);
    };

    fetchClientsCount();

    const clientChannel = supabase
      .channel("custom-insert-delete-clients-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "clients" },
        (payload) => {
          fetchClientsCount();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "clients" },
        (payload) => {
          console.log("Cliente eliminado:", payload);
          fetchClientsCount(); // Actualizar el conteo cuando se elimina un cliente
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientChannel);
    };
  }, []);
  useEffect(() => {
    const supabase = createClient();

    const fetchSuppliersCount = async () => {
      const count = await countSuppliersAction();
      setSuppliersCount(Array.isArray(count) ? count.length : count);
    };

    fetchSuppliersCount();

    const supplierChannel = supabase
      .channel("custom-insert-delete-suppliers-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "suppliers" },
        (payload) => {
          fetchSuppliersCount(); // Actualizar el conteo cuando se agrega un nuevo proveedor
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "suppliers" },
        (payload) => {
          fetchSuppliersCount(); // Actualizar el conteo cuando se elimina un proveedor
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(supplierChannel);
    };
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
  };
  return (
    <div className='min-h-screen bg-gray-900'>
      <header className='bg-gray-800 border-b border-gray-700 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <h1 className='text-xl font-semibold text-white'>UrOrder</h1>
            <div className='flex items-center space-x-4'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-8 w-8 rounded-full'
                  >
                    <Avatar>
                      <AvatarFallback>
                        {user?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='bg-white'>
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='cursor-pointer hover:bg-slate-100'
                    asChild
                  >
                    <Link href='/profile'>Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='cursor-pointer hover:bg-slate-100'
                    onClick={handleSignOut}
                  >
                    {" "}
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-3 mb-8'>
            <TabsTrigger value='resumen'>Resumen</TabsTrigger>
            <TabsTrigger value='clientes'>Clientes</TabsTrigger>
            <TabsTrigger value='proveedores'>Proveedores</TabsTrigger>
          </TabsList>
          <TabsContent value='resumen'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Clientes
                  </CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {clientsCount !== null ? clientsCount : "Cargando..."}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Proveedores
                  </CardTitle>
                  <Briefcase className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {suppliersCount !== null ? suppliersCount : "Cargando..."}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Próximas Reuniones
                  </CardTitle>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'></div>
                </CardContent>
              </Card>
            </div>
            <div className='grid gap-4 md:grid-cols-2 mt-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Agregar Cliente
                  </CardTitle>
                  <UserPlus className='h-4 w-4 text-white' />
                </CardHeader>
                <CardContent>
                  <Dialog
                    open={clientDialogOpen}
                    onOpenChange={setClientDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className='w-full'>Nuevo Cliente</Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[425px]'>
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                        <DialogDescription>
                          Ingrese los detalles del nuevo cliente aquí. Haga clic
                          en guardar cuando termine.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault(); // Prevenir el comportamiento por defecto
                          const formData = new FormData(e.currentTarget); // Obtener los datos del formulario
                          await addClientAction(formData);
                          setClientDialogOpen(false); // Cerrar el diálogo después de agregar
                        }}
                      >
                        <div className='grid gap-4 py-4 '>
                          <div className='grid grid-cols-4 items-center gap-4 '>
                            <Label htmlFor='name' className='text-right text-white'>
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
                            <Label htmlFor='email' className='text-right text-white'>
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
                            <Label htmlFor='phone' className='text-right text-white'>
                              Teléfono
                            </Label>
                            <Input
                              id='phone'
                              name='phone'
                              className='col-span-3'
                            />
                          </div>
                        </div>
                        <div className='flex justify-end'>
                          <Button type='submit'>Guardar Cliente</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Agregar Proveedor
                  </CardTitle>
                  <Building className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <Dialog
                    open={providerDialogOpen}
                    onOpenChange={setProviderDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className='w-full'>Nuevo Proveedor</Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[425px]'>
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
                        <DialogDescription>
                          Ingrese los detalles del nuevo proveedor aquí. Haga
                          clic en guardar cuando termine.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault(); // Prevenir el comportamiento por defecto
                          const formData = new FormData(e.currentTarget); // Obtener los datos del formulario
                          await addSupplierAction(formData);
                          setProviderDialogOpen(false); // Cerrar el diálogo después de agregar
                        }}
                      >
                        <div className='grid gap-4 py-4'>
                          <div className='grid grid-cols-4 items-center gap-4'>
                            <Label
                              htmlFor='providerName'
                              className='text-right text-white'
                            >
                              Nombre de la empresa
                            </Label>
                            <Input
                              id='providerName'
                              name='name'
                              className='col-span-3'
                              required
                            />
                          </div>
                          <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='person_name' className='text-right text-white'>
                              Nombre de la persona responsable
                            </Label>
                            <Input
                              id='person_name'
                              name='person_name'
                              className='col-span-3'
                              required
                            />
                          </div>
                          <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='contact' className='text-right text-white'>
                              Email
                            </Label>
                            <Input
                              id='contact'
                              name='email'
                              className='col-span-3'
                            />
                          </div>
                          <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='location' className='text-right text-white'>
                              Phone
                            </Label>
                            <Input
                              id='location'
                              name='phone'
                              className='col-span-3'
                              required
                            />
                          </div>
                          <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='location' className='text-right text-white'>
                              Producto
                            </Label>
                            <Input
                              id='location'
                              name='type'
                              className='col-span-3'
                              required
                            />
                          </div>
                        </div>
                        <div className='flex justify-end'>
                          <Button type='submit'>Guardar Proveedor</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
            <Card className='mt-4'>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-8'>
                  {[
                    {
                      name: "Ana García",
                      action: "Nueva cliente agregada",
                      date: "Hace 2 días",
                    },
                    {
                      name: "Proveedor XYZ",
                      action: "Contrato renovado",
                      date: "Hace 1 semana",
                    },
                    {
                      name: "Carlos Pérez",
                      action: "Reunión programada",
                      date: "Para mañana",
                    },
                  ].map((activity, i) => (
                    <div key={i} className='flex items-center'>
                      <Avatar className='h-9 w-9'>
                        <AvatarFallback>{activity.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className='ml-4 space-y-1'>
                        <p className='text-sm font-medium leading-none'>
                          {activity.name}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {activity.action}
                        </p>
                      </div>
                      <div className='ml-auto text-sm text-muted-foreground'>
                        {activity.date}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='clientes'>
            <div className='grid gap-6 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Mis Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Clients />
                  <Link href='/clients'>
                    <Button className='w-full mt-4'>
                      Ver todos los clientes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className='h-[18.75rem] md:h-full'>
                <CardHeader>
                  <CardTitle>Pedidos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href='/clients'>
                    <Button className='w-full mt-4'>
                      Ver todos los pedidos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='proveedores'>
            <div className='grid gap-6 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Mis Proveedores</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suppliers />
                  <Link href='/suppliers'>
                    <Button className='w-full mt-4'>
                      Ver todos los proveedores
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className='h-[18.75rem] md:h-full'>
                <CardHeader>
                  <CardTitle>Pedidos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href='/clients'>
                    <Button className='w-full mt-4'>
                      Ver todos los pedidos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
