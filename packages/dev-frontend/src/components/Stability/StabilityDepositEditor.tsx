import React, { useState } from "react";
import { Heading, Box, Card, Button } from "theme-ui";

import {
  Decimal,
  Decimalish,
  StabilityDeposit,
  SimStoreState,
  Difference
} from "@sim/lib-base";

import { useSimSelector } from "@sim/lib-react";

import { COIN, GT } from "../../strings";

import { Icon } from "../Icon";
import { EditableRow, StaticRow } from "../Trove/Editor";
import { LoadingOverlay } from "../LoadingOverlay";
import { InfoIcon } from "../InfoIcon";

const select = ({ simBalance, simInStabilityPool }: SimStoreState) => ({
  simBalance,
  simInStabilityPool
});

type StabilityDepositEditorProps = {
  originalDeposit: StabilityDeposit;
  editedSIM: Decimal;
  changePending: boolean;
  dispatch: (action: { type: "setDeposit"; newValue: Decimalish } | { type: "revert" }) => void;
};

export const StabilityDepositEditor: React.FC<StabilityDepositEditorProps> = ({
  originalDeposit,
  editedSIM,
  changePending,
  dispatch,
  children
}) => {
  const { simBalance, simInStabilityPool } = useSimSelector(select);
  const editingState = useState<string>();

  const edited = !editedSIM.eq(originalDeposit.currentSIM);

  const maxAmount = originalDeposit.currentSIM.add(simBalance);
  const maxedOut = editedSIM.eq(maxAmount);

  let simInStabilityPoolAfterChange = Decimal.ZERO;
  if (originalDeposit.currentSIM.gt(simInStabilityPool)) {
    simInStabilityPoolAfterChange = originalDeposit.currentSIM;
  } else {
    simInStabilityPoolAfterChange = simInStabilityPool
      .sub(originalDeposit.currentSIM)
      .add(editedSIM);
  }

  const originalPoolShare = originalDeposit.currentSIM.mulDiv(100, simInStabilityPool);
  const newPoolShare = editedSIM.mulDiv(100, simInStabilityPoolAfterChange);
  const poolShareChange =
    originalDeposit.currentSIM.nonZero &&
    Difference.between(newPoolShare, originalPoolShare).nonZero;

  return (
    <Card>
      <Heading>
        Stability Pool
        {edited && !changePending && (
          <Button
            variant="titleIcon"
            sx={{ ":enabled:hover": { color: "danger" } }}
            onClick={() => dispatch({ type: "revert" })}
          >
            <Icon name="history" size="lg" />
          </Button>
        )}
      </Heading>

      <Box sx={{ p: [2, 3] }}>
        <EditableRow
          label="Deposit"
          inputId="deposit-lqty"
          amount={editedSIM.prettify()}
          maxAmount={maxAmount.toString()}
          maxedOut={maxedOut}
          unit={COIN}
          {...{ editingState }}
          editedAmount={editedSIM.toString(2)}
          setEditedAmount={newValue => dispatch({ type: "setDeposit", newValue })}
        />

        {newPoolShare.infinite ? (
          <StaticRow label="Pool share" inputId="deposit-share" amount="N/A" />
        ) : (
          <StaticRow
            label="Pool share"
            inputId="deposit-share"
            amount={newPoolShare.prettify(4)}
            pendingAmount={poolShareChange?.prettify(4).concat("%")}
            pendingColor={poolShareChange?.positive ? "success" : "danger"}
            unit="%"
          />
        )}

        {!originalDeposit.isEmpty && (
          <>
            <StaticRow
              label="Liquidation gain"
              inputId="deposit-gain"
              amount={originalDeposit.collateralGain.prettify(4)}
              color={originalDeposit.collateralGain.nonZero && "success"}
              unit="wstETH"
            />

            <StaticRow
              label="Reward"
              inputId="deposit-reward"
              amount={originalDeposit.shadyReward.prettify()}
              color={originalDeposit.shadyReward.nonZero && "success"}
              unit={GT}
              infoIcon={
                <InfoIcon
                  tooltip={
                    <Card variant="tooltip" sx={{ width: "240px" }}>
                      Although the LQTY rewards accrue every minute, the value on the UI only updates
                      when a user transacts with the Stability Pool. Therefore you may receive more
                      rewards than is displayed when you claim or adjust your deposit.
                    </Card>
                  }
                />
              }
            />
          </>
        )}
        {children}
      </Box>

      {changePending && <LoadingOverlay />}
    </Card>
  );
};
