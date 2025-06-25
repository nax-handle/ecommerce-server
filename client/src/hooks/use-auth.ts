import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as auth from "@/lib/services/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: auth.getCurrentUser,
    enabled: true, // Always enabled for dummy mode
  });

  const register = useMutation({
    mutationFn: auth.register,
    onSuccess: (data, variables) => {
      router.push(`/auth/verify?email=${encodeURIComponent(variables.email)}`);
    },
  });
  const verify = useMutation({
    mutationFn: auth.verify,
    onSuccess: () => {
      router.push("/auth/login");
    },
  });
  const login = useMutation({
    mutationFn: auth.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/");
    },
  });

  const logout = useMutation({
    mutationFn: auth.logout,
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      router.push("/auth/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: true, // Always authenticated in dummy mode
    register: register.mutate,
    verify: verify.mutate,
    login: login.mutate,
    logout: logout.mutate,
    registerError: register.error,
    verifyError: verify.error,
    loginError: login.error,
    logoutError: logout.error,
    isRegistering: register.isPending,
    isVerifying: verify.isPending,
    isLoggingIn: login.isPending,
    isLoggingOut: logout.isPending,
  };
}
