'use client'

import { MemoizedReactMarkdown } from "@/components/markdown";
import { useWalletSelector } from "@/app/contexts/WalletSelectorContext"
import { utils } from "near-api-js";
import { useEffect } from 'react';
import { CodeBlock } from '@/components/ui/codeblock'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

export const AddRFP = ({ props: { body, label } }: { props: any }) => {
    const { modal, accountId, selector } = useWalletSelector();
    const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;
    useEffect(() => {

    }, [])
    const publish = async () => {
        const wallet = await selector.wallet();
        wallet.signAndSendTransaction({
            signerId: accountId!,
            receiverId: "forum.potlock.testnet",
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "add_rfp",
                        args: { body, label },
                        gas: BOATLOAD_OF_GAS,
                        deposit: utils.format.parseNearAmount("0")!,
                    }
                },

            ],
        })
    }
    return (

        <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
            <MemoizedReactMarkdown
                className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                remarkPlugins={[remarkGfm, remarkMath]}
                components={{
                    p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>
                    },
                    code({ node, inline, className, children, ...props }) {
                        if (children.length) {
                            if (children[0] == '▍') {
                                return (
                                    <span className="mt-1 cursor-default animate-pulse">▍</span>
                                )
                            }

                            children[0] = (children[0] as string).replace('`▍`', '▍')
                        }

                        const match = /language-(\w+)/.exec(className || '')

                        if (inline) {
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            )
                        }

                        return (
                            <CodeBlock
                                key={Math.random()}
                                language={(match && match[1]) || ''}
                                value={String(children).replace(/\n$/, '')}
                                {...props}
                            />
                        )
                    }
                }}
            >
                {body}
            </MemoizedReactMarkdown>
            {accountId ?
                <button
                    onClick={publish}
                    className="w-full px-4 py-2 mt-6 font-bold bg-green-400 rounded-lg text-zinc-900 hover:bg-green-500"
                >
                    Publish
                </button>
                : <button
                    onClick={() => modal.show()}
                    className="w-full px-4 py-2 mt-6 font-bold  bg-background transition-opacity rounded-lg text-zinc-900 hover:text-accent-foreground" >
                    Please Login to Publish
                </button>}
        </div>

    )
}
