import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi'; 
import { parseUnits, formatUnits } from 'viem';
import { VAULT_ABI, VAULT_ADDRESS, USDC_ABI, USDC_ADDRESS } from '../constants';

declare var window: any;

const Home: NextPage = () => {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  
  const { writeContract, isPending, error } = useWriteContract();

  // --- OLVASÁSOK ---

  // 1. Vault Total Assets (Összes pénz a bankban)
  const { data: vaultAssets } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
  });

  // 2. Saját USDC egyenleg (Pénztárca)
  const { data: myUsdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // 3. Saját VAULT SHARE egyenleg (Bankbetét igazolás) <--- ÚJ!
  const { data: myShareBalance } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // --- ÍRÁS FUNKCIÓK ---

  const handleMint = () => {
    if (!address) return;
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'mint',
      args: [address, parseUnits('1000', 18)], 
    });
  };

  const addTokenToWallet = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: USDC_ADDRESS,
            symbol: 'MUSDC',
            decimals: 18,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = () => {
    if (!amount) return;
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [VAULT_ADDRESS, parseUnits(amount, 18)],
    });
  };

  const handleDeposit = () => {
    if (!amount) return;
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [parseUnits(amount, 18)], // Csak 1 paraméter!
    });
  };

  // ÚJ: WITHDRAW GOMB FUNKCIÓJA
  const handleWithdraw = () => {
    if (!amount) return;
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'withdraw',
      args: [parseUnits(amount, 18)], // Itt "Shares"-t kér, de 1:1 aránynál ez ugyanaz
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Yield Vault Frontend</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>🏦 Yield Vault</h2>
        <ConnectButton />
      </div>

      {/* STATUS PANEL */}
      <div style={{ padding: '1.5rem', border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '2rem', background: '#fafafa' }}>
        <h3>📊 Your Dashboard</h3>
        
        {/* Mennyi pénz van a bankban összesen? */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Vault Total Assets:</span>
            <strong>{vaultAssets ? formatUnits(vaultAssets as bigint, 18) : '0'} USDC</strong>
        </div>

        <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid #ddd'}}/>

        {/* Mennyi pénzed van kézben? */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Wallet Balance (USDC):</span>
            <strong>{myUsdcBalance ? formatUnits(myUsdcBalance as bigint, 18) : '0'} USDC</strong>
        </div>

        {/* Mennyi pénzed van a bankban? */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
            <span>Deposited (Shares):</span>
            <strong>{myShareBalance ? formatUnits(myShareBalance as bigint, 18) : '0'} vUSDC</strong>
        </div>
      </div>

      {error && (
        <div style={{ color: '#d32f2f', marginBottom: '1rem', padding: '10px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
          ⚠️ Error: {error.message.split('.')[0]}
        </div>
      )}

      {/* ACTIONS */}
      <div style={{ padding: '1.5rem', border: '1px solid #eaeaea', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>💰 Manage Funds</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <input 
            type="number" 
            placeholder="Amount (e.g. 50)" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* GOMBOK */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={handleApprove}
            disabled={isPending || !amount}
            style={{ padding: '12px', backgroundColor: '#f57c00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            1. Approve
          </button>

          <button 
            onClick={handleDeposit}
            disabled={isPending || !amount}
            style={{ padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            2. Deposit
          </button>
        </div>

        {/* WITHDRAW GOMB (Külön sorban) */}
        <button 
            onClick={handleWithdraw}
            disabled={isPending || !amount}
            style={{ width: '100%', padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            3. Withdraw (Burn Shares)
        </button>
        
        {isPending && <p style={{ textAlign: 'center', color: '#0288d1' }}>⏳ Transaction pending...</p>}
      </div>

      {/* HELPERS */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
           <button onClick={handleMint} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}>🖨️ Mint USDC</button>
           <button onClick={addTokenToWallet} style={{ padding: '5px 10px', cursor: 'pointer' }}>🦊 Add Token</button>
      </div>

    </div>
  );
};

export default Home;