import { forwardRef } from "react";

import { TextFieldProps, TextField } from "@mui/material";
import { IMaskInput } from "react-imask";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const CostaRicaPhoneMask = forwardRef<HTMLInputElement, CustomProps>(
  function CostaRicaPhoneMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="0000-0000"
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);

const PhoneField = forwardRef<HTMLInputElement, TextFieldProps>(
  function PhoneField(props, ref) {
    return (
      <TextField
        {...props}
        inputRef={ref}
        InputProps={{
          inputComponent: CostaRicaPhoneMask as any,
          ...props.InputProps,
        }}
      />
    );
  }
);

export default PhoneField;
