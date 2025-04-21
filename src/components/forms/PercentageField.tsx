import { forwardRef } from 'react';

import { TextFieldProps, TextField, InputAdornment } from '@mui/material';

const PercentageField = forwardRef<HTMLInputElement, TextFieldProps>(
  function PercentageField(props, ref) {
    return (
      <TextField
        {...props}
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
