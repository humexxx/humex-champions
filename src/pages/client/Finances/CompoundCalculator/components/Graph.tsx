import { useMemo } from 'react';

import { Box } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { MULTIPLE_GRAPH_COLORS } from 'src/consts';
import { formatCurrency } from 'src/utils';

import { DataSet } from '../Page';


const calculateInterest = (
  initial: number,
  monthly: number,
  years: number,
  rate: number
) => {
  const data = [];
  let totalCompoundAmount = initial;

  for (let year = 1; year <= years; year++) {
    totalCompoundAmount =
      totalCompoundAmount * (1 + rate / 100) +
      monthly * 12 * Math.pow(1 + rate / 100, year);

    data.push({
      year: dayjs().add(year, 'year').year(),
      amount: totalCompoundAmount,
    });
  }

  return data;
};

interface Props {
  data: DataSet[];
  years: number;
}

const Graph = ({ data, years }: Props) => {
  const { t } = useTranslation();

  const dataset = useMemo(
    () =>
      data.map(
        ({ initialInvestment, monthlyContribution, interestRate }, i) => ({
          color: MULTIPLE_GRAPH_COLORS[i],
          data: calculateInterest(
            initialInvestment,
            monthlyContribution,
            years,
            interestRate
          ),
        })
      ),

    [data, years]
  );

  return (
    <Box height={500}>
      <LineChart
        xAxis={[
          {
            data: dataset[0]?.data.map(({ year }) => year),
            valueFormatter: (value) => value.toString(),
            scaleType: 'point',
          },
        ]}
        yAxis={[
          {
            valueFormatter: (value) =>
              value > 99999999
                ? `${t('common.infinite')} $$`
                : `$${value.toLocaleString()}`,
          },
        ]}
        series={dataset.map((data, i) => ({
          curve: 'natural',
          data: data.data.map(({ amount }) => amount),
          label: `${t('finances.compound-calculator.investment')} ${i + 1}`,
          color: data.color,
          valueFormatter: (val) =>
            (val ?? 0) > 99999999
              ? `${t('common.infinite')} $$`
              : formatCurrency(val),
        }))}
        margin={{ left: 80 }}
        grid={{ horizontal: true }}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
      />
    </Box>
  );
};

export default Graph;
