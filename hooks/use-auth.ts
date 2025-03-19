"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!session) return null;
      const response = await fetch("/api/auth/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!session,
  });

  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("You have been signed in successfully.");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to sign in");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Check your email for the confirmation link.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to sign up");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to log out");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log out");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Error) => {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return true;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  return {
    session,
    profile,
    loading,
    isAuthenticated: !!session,
    signIn: (email: string, password: string) =>
      signInMutation.mutate({ email, password }),
    signUp: (email: string, password: string) =>
      signUpMutation.mutate({ email, password }),
    logout: () => logoutMutation.mutate(),
    updateProfile: (profileData: any) =>
      updateProfileMutation.mutate(profileData),
  };
}
