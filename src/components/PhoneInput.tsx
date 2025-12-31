import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const PhoneInput = ({ value, onChange, placeholder, className, id }: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Initialize with +250 if empty
    if (!value) {
      setDisplayValue("+250 ");
    } else if (!value.startsWith("+250")) {
      // Prepend +250 if not present
      const cleanNumber = value.replace(/^\+?250\s?/, "");
      setDisplayValue(`+250 ${cleanNumber}`);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Ensure +250 prefix is always present
    if (!newValue.startsWith("+250")) {
      // If user tries to delete the prefix, keep it
      if (newValue.length < 5) {
        newValue = "+250 ";
      } else {
        // Extract only the number part after any country code attempt
        const numbers = newValue.replace(/[^0-9]/g, "");
        newValue = `+250 ${numbers}`;
      }
    }

    // Format: +250 7XX XXX XXX
    const prefix = "+250 ";
    const numbers = newValue.slice(5).replace(/[^0-9]/g, "");
    
    let formatted = prefix;
    if (numbers.length > 0) {
      formatted += numbers.slice(0, 3);
    }
    if (numbers.length > 3) {
      formatted += " " + numbers.slice(3, 6);
    }
    if (numbers.length > 6) {
      formatted += " " + numbers.slice(6, 9);
    }

    setDisplayValue(formatted);
    onChange(formatted);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // If empty, add prefix on focus
    if (!displayValue) {
      setDisplayValue("+250 ");
    }
  };

  return (
    <Input
      id={id}
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder || "+250 7XX XXX XXX"}
      className={className}
    />
  );
};

export default PhoneInput;
