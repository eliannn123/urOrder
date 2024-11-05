"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchSuppliersAction, updateSupplierAction, addSupplierAction } from "@/app/actions";
import { ChevronDown, ChevronUp, Search, MapPin, Building, Plus, Edit, User, Mail, Phone, ShoppingBasket } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
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

const handleUpdateSupplier = async (updateData: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  person_name?: string;
  type?: string;
}) => {
  await updateSupplierAction(updateData);
};
const handleFetchSuppliers = async () => {
  const suppliers = await fetchSuppliersAction();
  return (suppliers as unknown ) as { name: string; email?: string; phone?: string; id?: number; person_name?: string; type?: string; }[];
};

export default function AllProviders() {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<{
    name: string;
    email?: string;
    phone?: string;
    person_name?: string;
    type?: string;
    id?: number;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(false);
  const [updateData, setUpdateData] = useState({
    name: "",
    person_name: "",
    email: "",
    phone: "",
    type: "",
  });

  useEffect(() => {
    const supabase = createClient();

    const fetchSuppliers = async () => {
      const suppliersData = await handleFetchSuppliers();
      setSuppliers(suppliersData);
      setIsLoading(false);
    };

    fetchSuppliers();

    const supplierChannel = supabase
      .channel("custom-insert-delete-update-suppliers-list-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suppliers" },
        () => {
          fetchSuppliers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(supplierChannel);
    };
  }, []);

  const handleSort = (column: 'name' | 'person_name' | 'type') => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredSuppliers = suppliers
    .filter(supplier => 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const compareValue = sortDirection === 'asc' ? 1 : -1;
      return (a[sortColumn as keyof typeof a] ?? '') > (b[sortColumn as keyof typeof b] ?? '') ? compareValue : -compareValue;
    });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-white">Todos los Proveedores</CardTitle>
          <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-700 hover:bg-gray-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Agregar Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
                <DialogDescription>
                  Ingrese los detalles del nuevo proveedor aquí. Haga clic en
                  guardar cuando termine.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault(); // Prevenir el comportamiento por defecto
                  const formData = new FormData(e.currentTarget); // Obtener los datos del formulario
                  await addSupplierAction(formData);
                  setSupplierDialogOpen(false); // Cerrar el diálogo después de agregar
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
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='type' className='text-right'>
                      Producto
                    </Label>
                    <Input id='type' name='type' className='col-span-3' />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='person_name' className='text-right'>
                      Responsable
                    </Label>
                    <Input
                      id='person_name'
                      name='person_name'
                      className='col-span-3'
                    />
                  </div>
                </div>
                <div className='flex justify-end'>
                  <Button type='submit'>Guardar Proveedor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800 ">
                  <TableHead className="text-gray-300" onClick={() => handleSort('name')}>
                    Nombre {sortColumn === 'name' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                  </TableHead>
                  <TableHead className="text-gray-300" onClick={() => handleSort('person_name')}>
                    Contacto {sortColumn === 'person_name' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                  </TableHead>
                  <TableHead className="text-gray-300" onClick={() => handleSort('type')}>
                    Tipo {sortColumn === 'type' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
                  </TableHead>
                  <TableHead className="text-right text-gray-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="border-gray-700 hover:bg-gray-800">
                    <TableCell className="font-medium text-white">{supplier.name}</TableCell>
                    <TableCell className="text-gray-300">{supplier.person_name}</TableCell>
                    <TableCell className="text-gray-300">{supplier.type}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingSupplier ? "Editar Cliente" : supplier.name}
                            </DialogTitle>
                          </DialogHeader>
                            <form
                              id='update-supplier-form'
                              onSubmit={(e) => e.preventDefault()}
                              className='grid gap-4'
                            >
                              <div className='flex items-center gap-4'>
                                <Building className='h-4 w-4 text-white' />
                                <Input
                                  placeholder={supplier.name}
                                  value={updateData.name} // Usar solo el valor de updateData
                                  onChange={(e) =>
                                    setUpdateData({
                                      ...updateData,
                                      name: e.target.value,
                                    })
                                  } // Actualizar el valor directamente
                                />
                              </div>
                              <div className='flex items-center gap-4'>
                                <User className='h-4 w-4 text-white' />
                                <Input
                                  placeholder={supplier.person_name}
                                  value={updateData.person_name}
                                  onChange={(e) =>
                                    setUpdateData({
                                      ...updateData,
                                      person_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className='flex items-center gap-4'>
                                <Mail className='h-4 w-4 text-white' />
                                <Input
                                  placeholder={supplier.email}
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
                                  placeholder={supplier.phone}
                                  value={updateData.phone}
                                  onChange={(e) =>
                                    setUpdateData({
                                      ...updateData,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className='flex items-center gap-4'>
                                <ShoppingBasket className='h-4 w-4 text-white' />
                                <Input
                                  placeholder={supplier.type}
                                  value={updateData.type}
                                  onChange={(e) =>
                                    setUpdateData({
                                      ...updateData,
                                      type: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </form>
                          <DialogFooter>
                              <Button
                                onClick={() => {
                                  handleUpdateSupplier({
                                    id: supplier.id?.toString() || "",
                                    name: updateData.name || supplier.name,
                                    email: updateData.email || supplier.email,
                                    phone: updateData.phone || supplier.phone,
                                    person_name:
                                      updateData.person_name || supplier.person_name,
                                    type: updateData.type || supplier.type,
                                  });
                                  setEditingSupplier(false);
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
