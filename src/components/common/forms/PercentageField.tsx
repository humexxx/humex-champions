import { IMaskInput } from 'react-imask';
import { forwardRef } from 'react';
import { TextFieldProps, TextField, InputAdornment } from '@mui/material';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PercentageMask = forwardRef<HTMLInputElement, CustomProps>(
  function PercentageMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00.00%"
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value: String(value) } })
        }
        overwrite
      />
    );
  }
);

const PercentageField = forwardRef<HTMLInputElement, TextFieldProps>(
  function PercentageField(props, ref) {
    return (
      <TextField
        {...props}
        inputRef={ref}
        InputProps={{
          inputComponent: PercentageMask as any,
          ...props.InputProps,
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
      />
    );
  }
);

export default PercentageField;
