export function formatCurrency(
  amount?: number | string | null,
  defaultValue = 0
) {
  if (!amount) {
    return defaultValue.toString();
  }
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  return (
    '$' +
    amount
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,')
      .replace('.', ',')
  );
}

export function formatPercentage(amount: number | string) {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  return amount.toFixed(2) + '%';
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
