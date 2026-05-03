import { useQuery } from '@tanstack/react-query';
import { ChainTransaction, TxType, TxStatus } from '@/constants/mockData';

const ETHERSCAN_API = 'https://api.etherscan.io/api';
const POLYGONSCAN_API = 'https://api.polygonscan.com/api';

const ETHERSCAN_KEY = process.env.EXPO_PUBLIC_ETHERSCAN_API_KEY ?? '';
const POLYGONSCAN_KEY = process.env.EXPO_PUBLIC_POLYGONSCAN_API_KEY ?? '';

interface EtherscanTx {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  confirmations: string;
  isError: string;
  input: string;
  nonce: string;
  functionName?: string;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTx[] | string;
}

function formatEthValue(weiHex: string, symbol: string): string {
  try {
    const wei = BigInt(weiHex);
    const eth = Number(wei) / 1e18;
    if (eth === 0) return `0 ${symbol}`;
    return `${eth.toFixed(6).replace(/\.?0+$/, '')} ${symbol}`;
  } catch {
    return `— ${symbol}`;
  }
}

function formatGasUsed(gasUsed: string, symbol: string): string {
  const n = parseInt(gasUsed, 10);
  if (isNaN(n)) return '—';
  const cost = (n * 20e9) / 1e18;
  return `~${cost.toFixed(6).replace(/\.?0+$/, '')} ${symbol}`;
}

function deriveTxType(tx: EtherscanTx, walletAddress: string): TxType {
  const from = tx.from.toLowerCase();
  const to = (tx.to ?? '').toLowerCase();
  const wallet = walletAddress.toLowerCase();
  if (to === wallet) return 'Token Reward';
  if (from === wallet && tx.input && tx.input.length > 10) return 'Donation';
  if (from === wallet) return 'Request';
  return 'Verification';
}

function deriveTxStatus(tx: EtherscanTx): TxStatus {
  if (tx.isError === '1') return 'Failed';
  const conf = parseInt(tx.confirmations, 10);
  if (isNaN(conf) || conf === 0) return 'Pending';
  return 'Confirmed';
}

function mapEtherscanTx(
  tx: EtherscanTx,
  walletAddress: string,
  network: 'Ethereum' | 'Polygon',
  index: number,
): ChainTransaction {
  const symbol = network === 'Polygon' ? 'MATIC' : 'ETH';
  const type = deriveTxType(tx, walletAddress);
  const status = deriveTxStatus(tx);

  const toDisplay =
    tx.to
      ? tx.to.slice(0, 6) + '…' + tx.to.slice(-4)
      : 'Contract Creation';

  return {
    id: `${network}-${tx.hash}-${index}`,
    txHash: tx.hash,
    blockNumber: parseInt(tx.blockNumber, 10),
    type,
    status,
    foodType: formatEthValue(tx.value, symbol),
    quantity: tx.functionName ? tx.functionName.split('(')[0] : 'transfer',
    from: tx.from.slice(0, 6) + '…' + tx.from.slice(-4),
    to: toDisplay,
    gasUsed: formatGasUsed(tx.gasUsed, symbol),
    hbkTokens: 0,
    timestamp: new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString(),
    network,
    confirmations: parseInt(tx.confirmations, 10) || 0,
  };
}

async function fetchTransactions(
  baseUrl: string,
  address: string,
  apiKey: string,
  network: 'Ethereum' | 'Polygon',
): Promise<ChainTransaction[]> {
  const keyParam = apiKey ? `&apikey=${apiKey}` : '';
  const url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=25&sort=desc${keyParam}`;

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${network} fetch failed: ${res.status}`);

  const data: EtherscanResponse = await res.json();

  if (data.status !== '1') {
    if (typeof data.result === 'string' && data.result.toLowerCase().includes('no transactions')) {
      return [];
    }
    throw new Error(data.message ?? `${network} API error`);
  }

  const txs = data.result as EtherscanTx[];
  return txs.map((tx, i) => mapEtherscanTx(tx, address, network, i));
}

export interface WalletTransactionsResult {
  transactions: ChainTransaction[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
  hasApiKey: boolean;
}

export function useWalletTransactions(walletAddress: string, enabled: boolean): WalletTransactionsResult {
  const hasApiKey = Boolean(ETHERSCAN_KEY && POLYGONSCAN_KEY);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['walletTransactions', walletAddress],
    enabled: enabled && Boolean(walletAddress),
    staleTime: 60_000,
    retry: 1,
    queryFn: async () => {
      const [ethTxs, polyTxs] = await Promise.allSettled([
        fetchTransactions(ETHERSCAN_API, walletAddress, ETHERSCAN_KEY, 'Ethereum'),
        fetchTransactions(POLYGONSCAN_API, walletAddress, POLYGONSCAN_KEY, 'Polygon'),
      ]);

      const result: ChainTransaction[] = [];

      if (ethTxs.status === 'fulfilled') result.push(...ethTxs.value);
      if (polyTxs.status === 'fulfilled') result.push(...polyTxs.value);

      if (result.length === 0) {
        const ethErr = ethTxs.status === 'rejected' ? ethTxs.reason?.message : null;
        const polyErr = polyTxs.status === 'rejected' ? polyTxs.reason?.message : null;
        const combinedErr = [ethErr, polyErr].filter(Boolean).join('; ');
        if (combinedErr) throw new Error(combinedErr);
      }

      return result.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    },
  });

  const errorMessage = isError
    ? ((error as Error)?.message ?? 'Failed to load transactions')
    : null;

  return {
    transactions: data ?? [],
    isLoading,
    isError,
    errorMessage,
    refetch,
    hasApiKey,
  };
}
