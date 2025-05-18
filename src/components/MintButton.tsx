import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Button } from './ui/button'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { toast } from 'sonner'
import { parseEther } from 'viem'
import { useEffect, useCallback } from 'react'

export function MintButton({
  quantity,
  disabled,
}: {
  quantity: number
  disabled?: boolean
}) {
  const { address } = useAccount()

  const { data: isMintActive, refetch: refetchIsMintActive } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isMintActive',
  })

  const { data: mintPrice, refetch: refetchMintPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mintPrice',
  })

  const { data: maxMintPerWallet, refetch: refetchMaxMintPerWallet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxMintPerWallet',
  })

  const { data: walletMintCount, refetch: refetchWalletMintCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getWalletMintCount',
    args: address ? [address] : undefined,
  })

  const { writeContractAsync, isPending } = useWriteContract()

  // Her 5 saniyede bir verileri güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      refetchIsMintActive()
      refetchMintPrice()
      refetchMaxMintPerWallet()
      if (address) {
        refetchWalletMintCount()
      }
    }, 5000) // 5000 ms = 5 saniye

    return () => clearInterval(interval)
  }, [address, refetchIsMintActive, refetchMintPrice, refetchMaxMintPerWallet, refetchWalletMintCount])

  const handleMint = useCallback(async () => {
    try {
      console.log('Mint button clicked')
      console.log('Current state:', {
        address,
        mintPrice: mintPrice?.toString(),
        isMintActive,
        quantity,
        walletMintCount: walletMintCount?.toString(),
        maxMintPerWallet: maxMintPerWallet?.toString()
      })

      if (!address) {
        console.log('No wallet address')
        return
      }

      if (mintPrice === undefined) {
        console.log('Mint price is undefined')
        return
      }

      // Kalan mint hakkını kontrol et
      if (maxMintPerWallet && walletMintCount) {
        const remainingMints = Number(maxMintPerWallet) - Number(walletMintCount)
        console.log('Remaining mints:', remainingMints)
        if (remainingMints <= 0) {
          toast.error('You have reached your maximum mint limit', {
            style: { backgroundColor: '#FF3B30', color: 'white' }
          })
          return
        }
        if (remainingMints < quantity) {
          toast.error(`You can only mint ${remainingMints} more NFTs`, {
            style: { backgroundColor: '#FF3B30', color: 'white' }
          })
          return
        }
      }

      const loadingToast = toast.loading('Preparing transaction...')

      try {
        const totalPrice = BigInt(mintPrice) * BigInt(quantity)
        console.log('Mint Parameters:', {
          address: CONTRACT_ADDRESS,
          quantity,
          totalPrice: totalPrice.toString(),
        })

        const tx = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'mint',
          args: [BigInt(quantity)],
          value: totalPrice,
        })

        console.log('Transaction submitted:', tx)

        toast.dismiss(loadingToast)
        toast.success('Transaction submitted successfully', {
          style: { backgroundColor: '#34C759', color: 'white' }
        })

        // Transaction başarılı olduktan sonra verileri güncelle
        setTimeout(() => {
          refetchWalletMintCount()
        }, 2000) // 2 saniye sonra güncelle
      } catch (error: any) {
        toast.dismiss(loadingToast)
        throw error
      }
    } catch (error: any) {
      console.error('Mint Error:', error)
      
      // Kullanıcı reddetme durumunu kontrol et
      if (error?.message?.includes('rejected') || error?.message?.includes('denied')) {
        toast.error('Transaction rejected by user', {
          style: { backgroundColor: '#FF3B30', color: 'white' }
        })
      } else {
        console.error('Contract interaction error:', error)
        toast.error('Failed to submit transaction', {
          style: { backgroundColor: '#FF3B30', color: 'white' }
        })
      }
    }
  }, [address, mintPrice, maxMintPerWallet, walletMintCount, quantity, writeContractAsync, refetchWalletMintCount])

  // Kalan mint hakkını hesapla
  const remainingMints = maxMintPerWallet && walletMintCount
    ? Number(maxMintPerWallet) - Number(walletMintCount)
    : undefined

  const isDisabled =
    disabled ||
    !address ||
    !isMintActive ||
    mintPrice === undefined ||
    isPending ||
    (remainingMints !== undefined && remainingMints <= 0)

  console.log('Button state:', {
    isDisabled,
    address: !!address,
    isMintActive,
    isPending,
    remainingMints,
    mintPrice: mintPrice?.toString()
  })

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={() => {
          console.log('Button clicked')
          handleMint()
        }}
        disabled={isDisabled}
        className="w-full select-none p-6 text-lg font-medium disabled:opacity-50"
      >
        {isPending ? 'Minting in progress...' : 'Mint'}
      </Button>
    </div>
  )
} 