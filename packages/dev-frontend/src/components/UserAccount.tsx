import React from "react";
import { Text, Flex, Box, Heading, Button } from "theme-ui";

import { Decimal, SimStoreState } from "@sim/lib-base";
import { useSimSelector } from "@sim/lib-react";

import { COIN, GT, COLLATERAL } from '../strings';
import { useSim } from "../hooks/SimContext";
import { shortenAddress } from "../utils/shortenAddress";

import { Icon } from "./Icon";
import { ConnectKitButton } from "connectkit";

const select = ({ wstETHBalance, simBalance, shadyBalance }: SimStoreState) => ({
  wstETHBalance,
  simBalance,
  shadyBalance
});

export const UserAccount: React.FC = () => {
  const { account } = useSim();
  const { wstETHBalance, shadyBalance, simBalance } = useSimSelector(select);

  return (
    <Flex>
      <ConnectKitButton.Custom>
        {connectKit => (
          <Button
            variant="outline"
            sx={{ alignItems: "center", p: 2, mr: 3 }}
            onClick={connectKit.show}
          >
            <Icon name="user-circle" size="lg" />
            <Text as="span" sx={{ ml: 2, fontSize: 1 }}>
              {shortenAddress(account)}
            </Text>
          </Button>
        )}
      </ConnectKitButton.Custom>

      <Box
        sx={{
          display: ["none", "flex"],
          alignItems: "center"
        }}
      >
        <Icon name="wallet" size="lg" />

        {([
          [COLLATERAL, Decimal.from(wstETHBalance)],
          [COIN, Decimal.from(simBalance)],
          [GT, Decimal.from(shadyBalance)],
        ] as const).map(([currency, balance], i) => (
          <Flex key={i} sx={{ ml: 3, flexDirection: "column" }}>
            <Heading sx={{ fontSize: 1 }}>{currency}</Heading>
            <Text sx={{ fontSize: 1 }}>{balance.prettify()}</Text>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
};
