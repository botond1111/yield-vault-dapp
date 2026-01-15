import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi'; 
import { parseUnits, formatUnits } from 'viem';
import { VAULT_ABI, VAULT_ADDRESS, USDC_ABI, USDC_ADDRESS } from '../constants';

// Declare window to avoid TypeScript errors with window.ethereum
declare var window: any;

const Home: NextPage = () => {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  
  // Hook for executing write transactions
  const { writeContract, isPending, error } = useWriteContract();

  // --- READ HOOKS ---

  // 1. Get total assets locked in the Vault
  const { data: vaultAssets } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
  });

  // 2. Get user's USDC balance
  const { data: myUsdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // 3. Get user's Vault Share balance (vUSDC)
  const { data: myShareBalance } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // --- WRITE FUNCTIONS ---

  // Mint mock tokens for testing (Faucet)
  const handleMint = () => {
    if (!address) return;
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'mint',
      args: [address, parseUnits('1000', 18)], 
    });
  };

  // Add the custom token to MetaMask for visibility
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
      console.error("Failed to add token:", error);
    }
  };

  // Step 1: Approve the Vault to spend user's tokens
  const handleApprove = () => {
    if (!amount) return;
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [VAULT_ADDRESS, parseUnits(amount, 18)],
    });
  };

  // Step 2: Deposit tokens into the Vault
  const handleDeposit = () => {
    if (!amount) return;
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [parseUnits(amount, 18)],
    });
  };

  // Step 3: Withdraw funds (Burn shares)
  const handleWithdraw = () => {
    if (!amount) return;
    writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'withdraw',
      args: [parseUnits(amount, 18)],
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <Head>
        <title>Yield Vault | DeFi App</title>
        <meta name="description" content="Simple Yield Vault built with Next.js and Wagmi" />
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🏦 Yield Vault</h2>
        <ConnectButton showBalance={false} />
      </div>

      {/* DASHBOARD PANEL */}
      <div style={{ padding: '1.5rem', border: '1px solid #eaeaea', borderRadius: '16px', marginBottom: '2rem', background: '#fafafa' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>📊 Protocol Status</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
            <span style={{ color: '#666' }}>Vault TVL (Total Value Locked):</span>
            <strong>{vaultAssets ? formatUnits(vaultAssets as bigint, 18) : '0'} USDC</strong>
        </div>

        <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid #eee'}}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
            <span style={{ color: '#666' }}>Your Wallet Balance:</span>
            <strong>{myUsdcBalance ? formatUnits(myUsdcBalance as bigint, 18) : '0'} USDC</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32', fontSize: '1.1rem', marginTop: '10px' }}>
            <span>Your Position:</span>
            <strong>{myShareBalance ? formatUnits(myShareBalance as bigint, 18) : '0'} vUSDC</strong>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div style={{ color: '#d32f2f', marginBottom: '1rem', padding: '12px', backgroundColor: '#ffebee', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #ffcdd2' }}>
          ⚠️ Transaction Error: {error.message.split('.')[0]}
        </div>
      )}

      {/* ACTION CARD */}
      <div style={{ padding: '1.5rem', border: '1px solid #eaeaea', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginTop: 0 }}>💰 Manage Position</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Amount (USDC)</label>
          <input 
            type="number" 
            placeholder="0.0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <button 
            onClick={handleApprove}
            disabled={isPending || !amount}
            style={{ padding: '14px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'opacity 0.2s' }}
          >
            1. Approve
          </button>

          <button 
            onClick={handleDeposit}
            disabled={isPending || !amount}
            style={{ padding: '14px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            2. Deposit
          </button>
        </div>

        <button 
            onClick={handleWithdraw}
            disabled={isPending || !amount}
            style={{ width: '100%', padding: '14px', backgroundColor: '#ef5350', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginTop: '5px' }}
          >
            Withdraw Liquidity
        </button>
        
        {isPending && <p style={{ textAlign: 'center', color: '#1976d2', fontSize: '0.9rem', marginTop: '1rem' }}>⏳ Processing transaction...</p>}
      </div>

      {/* DEV TOOLS (FAUCET) */}
      <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.8 }}>
           <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '10px' }}>🔧 Developer Tools (Testnet Only)</p>
           <button onClick={handleMint} style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer', background: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '0.8rem', color: '#333' }}>
             🖨️ Faucet (Mint 1000 USDC)
           </button>
           <button onClick={addTokenToWallet} style={{ padding: '6px 12px', cursor: 'pointer', background: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '0.8rem', color: '#333' }}>
             🦊 Add Token to Wallet
           </button>
      </div>

    </div>
  );
};

export default Home;