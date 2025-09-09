import { forwardRef } from 'react';

import { InputAdornment, TextField, TextFieldProps } from '@mui/material';

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
        slotProps={{
          ...props.slotProps,
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {getCurrencySymbol(currency)}
              </InputAdornment>
            ),
            ...props.slotProps?.input,
          },
          htmlInput: {
            step: 'any',
            ...props.slotProps?.htmlInput,
          },
        }}
        onFocus={(event) => {
          event.target.select();
        }}
      />
    );
  }
);

export default CurrencyField;
