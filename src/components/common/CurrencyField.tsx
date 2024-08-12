import { TextFieldProps, TextField } from '@mui/material';
import { forwardRef } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface NumericFormatInputProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumericFormatInput = forwardRef<
  NumericFormatProps,
  NumericFormatInputProps
>(function NumericFormatInput(props, ref) {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      valueIsNumericString
      prefix="$"
    />
  );
});

const CurrencyField = forwardRef<HTMLInputElement, TextFieldProps>(
  function CurrencyField(props, ref) {
    return (
      <TextField
        {...props}
        inputRef={ref}
        InputProps={{
          inputComponent: NumericFormatInput as any,
          ...props.InputProps,
        }}
      />
    );
  }
);

export default CurrencyField;
