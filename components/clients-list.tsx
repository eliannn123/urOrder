"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchClientsAction, updateClientAction, addClientAction } from "@/app/actions";
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
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

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

export default function AllClients() {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clients, setClients] = useState<{ name: string; email?: string; phone?: string; id?: number }[]>([]);
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

  const handleSort = (column: 'name' | 'email' | 'phone') => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const compareValue = sortDirection === 'asc' ? 1 : -1;
      const aValue = a[sortColumn as keyof typeof a] || '';
      const bValue = b[sortColumn as keyof typeof b] || '';
      return aValue > bValue ? compareValue : -compareValue;
    });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-white">Todos los Clientes</CardTitle>
          {isLoading ? (
            <Skeleton className="h-10 w-[140px] bg-gray-700" />
          ) : (
            <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-700 hover:bg-gray-600 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
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
                      <Input id='phone' name='phone' className='col-span-3' />
                    </div>
                  </div>
                  <div className='flex justify-end'>
                    <Button type='submit'>Guardar Cliente</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
          
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-10 w-[250px] bg-gray-700" />
                <Skeleton className="h-10 w-[120px] bg-gray-700" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Nombre</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Teléfono</TableHead>
                    <TableHead className="text-gray-300">Último Contacto</TableHead>
                    <TableHead className="text-right text-gray-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell><Skeleton className="h-4 w-[120px] bg-gray-700" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[180px] bg-gray-700" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px] bg-gray-700" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px] bg-gray-700" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-[60px] inline-block bg-gray-700 mr-2" />
                        <Skeleton className="h-8 w-[60px] inline-block bg-gray-700" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300" onClick={() => handleSort('name')}>
                    Nombre {sortColumn === 'name' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                  </TableHead>
                  <TableHead className="text-gray-300" onClick={() => handleSort('email')}>
                    Email {sortColumn === 'email' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                  </TableHead>
                  <TableHead className="text-gray-300" onClick={() => handleSort('phone')}>
                    Teléfono {sortColumn === 'phone' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                  </TableHead>
                  <TableHead className="text-right text-gray-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredClients.map((client) => (
                  <TableRow key={client.id} className="border-gray-700 hover:bg-gray-800">
                    <TableCell className="font-medium text-white">{client.name}</TableCell>
                    <TableCell className="text-gray-300">{client.email}</TableCell>
                    <TableCell className="text-gray-300">{client.phone}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingClient ? "Editar Cliente" : client.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className='grid gap-4 py-4'>
                                <div className='flex items-center gap-4'>
                                  <User className='h-4 w-4 text-white' />
                                  <Input
                                    placeholder= {client.name}
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
                                  <Mail className='h-4 w-4 text-white' />
                                  <Input
                                    placeholder={client.email}
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
                                  <Phone className='h-4 w-4 text-white' />
                                  <Input
                                    placeholder={client.phone}
                                    value={updateData.phone}
                                    onChange={(e) =>
                                      setUpdateData({
                                        ...updateData,
                                        phone: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                </div>
                          <DialogFooter>
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
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
