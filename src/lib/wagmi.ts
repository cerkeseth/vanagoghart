import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, defineChain } from 'viem'

const vanaMainnet = defineChain({
  id: 1_480,
  name: 'Vana Mainnet',
  nativeCurrency: {
    name: 'VANA',
    symbol: 'VANA',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.vana.org'] },
  },
  blockExplorers: {
    default: { name: 'VanaScan', url: 'https://vanascan.io' },
  },
})

const vanaMokshaTestnet = defineChain({
  id: 14_800,
  name: 'Vana Moksha Testnet',
  nativeCurrency: {
    name: 'VANA',
    symbol: 'VANA',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.moksha.vana.org'] },
  },
  blockExplorers: {
    default: { name: 'VanaScan', url: 'https://moksha.vanascan.io' },
  },
})

export const config = getDefaultConfig({
  appName: 'Vanagogh',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [vanaMainnet, vanaMokshaTestnet],
  transports: {
    [vanaMainnet.id]: http(vanaMainnet.rpcUrls.default.http[0]),
    [vanaMokshaTestnet.id]: http(vanaMokshaTestnet.rpcUrls.default.http[0]),
  },
}) 