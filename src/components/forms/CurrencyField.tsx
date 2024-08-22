import { forwardRef } from 'react';
import { TextFieldProps, TextField, InputAdornment } from '@mui/material';

interface Props {
  currency?: 'USD';
}

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'USD':
      return '$';
    default:
      return '$';
  }
};

const CurrencyField = forwardRef<HTMLInputElement, TextFieldProps & Props>(
  function CurrencyField({ currency = 'USD', ...props }, ref) {
    return (
      <TextField
        {...props}
        inputRef={ref}
        type="number"
        InputProps={{
          ...props.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              {getCurrencySymbol(currency)}
            </InputAdornment>
          ),
        }}
        inputProps={{
          ...props.inputProps,
          step: 'any',
        }}
        onFocus={(event) => {
          event.target.select();
        }}
      />
    );
  }
);

export default CurrencyField;
