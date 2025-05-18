import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { formatEther } from 'viem'
import { ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { useEffect } from 'react'

export function MintStatusCard() {
  const { address } = useAccount()

  const { data: name, refetch: refetchName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'name',
  })

  const { data: description, refetch: refetchDescription } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'description',
  })

  const { data: owner, refetch: refetchOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  })

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  })

  const { data: maxSupply, refetch: refetchMaxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxSupply',
  })

  const { data: mintPrice, refetch: refetchMintPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mintPrice',
  })

  const { data: isMintActive, refetch: refetchIsMintActive } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isMintActive',
  })

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

  const { data: walletMintCount, refetch: refetchWalletMintCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getWalletMintCount',
    args: address ? [address] : undefined,
  })

  // Her bir dakikada bir verileri güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTotalSupply()
      refetchMaxSupply()
      refetchMintPrice()
      refetchIsMintActive()
      refetchMaxMintPerTx()
      refetchMaxMintPerWallet()
      if (address) {
        refetchWalletMintCount()
      }
    }, 60000) // 60000 ms = 1 dakika

    return () => clearInterval(interval)
  }, [address, refetchTotalSupply, refetchMaxSupply, refetchMintPrice, 
      refetchIsMintActive, refetchMaxMintPerTx, refetchMaxMintPerWallet, 
      refetchWalletMintCount])

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Card className="border rounded-lg bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{name || 'Vanagogh'}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {description || 'Vanagogh'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mint Status</p>
            <p className="text-lg font-medium">
              {isMintActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mint Price</p>
            <p className="text-lg font-medium">
              {mintPrice ? formatEther(mintPrice) : '0'} VANA
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Total Supply</p>
            <p className="text-lg font-medium">
              {totalSupply?.toString() || '0'} / {maxSupply?.toString() || '0'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Contract Address</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium">{shortenAddress(CONTRACT_ADDRESS)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[#007AFF] hover:text-[#007AFF]/90 hover:bg-[#007AFF]/10"
                onClick={() => window.open(`https://vanascan.io/address/${CONTRACT_ADDRESS}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {owner && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Creator Address</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{shortenAddress(owner)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-[#007AFF] hover:text-[#007AFF]/90 hover:bg-[#007AFF]/10"
                  onClick={() => window.open(`https://vanascan.io/address/${owner}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 