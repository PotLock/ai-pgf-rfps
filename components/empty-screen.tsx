import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to AI RFPS Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          This is an open source AI chatbot app template built with{' '}
          <ExternalLink href="https://www.aipgf.com/">AI RFPS</ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          Please upload{' '}
          <ExternalLink href="https://docs.google.com/document/d/1UZRfOE1JAOhsnSmp-RmL2hY7KPJbpBImKZVvPV4YJmA/">Template file</ExternalLink>
        </p>
      </div>
    </div>
  )
}
