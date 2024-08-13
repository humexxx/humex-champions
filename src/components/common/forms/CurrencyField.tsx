import { IMaskInput } from 'react-imask';
import { forwardRef } from 'react';
import { TextFieldProps, TextField, InputAdornment } from '@mui/material';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const CurrencyMask = forwardRef<HTMLInputElement, CustomProps>(
  function CurrencyMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={Number}
        radix="."
        thousandsSeparator=","
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value: String(value) } })
        }
        overwrite
      />
    );
  }
);

const CurrencyField = forwardRef<HTMLInputElement, TextFieldProps>(
  function CurrencyField(props, ref) {
    return (
      <TextField
        {...props}
        inputRef={ref}
        InputProps={{
          inputComponent: CurrencyMask as any,
          ...props.InputProps,
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
    );
  }
);

export default CurrencyField;
