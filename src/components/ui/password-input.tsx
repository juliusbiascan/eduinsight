import * as React from "react"

import { Input } from "./input";
import { EyeIcon, EyeOff } from "lucide-react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: React.ReactNode;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ suffix, className, ...props }, ref) => {

    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        type={showPassword ? "text" : "password"}
        suffix={
          showPassword ? (<EyeIcon onClick={() => setShowPassword(false)} />) : (<EyeOff onClick={() => setShowPassword(true)} />)
        } className={className} {...props} ref={ref}></Input>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
