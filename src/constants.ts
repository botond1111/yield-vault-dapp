import { erc20Abi } from "viem";

// 1. A VERIFIKÁLT SZERZŐDÉSED CÍME (Sepolia)
export const VAULT_ADDRESS = "0x55514300b0c319a0B914178797aef989BdD9D9f9"; // <--- Ide jöhet a saját címed, ha más lenne

// 2. AZ ABI 
export const VAULT_ABI = [
 {
    name: 'totalAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  // 2. deposit (Pénz betétele)
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: []
  },
  // 3. withdraw (Pénz kivétele) - EZT ADTUK HOZZÁ
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: []
  },
  // 4. balanceOf (Hány részvényem van?) - EZT IS HOZZÁADTUK
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;
// Fontos: a végére írd oda, hogy "as const", ez segít a TypeScriptnek!
export const USDC_ADDRESS = "0x17EE33d4c9161a37f07e2BD2A952CeC47Dc1ACbd";
export const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'mint', // <--- EZ AZ A RÉSZ, AMI NEKÜNK KELL
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: []
  }
] as const;