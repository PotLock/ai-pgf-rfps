'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useWalletSelector } from "@/app/contexts/WalletSelectorContext"
import { utils } from "near-api-js";
import { useEffect } from 'react';

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
        <div className="p-4 text-green-400 border rounded-xl bg-zinc-950">
            <div className="inline-block float-right px-2 py-1 text-xs rounded-full bg-white/10">
                Draft
            </div>
            <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
            <button
                onClick={publish}
                className="w-full px-4 py-2 mt-6 font-bold bg-green-400 rounded-lg text-zinc-900 hover:bg-green-500"
            >
                {accountId ? `Publish to RFP` : "Please Login to Post"}
            </button>

        </div>
    )
}
