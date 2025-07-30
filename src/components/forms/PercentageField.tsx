import { forwardRef } from 'react';

import { TextFieldProps, TextField, InputAdornment } from '@mui/material';

const PercentageField = forwardRef<HTMLInputElement, TextFieldProps>(
  function PercentageField(props, ref) {
    return (
      <TextField
        {...props}
        value={((props.value ?? 0) as number) * 100}
        onChange={(e) => {
          const input = parseFloat(e.target.value);
          props.onChange?.((isNaN(input) ? 0 : input / 100) as any);
        }}
        inputRef={ref}
        type="number"
        slotProps={{
          ...props.slotProps,
          input: {
            ...props.slotProps?.input,
            startAdornment: <InputAdornment position="start">%</InputAdornment>,
          },
          htmlInput: {
            ...props.slotProps?.htmlInput,
            step: '0.01',
          },
        }}
        onFocus={(event) => {
          event.target.select();
        }}
      />
    );
  }
);

export default PercentageField;
