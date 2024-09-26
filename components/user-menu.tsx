"use client";

import { useEffect } from 'react'
import { useWalletSelector } from "@/app/contexts/WalletSelectorContext"
import { logOut } from '@/app/logout/actions'
import { type Session } from '@/lib/types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { SignOutButton } from './signout-button'
export interface UserMenuProps {
  user: Session['user']
}

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(' ')
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}

export function UserMenu({ user }: UserMenuProps) {
  const { accountId, selector, accounts } = useWalletSelector();

  const switchAccount = async () => {
    const email = user.email.replace('@mail.com', '');
    if (email !== accountId) {
      const isValid = accounts.find(account => account.accountId === email);
      if (!isValid) {
        const wallet = await selector.wallet();
        await wallet.signOut();
        await logOut()
      }
    }
  }

  useEffect(() => {
    switchAccount()
  }, [])

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-0">
            <div className="flex size-7 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
              {getUserInitials(user.email).replace('@mail.com', '')}
            </div>
            <span className="ml-2 hidden md:block">{user.email.length > 20 ? `${user.email.replace('@mail.com', '').slice(0, 7)}...${user.email.replace('@mail.com', '').slice(-7)}` : user.email.replace('@mail.com', '')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-fit">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs text-zinc-500">{user.email.length > 20 ? `${user.email.replace('@mail.com', '').slice(0, 7)}...${user.email.replace('@mail.com', '').slice(-7)}` : user.email.replace('@mail.com', '')}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
