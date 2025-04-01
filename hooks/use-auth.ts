"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOfflineAuth } from "@/lib/offline-auth";
import { useOffline } from "@/hooks/use-offline";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { isOnline } = useOffline();
  const { isOfflineAuthenticated, offlineUser, offlineSignOut } = useOfflineAuth();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      if (!isOnline) return null;
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    enabled: isOnline,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!isOnline || !session) {
        if (isOfflineAuthenticated && offlineUser) {
          return {
            user: {
              id: offlineUser.id,
              email: offlineUser.email,
            },
            profile: {
              id: offlineUser.id,
              username: offlineUser.username || offlineUser.email.split("@")[0],
              full_name: offlineUser.username,
              avatar_url: null,
            },
          };
        }
        return null;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not found");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      return { user, profile };
    },
    enabled: !!session || isOfflineAuthenticated,
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
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
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
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
      if (isOnline && session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else if (!isOnline) {
        await offlineSignOut();
      }
      return true;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
      router.refresh();
      toast.success("You have been logged out successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log out");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!isOnline) {
        throw new Error("You need to be online to update your profile");
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not found");

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (error) throw error;
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

  const isAuthenticated = isOnline ? !!session : isOfflineAuthenticated;

  return {
    session,
    profile,
    loading,
    isAuthenticated,
    isOfflineMode: !isOnline,
    signIn: (email: string, password: string) =>
      signInMutation.mutate({ email, password }),
    signUp: (email: string, password: string) =>
      signUpMutation.mutate({ email, password }),
    logout: () => logoutMutation.mutate(),
    updateProfile: (profileData: any) =>
      updateProfileMutation.mutate(profileData),
  };
}
