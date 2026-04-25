import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

export function useAuth() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      connect({ connector: connectors[0] });
      toast({
        title: "Wallet Connecting...",
        description: "Please approve the connection in your wallet.",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (message: string, signature: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(signature, message, address!);
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.error || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    disconnect();
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  }, [disconnect, navigate]);

  return {
    connectWallet,
    login,
    logout,
    isConnected,
    address,
    user,
    isLoading,
    connectors,
  };
}
