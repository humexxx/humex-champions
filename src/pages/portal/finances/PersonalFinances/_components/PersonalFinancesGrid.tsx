import { useMemo } from 'react';

import { Box } from '@mui/material';
import { IFinancialPlan } from '@shared/models/finances';
import { financeUtils } from '@shared/utils';
import { SYSTEM } from 'src/consts';
import { EPayoffMethodType } from '@shared/enums/finance';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { formatCurrency } from 'src/utils';

type Row = {
  totalIncome: number;
  totalFixedExpenses: number;
  totalMinimumPayments: number;
  totalDebtsWidthSnowball: number;
  totalDebtsWidthAvalanche: number;
  date: Date;
  expectedSurplus: number;
};

const columns: GridColDef<Row>[] = [
  {
    field: 'date',
    headerName: 'Date',
    width: 90,
    valueFormatter: (value: Date) => dayjs(value).format('MM/YYYY'),
  },
  {
    field: 'totalIncome',
    headerName: 'Income',
    width: 150,
    valueFormatter: (value: number) => formatCurrency(value),
  },
  {
    field: 'totalFixedExpenses',
    headerName: 'Fixed Expenses',
    width: 150,
    valueFormatter: (value: number) => formatCurrency(value),
  },
  {
    field: 'totalMinimumPayments',
    headerName: 'Minimum Payments',
    width: 150,
    valueFormatter: (value: number) => formatCurrency(value),
  },
  {
    field: 'totalDebtsWidthSnowball',
    headerName: 'Total Debts (Snowball)',
    width: 150,
    valueFormatter: (value: number) => formatCurrency(value),
  },
  {
    field: 'expectedSurplus',
    headerName: 'Expected Surplus',
    width: 150,
    valueFormatter: (value: number) => formatCurrency(value),
  },
];

interface Props {
  financialPlans: IFinancialPlan[] | null;
  loading: boolean;
  currentIndex: number;
}

const PersonalFinancesGraph = ({
  financialPlans,
  loading,
  currentIndex,
}: Props) => {
  const _avalancheFinancialPlan = useMemo(() => {
    if (!financialPlans?.length) return null;

    const plan = financialPlans[currentIndex];

    const generatedFinancialSnapshots =
      financeUtils.generateMonthlyFinancialSnapshotsPredictions(
        plan.financialSnapshots.at(-1)!,
        EPayoffMethodType.AVALANCHE,
        12
      );

    return {
      ...structuredClone(plan),
      name: `${SYSTEM}_AVALANCHE`,
      financialSnapshots: generatedFinancialSnapshots,
    };
  }, [financialPlans, currentIndex]);

  const _snowballFinancialPlan = useMemo(() => {
    if (!financialPlans?.length) return null;

    const plan = financialPlans[currentIndex];

    const generatedFinancialSnapshots =
      financeUtils.generateMonthlyFinancialSnapshotsPredictions(
        plan.financialSnapshots.at(-1)!,
        EPayoffMethodType.SNOWBALL,
        12
      );

    return {
      ...structuredClone(plan),
      name: `${SYSTEM}_SNOWBALL`,
      financialSnapshots: generatedFinancialSnapshots,
    };
  }, [financialPlans, currentIndex]);

  const $rows: Row[] = useMemo(() => {
    const selectedPlan = financialPlans?.[currentIndex];
    if (!selectedPlan?.financialSnapshots.length) return [];

    const pastFinancialSnapshotsRows: Row[] =
      selectedPlan.financialSnapshots.map((snapshot) => {
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
          totalMinimumPayments,
          totalDebtsWidthSnowball,
          totalDebtsWidthAvalanche,
          expectedSurplus,
        };
      });

    const calculatedRows: Row[] = [];

    for (
      let i = 0;
      i < _snowballFinancialPlan!.financialSnapshots.length;
      i++
    ) {
      calculatedRows.push({
        date: _snowballFinancialPlan!.financialSnapshots[i].date.toDate(),
        totalIncome: financeUtils.getTotalMonthlyIncome(
          _snowballFinancialPlan!.financialSnapshots[i].incomes,
          _snowballFinancialPlan!.financialSnapshots[i].date
        ),
        totalFixedExpenses: financeUtils.getTotalFixedExpenses(
          _snowballFinancialPlan!.financialSnapshots[i].fixedExpenses
        ),
        totalMinimumPayments: financeUtils.getTotalMinimumDebtPayments(
          _snowballFinancialPlan!.financialSnapshots[i].debts
        ),
        totalDebtsWidthSnowball: financeUtils.getTotalDebts(
          _snowballFinancialPlan!.financialSnapshots[i].debts
        ),
        totalDebtsWidthAvalanche: financeUtils.getTotalDebts(
          _avalancheFinancialPlan!.financialSnapshots[i].debts
        ),
        expectedSurplus: 0,
      });
    }

    return [...pastFinancialSnapshotsRows, ...calculatedRows];
  }, [financialPlans, currentIndex]);

  if (loading) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        getRowId={(row) => row.date.toString()}
        rows={$rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default PersonalFinancesGraph;
