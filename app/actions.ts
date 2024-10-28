"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UUID } from "crypto";

export const signUpAction = async (formData: FormData) => {
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password || !username) {
    return { error: "Username, email and password are required" };
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !signUpData?.user) {
    console.error(error?.code + " " + error?.message);
    return encodedRedirect(
      "error",
      "/sign-up",
      error?.message || "Error signing up"
    );
  }

  const userId = signUpData.user.id;

  const { error: dbError } = await supabase
    .from("users")
    .insert([
      { id: userId, username: username, email: email, password: password },
    ]);

  if (dbError) {
    console.error("Error al insertar en la tabla users:", dbError.message);
    return encodedRedirect("error", "/sign-up", dbError.message);
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const deleteUserAction = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError.message);
    return redirect("/error?message=Error fetching user data");
  }

  if (!user) {
    console.error("No user found");
    return redirect("/error?message=No user found");
  }

  const userEmail = user.email;
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("email", userEmail)
    .select();

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error("Error signing out:", signOutError.message);
    return redirect("/error?message=Error signing out");
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/dashboard/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const addClientAction = async (formData: FormData) => {
  const supabase = createClient();
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const phone = formData.get("phone")?.toString();

  const { error, data } = await supabase
    .from("clients")
    .insert([{ name: name, email: email, phone: phone }])
    .select();
};
export const addSupplierAction = async (formData: FormData) => {
  const supabase = createClient();
  const name = formData.get("name")?.toString();
  const person_name = formData.get("person_name")?.toString();
  const email = formData.get("email")?.toString();
  const phone = formData.get("phone")?.toString();
  const type = formData.get("type")?.toString();

  const { error, data } = await supabase
    .from("suppliers")
    .insert([
      {
        name: name,
        email: email,
        phone: phone,
        type: type,
        person_name: person_name,
      },
    ])
    .select();
  console.log(error, data);
};

export const countClientsAction = async () => {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("clients")
    .select("*", { count: "exact" });

  if (error) {
    console.error(error);
    return 0;
  }

  return count || 0;
};
export const countSuppliersAction = async () => {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("suppliers")
    .select("*", { count: "exact" });

  if (error) {
    console.error(error);
    return 0;
  }

  return count || 0;
};

export const fetchClientsAction = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};
export const fetchSuppliersAction = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from("suppliers").select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};

export const updateClientAction = async (clientData: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  person_name?: string;
  type?: string;
}) => {
  const supabase = createClient();

  const { error, data } = await supabase
    .from("clients")
    .update({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      person_name: clientData.person_name,
      type: clientData.type,
    })
    .match({ id: clientData.id })
    .select();

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};

export const updateSupplierAction = async (supplierData: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  person_name?: string;
  type?: string;
}) => {
  const supabase = createClient();

  const { error, data } = await supabase
    .from("suppliers")
    .update({
      name: supplierData.name,
      email: supplierData.email,
      phone: supplierData.phone,
      person_name: supplierData.person_name,
      type: supplierData.type,
    })
    .match({ id: supplierData.id })
    .select();

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};
export const getUserAction = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error fetching authenticated user:', authError);
    return null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('email, username')
    .eq('id', user.id)
    .single();
  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
  return data;
};
export const updateUserAction = async (userData :{
  id: string;
  username: string;
  email: string;
  password: string
}) =>{
  const supabase = createClient();
  const data = await supabase.auth.updateUser({
    email: userData.email,
    password : userData.password
  })
  const dataa = supabase.from("users")
  .update({
    username: userData.username,
    email: userData.email,
    password: userData.password
  })
  .match({ id: userData.id })
  .select();
  return ({data,dataa});
}