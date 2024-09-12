"use client";
import { useState, useEffect, useRef } from 'react'
import { useWalletSelector } from "@/app/contexts/WalletSelectorContext"
import { logOut } from '@/app/logout/actions'


export function SignOutButton() {
    const { modal, accountId, selector } = useWalletSelector();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const formRef = useRef<HTMLFormElement>(null)
    const handleSignOut = async () => {
        const wallet = await selector.wallet();
        setIsLoggingOut(true)
        wallet.signOut()
            .then(() => {
                formRef.current?.requestSubmit();
            })
            .catch((err: string) => {
                console.log("Failed to sign out");
                console.error(err);
            });
    };

    return (

        <form
            ref={formRef}
            action={async () => {
                await logOut()
            }}
        >
            <button
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-red-500 hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={handleSignOut}
                disabled={isLoggingOut}
            >
                Sign Out
            </button>
        </form>
    )
}