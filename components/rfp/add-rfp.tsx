'use client'

import { MemoizedReactMarkdown } from "@/components/markdown";
import { useWalletSelector } from "@/app/contexts/WalletSelectorContext"
import { utils } from "near-api-js";
import { useState } from 'react';
import { CodeBlock } from '@/components/ui/codeblock'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { toast } from 'sonner'


export const AddRFP = ({ props: { label, name, summary, body, deadline } }: { props: any }) => {
    const { modal, accountId, selector } = useWalletSelector();
    const [isLoading, setIsLoading] = useState(false)
    const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

    const publish = async () => {
        setIsLoading(true)
        const wallet = await selector.wallet();
         wallet.signAndSendTransaction({
            signerId: accountId!,
            receiverId: "forum.potlock.testnet",
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "add_rfp",
                        args: {
                            "labels": [
                                label
                            ],
                            "body": {
                                "rfp_body_version": "V0",
                                "name": name,
                                "description": body,
                                "summary": summary,
                                "submission_deadline": deadline,
                                "timeline": {
                                    "status": "ACCEPTING_SUBMISSIONS"
                                }
                            }
                        },
                        gas: BOATLOAD_OF_GAS,
                        deposit: utils.format.parseNearAmount("0")!,
                    }
                },

            ],
        }).then((nextMessages: any) => {
            setIsLoading(false)
            toast.success('Publish was successful!')
        }).catch((err) => {
            console.log(err);
            toast.error(err.message)
            setIsLoading(false)
        });

    }
    return (

        <>
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
            <div className=" pt-4">
                {accountId ?
                    <Button
                        disabled={isLoading}
                        onClick={publish}
                        className="w-full"
                    >  {isLoading ? <><IconSpinner className="mr-2 animate-spin" />Waiting for user response... </> : 'Publish'}   </Button> : <Button
                        onClick={() => modal.show()}
                        className="w-full " >
                        Please Login to Publish
                    </Button>
                }
            </div>
        </>

    )
}
