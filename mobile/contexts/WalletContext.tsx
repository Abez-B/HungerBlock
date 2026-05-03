import React, { createContext, useContext, useState } from 'react';

interface WalletContextValue {
  connected: boolean;
  walletAddress: string;
  connect: (address: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  connected: false,
  walletAddress: '',
  connect: () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connect = (address: string) => {
    setWalletAddress(address);
    setConnected(true);
  };

  const disconnect = () => {
    setConnected(false);
    setWalletAddress('');
  };

  return (
    <WalletContext.Provider value={{ connected, walletAddress, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
