'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback} from "@/components/ui/avatar"
import Link from 'next/link'
import {deleteUserAction, getUserAction} from "@/app/actions";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [updateData, setUpdateData] = useState({
    username: "",
    email: "",
    password: "",
  });
  /* const handleUpdateUser = async (updateData: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  }) => {
    await updateuUserAction(updateData);
  }; */
    const handleDelete = async () => {
        await deleteUserAction();
      };
        const [user, setUser] = useState<{ email: string; username: string } | null>(null);
        useEffect(() => {
          const fetchUserData = async () => {
            const userData = await getUserAction();
            setUser(userData);
            setIsLoading(false)
          };
      
          fetchUserData();
        }, []);
      
    return (
      <div>
      {isLoading ? (<div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-24 h-24 rounded-full">
                <Avatar className="w-24 h-24">
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </Skeleton>
              <div>
                <Skeleton className="h-8 w-40" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Username</p>
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Password</p>
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="flex justify-between">
              <Button disabled={isLoading}>Edit Data</Button>
              <Button variant="destructive" disabled={isLoading}>Delete User</Button>
              <Link href="/">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>) : (<div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback>{user?.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="text-lg">{user?.username}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Passsword</p>
                <p className="text-lg">*******</p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button>Edit Data</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete User</Button>
              <Link href="/">
                <Button variant="outline">Volver al Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>)}
      </div>
    )
}
