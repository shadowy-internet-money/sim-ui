import { useChainId } from "wagmi";
import React, { useContext, createContext } from "react";

import mainnet from "@sim/chicken-bonds/lusd/addresses/mainnet.json";
import goerli from "@sim/chicken-bonds/lusd/addresses/goerli.json";
import { Addresses } from "./transitions";

const nullAddresses: Addresses = {
  BLUSD_AMM_ADDRESS: null,
  BLUSD_AMM_STAKING_ADDRESS: null,
  BLUSD_TOKEN_ADDRESS: null,
  BOND_NFT_ADDRESS: null,
  CHICKEN_BOND_MANAGER_ADDRESS: null,
  LUSD_OVERRIDE_ADDRESS: null,
  BLUSD_LP_ZAP_ADDRESS: null
};

export const chainIdAddressesMap: Partial<Record<number, Addresses>> = {
  1: mainnet,
  5: goerli
  // 11155111: sepolia
};

export const BondAddressesContext = createContext<Addresses | undefined>(undefined);

export const useBondAddresses = (): Addresses => {
  const context = useContext(BondAddressesContext);

  if (context === undefined) {
    throw new Error("You must add a <BondAddressesProvider> into the React tree");
  }

  return context;
};

export const BondAddressesProvider: React.FC = ({ children }) => {
  const chainId = useChainId();

  const addresses: Addresses =
    chainId !== undefined ? chainIdAddressesMap[chainId] ?? nullAddresses : nullAddresses;

  return <BondAddressesContext.Provider value={addresses}>{children}</BondAddressesContext.Provider>;
};
