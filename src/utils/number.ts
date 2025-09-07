export function formatCurrency(
  amount?: number | string | null,
  defaultValue = 0
) {
  if (!amount) {
    amount = defaultValue;
  }
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Number(amount));
  const formatted =
    '$' + absAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  return isNegative ? '-' + formatted : formatted;
}

export function formatPercentage(
  amount: number | string,
  fractionDigits = 2,
  absolute = false
) {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  if (absolute) {
    amount = Math.abs(amount);
  }
  return amount.toFixed(fractionDigits) + '%';
}

export function forceNumberOnInputChange(setter: (value: number) => void) {
  return (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    if (value === '') {
      setter(0);
    }
    const number = parseFloat(value);
    return isNaN(number) ? setter(0) : setter(number);
  };
}

export function formatCompactNumber(amount: number | string, defaultValue = 0) {
  if (!amount) {
    amount = defaultValue;
  }
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  return amount.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  });
}
