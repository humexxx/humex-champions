import { forwardRef } from 'react';
import { TextFieldProps, TextField, InputAdornment } from '@mui/material';

const PercentageField = forwardRef<HTMLInputElement, TextFieldProps>(
  function PercentageField(props, ref) {
    return (
      <TextField
        {...props}
        inputRef={ref}
        type="number"
        InputProps={{
          ...props.InputProps,
          startAdornment: <InputAdornment position="start">%</InputAdornment>,
        }}
        inputProps={{
          ...props.inputProps,
          step: '0.01',
        }}
        onFocus={(event) => {
          event.target.select();
        }}
      />
    );
  }
);

export default PercentageField;
