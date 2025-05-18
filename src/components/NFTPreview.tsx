import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { CONTRACT_ABI } from '@/lib/contract'
import { Skeleton } from './ui/skeleton'
import { NEXT_PUBLIC_CONTRACT_ADDRESS } from '@/config'

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

interface VanaScanResponse {
  id: string
  image_url: string
  media_url: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
}

export function NFTPreview() {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetadata() {
      try {
        setIsLoading(true)
        setError(null)

        if (!NEXT_PUBLIC_CONTRACT_ADDRESS) {
          throw new Error('Kontrat adresi bulunamadı')
        }

        const response = await fetch(`https://vanascan.io/api/v2/tokens/${NEXT_PUBLIC_CONTRACT_ADDRESS}/instances/0`, {
          headers: {
            'accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        const data: VanaScanResponse = await response.json()
        console.log('API Response:', data)

        setMetadata({
          name: data.metadata?.name || 'Unnamed NFT',
          description: data.metadata?.description || 'No description',
          image: data.image_url || data.media_url?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '',
          attributes: data.metadata?.attributes || []
        })
      } catch (error) {
        console.error('Error fetching NFT metadata:', error)
        setError('NFT verisi alınamadı')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetadata()
  }, [])

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm shadow-md rounded-lg p-4 max-w-[calc(100%-80px)] mx-auto h-full">
        <div className="w-[99%] mx-auto aspect-square rounded-lg border bg-muted flex items-center justify-center mb-4">
          <p className="text-sm text-muted-foreground text-center px-4">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading || !metadata) {
    return (
      <div className="bg-white/70 backdrop-blur-sm shadow-md rounded-lg p-4 max-w-[calc(100%-80px)] mx-auto h-full">
        <div className="w-[99%] mx-auto aspect-square mb-4">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm shadow-md rounded-lg p-4 max-w-[calc(100%-80px)] mx-auto h-full">
      <div className="w-[99%] mx-auto aspect-square rounded-lg border overflow-hidden mb-4">
        <img
          src={metadata.image}
          alt={metadata.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {metadata.attributes && metadata.attributes.length > 0 && (
        <div className="grid grid-cols-2 gap-1">
          {metadata.attributes.map((trait, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 shadow-sm px-1.5 py-1.5 rounded-md">
              <p className="text-[10px] text-muted-foreground leading-none">{trait.trait_type}</p>
              <p className="text-xs font-medium leading-tight mt-1">{trait.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 