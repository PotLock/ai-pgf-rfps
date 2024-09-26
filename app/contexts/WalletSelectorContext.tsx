"use client"

import type { AccountState, WalletSelector } from "@near-wallet-selector/core";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";

import type { ReactNode } from "react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { distinctUntilChanged, map } from "rxjs";


declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

  export const Loading: React.FC = () => (
    <div className="lds-ellipsis">
      <div />
      <div />
      <div />
      <div />
    </div>
  );

export const WalletSelectorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: "testnet",
      debug: true,
      modules: [
        setupNightly() as any,
        setupMyNearWallet(),
        setupHereWallet(),
        setupMeteorWallet(),
        setupBitteWallet({
          walletUrl: "https://testnet.wallet.bitte.ai",
          callbackUrl: process.env.NEXTAUTH_URL,
          deprecated: false,
      }),
      ],
    });
    const _modal = setupModal(_selector, {
      contractId: "forum.potlock.testnet",
    });
    const state = _selector.store.getState();
    setAccounts(state.accounts);

    // this is added for debugging purpose only
    // for more information (https://github.com/near/wallet-selector/pull/764#issuecomment-1498073367)
    window.selector = _selector;
    window.modal = _modal;

    setSelector(_selector);
    setModal(_modal);
    setLoading(false);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state:any) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts:any) => {
        console.log("Accounts Update", nextAccounts);

        setAccounts(nextAccounts);
      });

    const onHideSubscription = modal!.on("onHide", ({ hideReason }) => {
      console.log(`The reason for hiding the modal ${hideReason}`);
    });

    return () => {
      subscription.unsubscribe();
      onHideSubscription.remove();
    };
  }, [selector, modal]);

  const walletSelectorContextValue = useMemo<WalletSelectorContextValue>(
    () => ({
      selector: selector!,
      modal: modal!,
      accounts,
      accountId: accounts.find((account) => account.active)?.accountId || null,
    }),
    [selector, modal, accounts]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <WalletSelectorContext.Provider value={walletSelectorContextValue}>
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}