import React from "react";
import { Control, Controller } from "react-hook-form";
import { ImageRequireSource, TextInputProps, TextStyle } from "react-native";
import Input from "./Input";

interface FormInputProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  index: number;
  inputMode?: "text" | "email" | "numeric" | "tel" | "url";
  password?: boolean;
  inputProps?: TextInputProps;
  inputStyle?: TextStyle;
  image?: ImageRequireSource;
}

const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  label,
  placeholder,
  index,
  inputMode = "text",
  password = false,
  inputProps,
  inputStyle,
  image,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Input
          index={index}
          label={label}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          onBlur={onBlur}
          inputMode={inputMode}
          password={password}
          error={error?.message}
          inputProps={inputProps}
          inputStyle={inputStyle}
          image={image}
        />
      )}
    />
  );
};

export default FormInput;
