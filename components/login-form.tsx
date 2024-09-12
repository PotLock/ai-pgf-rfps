'use client'
import { useState, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { authenticate } from '@/app/login/actions'
import Link from 'next/link'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { IconSpinner } from './ui/icons'
import { getMessageFromCode } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useWalletSelector } from "@/app/contexts/WalletSelectorContext"
import { getUser } from '@/app/login/actions'
import { signup } from '@/app/signup/actions'

export default function LoginForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(authenticate, undefined)
  const { modal, accountId, selector } = useWalletSelector();
  const [email, setEmail] = useState('');
  const [isUser, setIsUser] = useState(false);
  const [resultSignUp, dispatchSignIn] = useFormState(authenticate, undefined)
  const [resultSignIn, dispatchSignUp] = useFormState(signup, undefined)

  const { pending } = useFormStatus()
  const submitButton = useRef<HTMLFormElement>(null)

  const runSubmit = async (accountId: string) => {
    const email = accountId + '@mail.com'
    const user = await getUser(email)
    if (user) {
      await setIsUser(true)
    }
    await setEmail(email)
  }

  useEffect(() => {
    if (accountId) {
      runSubmit(accountId)
    }
  }, [accountId])

  useEffect(() => {
    if (email) submitButton.current?.requestSubmit();
  }, [email])

  useEffect(() => {
    if (resultSignIn) {
      if (resultSignIn.type === 'error') {
        toast.error(getMessageFromCode(resultSignIn.resultCode))
      } else {
        toast.success(getMessageFromCode(resultSignIn.resultCode))
        router.push(window.location.href);
        router.refresh();
      }
    }
  }, [resultSignIn, router])
  useEffect(() => {
    if (resultSignUp) {
      if (resultSignUp.type === 'error') {
        toast.error(getMessageFromCode(resultSignUp.resultCode))
      } else {
        toast.success(getMessageFromCode(resultSignUp.resultCode))
        router.push(window.location.href);
        router.refresh();
      }
    }
  }, [resultSignUp, router])
  return (
    <form
      action={isUser ? dispatchSignIn : dispatchSignUp}
      ref={submitButton}
      onSubmit={(e) => { }}
      className="flex flex-col items-center gap-4 space-y-3"
    >
      <div className="w-full flex-1 rounded-lg border bg-white px-6 pb-4 pt-8 shadow-md  md:w-96 dark:bg-zinc-950">
        <h1 className="mb-3 text-2xl font-bold">Please log in to continue.</h1>
        <div className="w-full">
          <div className="hidden">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="email"
                type="email"
                name="email"
                value={email}
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>
          <div className="mt-4 hidden">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="password"
                type="password"
                name="password"
                value={'password'}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>
        <button className="my-4 flex h-10 w-full flex-row items-center justify-center rounded-md bg-zinc-900 p-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200" onClick={modal.show} disabled={pending}>{pending ? <IconSpinner /> : "Connect Wallet"}</button>

      </div>
    </form>
  )
}


