'use client'

import { useState } from 'react'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'
import { MintStatusCard } from '@/components/MintStatusCard'
import { MintInputPanel } from '@/components/MintInputPanel'
import { MintButton } from '@/components/MintButton'
import { NFTPreview } from '@/components/NFTPreview'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { AccountMenu } from '@/components/AccountMenu'
import { useAccount } from 'wagmi'

export default function Home() {
  const [quantity, setQuantity] = useState(1)
  const { isConnected } = useAccount()

  return (
    <main className="min-h-screen flex flex-col">
      <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-14 flex items-center">
          <div className="pl-4 flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="w-50 !p-0"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="space-y-2 p-4 h-full bg-white/58 backdrop-blur-sm flex flex-col">
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    Home
                  </Link>
                  <Link 
                    href="https://vanascan.io/" 
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    VanaScan
                  </Link>
                  <div className="mt-auto space-y-2">
                    <Link 
                      href="https://x.com/vanagoghart" 
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>@vanagoghart</span>
                    </Link>
                    <Link 
                      href="https://discord.gg/WraH78faCZ" 
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      <span>Discord</span>
                    </Link>
                    <Link 
                      href="https://t.me/+i1JgA0GlAuAxNTQ8" 
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-black/5 transition-colors"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span>Telegram</span>
                    </Link>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Created by cerkes.eth
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Vanagogh</h1>
            </Link>
          </div>
          <div className="ml-auto pr-4">
            <ConnectWalletButton />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-0">
              <div className="md:col-span-4">
                <NFTPreview />
              </div>
              <div className="md:col-span-3">
                <MintStatusCard />
                  <MintInputPanel quantity={quantity} setQuantity={setQuantity} />
                  <MintButton quantity={quantity} />
              </div>
            </div>
          </div>
        </div>
        {isConnected && (
          <Sheet>
            <SheetContent side="right" className="p-0 w-80 overflow-auto flex flex-col border-l rounded-none h-full">
              <AccountMenu />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </main>
  )
}
