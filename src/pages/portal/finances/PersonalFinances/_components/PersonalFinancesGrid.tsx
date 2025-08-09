import { useMemo, useState } from 'react';

import AcUnitIcon from '@mui/icons-material/AcUnit';
import SleddingIcon from '@mui/icons-material/Sledding';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { IFinancialPlan } from '@shared/models/finances';
import { financeUtils } from '@shared/utils';
import { SYSTEM } from 'src/consts';
import { EPayoffMethodType } from '@shared/enums/finance';
import {
  DataGrid,
  GridColDef,
  GridColumnGroupingModel,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCurrency } from 'src/utils';

interface Props {
  financialPlan: IFinancialPlan;
  loading: boolean;
}

const PersonalFinancesGrid = ({ financialPlan }: Props) => {
  const [payoffMethod, setPayoffMethod] = useState('snowball');

  const columnGroupingModel: GridColumnGroupingModel = useMemo(
    () => [
      {
        groupId: 'Debts Information',
        children: [
          {
            groupId: 'Current Debts',
            children: financialPlan.debts.map((debt) => ({
              field: debt.name,
            })),
          },
          {
            groupId: 'Payoff Information',
            children: [
              {
                field:
                  payoffMethod === 'snowball'
                    ? 'totalDebtsWidthSnowball'
                    : 'totalDebtsWidthAvalanche',
              },
              { field: 'totalMinimumPayments' },
              { field: 'expectedSurplus' },
            ],
          },
        ],
      },
    ],
    [financialPlan.debts, payoffMethod]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'date',
        headerName: 'Date',
        flex: 1,
        valueFormatter: (value: Date) => dayjs(value).format('MMM YYYY'),
      },
      {
        field: 'totalIncome',
        headerName: 'Income',
        width: 125,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: 'totalFixedExpenses',
        headerName: 'Expenses',
        width: 125,
        valueFormatter: (value: number) => formatCurrency(value),
      },

      ...financialPlan.debts.map((debt) => ({
        field: debt.name,
        headerName: debt.name,
        width: 150,
        valueFormatter: (value: number) => formatCurrency(value),
      })),
      {
        field:
          payoffMethod === 'snowball'
            ? 'totalDebtsWidthSnowball'
            : 'totalDebtsWidthAvalanche',
        headerName: payoffMethod === 'snowball' ? '(Snowball)' : '(Avalanche)',
        width: 150,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: 'totalMinimumPayments',
        headerName: 'Min. Payments',
        width: 150,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: 'expectedSurplus',
        headerName: 'Surplus',
        width: 150,
        valueFormatter: (value: number) => formatCurrency(value),
      },
    ],
    [financialPlan.debts, payoffMethod]
  );

  const _avalancheFinancialPlan = useMemo(() => {
    if (payoffMethod !== 'avalanche') return null;

    const generatedFinancialSnapshots =
      financeUtils.generateMonthlyFinancialSnapshotsPredictions(
        financialPlan.financialSnapshots.at(-1)!,
        EPayoffMethodType.AVALANCHE,
        12
      );

    return {
      ...structuredClone(financialPlan),
      name: `${SYSTEM}_AVALANCHE`,
      financialSnapshots: generatedFinancialSnapshots,
    };
  }, [financialPlan, payoffMethod]);

  const _snowballFinancialPlan = useMemo(() => {
    if (payoffMethod !== 'snowball') return null;

    const generatedFinancialSnapshots =
      financeUtils.generateMonthlyFinancialSnapshotsPredictions(
        financialPlan.financialSnapshots.at(-1)!,
        EPayoffMethodType.SNOWBALL,
        12
      );

    return {
      ...structuredClone(financialPlan),
      name: `${SYSTEM}_SNOWBALL`,
      financialSnapshots: generatedFinancialSnapshots,
    };
  }, [financialPlan, payoffMethod]);

  const $rows = useMemo(() => {
    const pastFinancialSnapshotsRows = financialPlan.financialSnapshots.map(
      (snapshot) => {
        const totalIncome = financeUtils.getTotalMonthlyIncome(
          snapshot.incomes,
          snapshot.date
        );
        const totalFixedExpenses = financeUtils.getTotalFixedExpenses(
          snapshot.fixedExpenses
        );
        const totalMinimumPayments = financeUtils.getTotalMinimumDebtPayments(
          snapshot.debts
        );
        const totalDebtsWidthSnowball = 0;
        const totalDebtsWidthAvalanche = 0;
        const expectedSurplus = snapshot.expectedSurplus;

        return {
          date: snapshot.date.toDate(),
          totalIncome,
          totalFixedExpenses,
          ...snapshot.debts.reduce(
            (acc, debt) => {
              acc[debt.name] = debt.pendingDebt;
              return acc;
            },
            {} as Record<string, number>
          ),
          totalMinimumPayments,
          totalDebtsWidthSnowball,
          totalDebtsWidthAvalanche,
          expectedSurplus,
        };
      }
    );

    const calculatedRows = [];
    const selectedPlan =
      payoffMethod === 'snowball'
        ? _snowballFinancialPlan
        : _avalancheFinancialPlan;

    for (let i = 0; i < selectedPlan!.financialSnapshots.length; i++) {
      calculatedRows.push({
        date: selectedPlan!.financialSnapshots[i].date.toDate(),
        totalIncome: financeUtils.getTotalMonthlyIncome(
          selectedPlan!.financialSnapshots[i].incomes,
          selectedPlan!.financialSnapshots[i].date
        ),
        totalFixedExpenses: financeUtils.getTotalFixedExpenses(
          selectedPlan!.financialSnapshots[i].fixedExpenses
        ),
        totalMinimumPayments: financeUtils.getTotalMinimumDebtPayments(
          selectedPlan!.financialSnapshots[i].debts
        ),

        ...selectedPlan!.financialSnapshots[i].debts.reduce(
          (acc, debt) => {
            acc[debt.name] = debt.pendingDebt;
            return acc;
          },
          {} as Record<string, number>
        ),
        [payoffMethod === 'snowball'
          ? 'totalDebtsWidthSnowball'
          : 'totalDebtsWidthAvalanche']: financeUtils.getTotalDebts(
          selectedPlan!.financialSnapshots[i].debts
        ),

        expectedSurplus: selectedPlan!.financialSnapshots[i].expectedSurplus,
      });
    }

    return [...pastFinancialSnapshotsRows, ...calculatedRows];
  }, [financialPlan, payoffMethod]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: '0!important' }}>
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          color="primary"
          exclusive
          value={payoffMethod}
          onChange={(_, newAlignment) => {
            if (newAlignment) {
              setPayoffMethod(newAlignment);
            }
          }}
          aria-label="Payoff Method"
        >
          <Tooltip title="Snowball Method" placement="top">
            <ToggleButton value="snowball">
              <AcUnitIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Avalanche Method" placement="top">
            <ToggleButton value="avalanche">
              <SleddingIcon />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Toolbar>
      <DataGrid
        getRowId={(row) => row.date.toString()}
        rows={$rows}
        columns={columns}
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnMenu
        disableColumnFilter
        hideFooter
        density="compact"
        columnGroupingModel={columnGroupingModel}
      />
    </Box>
  );
};

export default PersonalFinancesGrid;
