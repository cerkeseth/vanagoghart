import { useAccount, useReadContract } from 'wagmi'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { formatEther } from 'viem'
import { Minus, Plus } from 'lucide-react'
import { useEffect, useMemo } from 'react'

export function MintInputPanel({
  quantity,
  setQuantity,
}: {
  quantity: number
  setQuantity: (value: number) => void
}) {
  const { address } = useAccount()

  const { data: maxMintPerTx, refetch: refetchMaxMintPerTx } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxMintPerTx',
  })

  const { data: maxMintPerWallet, refetch: refetchMaxMintPerWallet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxMintPerWallet',
  })

  const { data: mintPrice, refetch: refetchMintPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mintPrice',
  })

  const { data: walletMintCount, refetch: refetchWalletMintCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getWalletMintCount',
    args: [address!],
    query: {
      enabled: !!address,
    },
  })

  // Her 5 saniyede bir verileri güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMaxMintPerTx()
      refetchMaxMintPerWallet()
      refetchMintPrice()
      if (address) {
        refetchWalletMintCount()
      }
    }, 5000) // 5000 ms = 5 saniye

    return () => clearInterval(interval)
  }, [address, refetchMaxMintPerTx, refetchMaxMintPerWallet, refetchMintPrice, refetchWalletMintCount])

  // Hesaplamaları useMemo ile yap
  const remainingMints = useMemo(() => {
    if (!address) return 0
    if (maxMintPerWallet === undefined || walletMintCount === undefined) return 0
    
    try {
      const remaining = BigInt(maxMintPerWallet) - BigInt(walletMintCount)
      return Number(remaining)
    } catch (error) {
      console.error('Calculation Error:', error)
      return 0
    }
  }, [address, maxMintPerWallet, walletMintCount])

  const maxQuantity = useMemo(() => {
    if (!maxMintPerTx) return 0
    return Math.min(Number(maxMintPerTx), remainingMints)
  }, [maxMintPerTx, remainingMints])

  const totalPrice = useMemo(() => {
    return mintPrice ? formatEther(mintPrice * BigInt(quantity)) : '0'
  }, [mintPrice, quantity])

  const isDisabled = !address || maxQuantity <= 0

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm shadow-md rounded-lg p-4 space-y-2 my-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <Label className="select-none text-sm text-muted-foreground">Mint Amount</Label>
      </div>

      <div className="flex items-center gap-2 p-2 bg-gray-50/50 rounded-md">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={isDisabled || quantity <= 1}
          className="h-8 w-8 disabled:bg-background"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center justify-center min-w-[60px] h-8 px-3 bg-white/80 rounded-md shadow-sm">
          <span className="text-lg font-medium select-none">{quantity}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={isDisabled || quantity >= maxQuantity}
          className="h-8 w-8 disabled:bg-background"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <p className="text-xs text-muted-foreground select-none ml-2">
          ({remainingMints} remaining)
        </p>
      </div>
    </div>
  )
} 