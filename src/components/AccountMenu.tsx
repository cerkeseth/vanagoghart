import { useState, useEffect, useCallback } from 'react'
import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { Button } from './ui/button'
import { ExternalLink, LogOut, Send, Maximize2, X, Download } from 'lucide-react'
import { Separator } from './ui/separator'
import { toast } from 'sonner'
import { Skeleton } from './ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useWriteContract } from 'wagmi'
import { CONTRACT_ABI } from '@/lib/contract'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface NFTInstance {
  id: string
  image_url: string | null
  metadata: {
    name?: string
    image?: string
  } | null
}

interface NFTCollection {
  amount: string
  token: {
    address: string
    name: string
    symbol: string
    type: string
  }
  token_instances: NFTInstance[]
}

interface VanaScanResponse {
  items: NFTCollection[]
}

// API endpoints
const API_ENDPOINTS = {
  1480: 'https://vanascan.io/api/v2',
  14800: 'https://moksha.vanascan.io/api/v2'
} as const

// Error messages
const ERROR_FETCHING_NFTS = 'Error fetching NFTs. Please try again later.'
const ERROR_HTTP = 'HTTP error:'
const INVALID_ADDRESS = 'Invalid address format'

// Success messages
const ADDRESS_COPIED = 'Address copied'
const NFT_SENT = 'NFT transfer initiated successfully'

export function AccountMenu() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const [collections, setCollections] = useState<NFTCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNFT, setSelectedNFT] = useState<{collection: NFTCollection, token: NFTInstance} | null>(null)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  const { writeContract, isPending } = useWriteContract()

  const fetchNFTs = useCallback(async () => {
    if (!address || !chainId) return

    try {
      setIsLoading(true)
      setError(null)

      // Ağa göre doğru API endpoint'i seç
      const baseUrl = API_ENDPOINTS[chainId as keyof typeof API_ENDPOINTS]
      if (!baseUrl) {
        throw new Error('Unsupported network')
      }

      const response = await fetch(
        `${baseUrl}/addresses/${address}/nft/collections?type=ERC-721`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`${ERROR_HTTP} ${response.status}`)
      }

      const data: VanaScanResponse = await response.json()
      setCollections(data.items)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      setError(ERROR_FETCHING_NFTS)
    } finally {
      setIsLoading(false)
    }
  }, [address, chainId])

  useEffect(() => {
    fetchNFTs()
  }, [fetchNFTs])

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success(ADDRESS_COPIED, {
        style: { backgroundColor: '#007AFF', color: 'white' }
      })
    }
  }

  const handleTransferNFT = async () => {
    if (!selectedNFT || !address || !recipientAddress) return

    try {
      await writeContract({
        address: selectedNFT.collection.token.address as `0x${string}`,
        abi: [{
          name: 'transferFrom',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' }
          ],
          outputs: []
        }],
        functionName: 'transferFrom',
        args: [address, recipientAddress as `0x${string}`, BigInt(selectedNFT.token.id)],
      })

      toast.success(NFT_SENT, {
        style: { backgroundColor: '#007AFF', color: 'white' }
      })
      setIsTransferDialogOpen(false)
      setRecipientAddress('')
      setSelectedNFT(null)
    } catch (error: any) {
      console.error('Transfer error:', error)
      toast.error(error?.message || 'Transfer failed', {
        style: { backgroundColor: '#FF3B30', color: 'white' }
      })
    }
  }

  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getImageUrl = (instance: NFTInstance) => {
    if (instance.image_url) return instance.image_url
    if (instance.metadata?.image) {
      const image = instance.metadata.image
      if (image.startsWith('ipfs://')) {
        return image.replace('ipfs://', 'https://ipfs.io/ipfs/')
      }
      return image
    }
    return '/placeholder-nft.png'
  }

  const getBlockExplorerUrl = useCallback((targetAddress: string | undefined) => {
    if (!targetAddress || !chainId) return '#'
    const baseUrl = chainId === 1480 ? 'https://vanascan.io' : 'https://moksha.vanascan.io'
    return `${baseUrl}/address/${targetAddress}`
  }, [chainId])

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#007AFF] hover:text-[#007AFF]/90 hover:bg-[#007AFF]/10 flex items-center gap-1"
            onClick={() => window.open(getBlockExplorerUrl(address), '_blank')}
          >
            <span className="text-xs">View on VanaScan</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 flex items-center gap-1 px-3 min-w-[90px]"
            onClick={() => disconnect()}
          >
            <span className="text-xs">Disconnect</span>
            <LogOut className="h-3 w-3 shrink-0" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain h-[calc(100vh-3.5rem-49px)] pr-1 
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-thumb]:bg-gray-300/70 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        [&::-webkit-scrollbar-thumb]:transition-colors 
        hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/80 
        [&::-webkit-scrollbar-track]:bg-transparent
        scrollbar-width: thin
        scrollbar-color: #d1d5db transparent">
        <div className="min-h-full">
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : collections.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No NFTs found in your wallet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {collections.map((collection, index) => (
                  <div key={collection.token.address} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium">{collection.token.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {collection.amount} items
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {collection.token_instances.map((token) => (
                        <div key={token.id}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div
                                className="group relative aspect-square overflow-hidden rounded-md bg-muted cursor-pointer"
                              >
                                {token.image_url || token.metadata?.image ? (
                                  <img
                                    src={getImageUrl(token)}
                                    alt={token.metadata?.name || `Token #${token.id}`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <span className="text-xs text-muted-foreground">
                                      No Image
                                    </span>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-xs text-white">
                                  #{token.id}
                                </div>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedNFT({ collection, token });
                                  setIsTransferDialogOpen(true);
                                }}
                                className="gap-2"
                              >
                                <Send className="h-4 w-4" />
                                <span>Send</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedNFT({ collection, token });
                                  setIsImageDialogOpen(true);
                                }}
                                className="gap-2"
                              >
                                <Maximize2 className="h-4 w-4" />
                                <span>Expand</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const baseUrl = chainId === 1480 ? 'https://vanascan.io' : 'https://moksha.vanascan.io'
                                  window.open(`${baseUrl}/token/${collection.token.address}/instance/${token.id}`, '_blank')
                                }}
                                className="gap-2 text-[#007AFF] hover:text-[#007AFF]/90 focus:text-[#007AFF]/90 focus:bg-[#007AFF]/10"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View on VanaScan</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                    {index < collections.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="fixed bottom-0 left-0 right-0 translate-y-0 translate-x-0 rounded-b-none sm:bottom-auto sm:left-[50%] sm:translate-x-[-50%] sm:rounded-lg">
          <DialogHeader>
            <DialogTitle>Send NFT #{selectedNFT?.token.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Recipient Address (0x...)"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
            <Button
              onClick={handleTransferNFT}
              disabled={!recipientAddress || isPending}
              className="w-full"
            >
              {isPending ? 'Sending...' : 'Send NFT'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-transparent border-none shadow-none">
          <DialogHeader>
            <VisuallyHidden asChild>
              <DialogTitle>NFT Görüntüleyici</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm"
              onClick={async () => {
                if (selectedNFT) {
                  const imageUrl = getImageUrl(selectedNFT.token);
                  try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `nft-${selectedNFT.token.id}.png`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('İndirme hatası:', error);
                    window.open(imageUrl, '_blank');
                  }
                }
              }}
            >
              <Download className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm"
              onClick={() => setIsImageDialogOpen(false)}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
          <div className="flex items-center justify-center p-4">
            {selectedNFT && (
              <img
                src={getImageUrl(selectedNFT.token)}
                alt={selectedNFT.token.metadata?.name || `Token #${selectedNFT.token.id}`}
                className="max-h-[70vh] w-auto object-contain rounded-lg transition-transform duration-300 hover:scale-105 hover:rotate-1 cursor-pointer shadow-2xl"
                onClick={() => {
                  const imageUrl = selectedNFT.token.metadata?.image;
                  if (imageUrl?.startsWith('ipfs://')) {
                    window.open(imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/'), '_blank');
                  } else if (selectedNFT.token.image_url) {
                    window.open(selectedNFT.token.image_url, '_blank');
                  }
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}