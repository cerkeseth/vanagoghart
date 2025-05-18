import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from './ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { AccountMenu } from './AccountMenu'
import { useAccount } from 'wagmi'

export function ConnectWalletButton() {
  const { isConnected } = useAccount()

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal}>
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button className="bg-[#FF3B30] hover:bg-[#FF3B30]/90" onClick={openChainModal}>
                    Wrong Network
                  </Button>
                )
              }

              return (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={openChainModal}>
                    {chain.name}
                  </Button>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button>
                        {account.displayName}
                      </Button>
                    </SheetTrigger>
                    {isConnected && (
                      <SheetContent 
                        side="right"
                        className="w-78 border-l rounded-none p-0 h-full"
                      >
                        <SheetTitle className="sr-only">Hesap Menüsü</SheetTitle>
                        <div className="flex-1 h-full overflow-hidden">
                          <AccountMenu />
                        </div>
                      </SheetContent>
                    )}
                  </Sheet>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
} 