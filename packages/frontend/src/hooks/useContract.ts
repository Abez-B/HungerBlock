import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletClient } from 'wagmi';
import { http, createPublicClient, encodeFunctionData } from 'viem';
import { sepolia } from 'wagmi/chains';
import HungerBlockABI from '../../../contracts/artifacts/contracts/HungerBlock.sol/HungerBlock.json';

const HUNGERBLOCK_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export function useContractWrite() {
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const writeContract = async <T>(
    functionName: string,
    args: any[],
    onSuccess?: (result: any) => void,
    errorMessage?: string
  ): Promise<T | null> => {
    if (!walletClient) {
      setError(new Error('Wallet not connected'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await walletClient.writeContract({
        address: HUNGERBLOCK_ADDRESS,
        abi: HungerBlockABI.abi,
        functionName,
        args,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (onSuccess) {
        onSuccess(receipt);
      }

      return receipt as T;
    } catch (err: any) {
      const error = new Error(errorMessage || err.message || 'Transaction failed');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    writeContract,
    isLoading,
    error,
    resetError: () => setError(null),
  };
}

export function useReadContract() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const readContract = async <T>(
    functionName: string,
    args?: any[]
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await publicClient.readContract({
        address: HUNGERBLOCK_ADDRESS,
        abi: HungerBlockABI.abi,
        functionName,
        args: args || [],
      });
      setData(result);
      return result as T;
    } catch (err: any) {
      setError(new Error(err.message || 'Failed to read contract'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    readContract,
    data,
    isLoading,
    error,
    reset: () => {
      setData(null);
      setError(null);
    },
  };
}
