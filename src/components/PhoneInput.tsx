import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
  { code: "+243", country: "DRC", flag: "🇨🇩" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const PhoneInput = ({ value, onChange, placeholder, className, id }: PhoneInputProps) => {
  const [selectedCode, setSelectedCode] = useState("+250");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    // Parse existing value to extract country code and number
    if (value) {
      const matchedCode = countryCodes.find(c => value.startsWith(c.code));
      if (matchedCode) {
        setSelectedCode(matchedCode.code);
        const numberPart = value.slice(matchedCode.code.length).trim();
        setPhoneNumber(numberPart);
      } else {
        // Default to Rwanda if no code found
        const cleanNumber = value.replace(/^\+?\d{1,3}\s?/, "").trim();
        setPhoneNumber(cleanNumber);
      }
    }
  }, []);

  const handleCodeChange = (newCode: string) => {
    setSelectedCode(newCode);
    const formattedNumber = phoneNumber ? `${newCode} ${phoneNumber}` : newCode;
    onChange(formattedNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and spaces
    const rawValue = e.target.value.replace(/[^0-9\s]/g, "");
    
    // Format the number with spaces for readability
    const digits = rawValue.replace(/\s/g, "");
    let formatted = "";
    
    for (let i = 0; i < digits.length && i < 9; i++) {
      if (i === 3 || i === 6) {
        formatted += " ";
      }
      formatted += digits[i];
    }
    
    setPhoneNumber(formatted);
    onChange(`${selectedCode} ${formatted}`);
  };

  const selectedCountry = countryCodes.find(c => c.code === selectedCode);

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={selectedCode} onValueChange={handleCodeChange}>
        <SelectTrigger className="w-[120px] shrink-0">
          <SelectValue>
            {selectedCountry && (
              <span className="flex items-center gap-1">
                <span>{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.code}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.country}</span>
                <span className="text-muted-foreground">{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        value={phoneNumber}
        onChange={handleNumberChange}
        placeholder={placeholder || "7XX XXX XXX"}
        className="flex-1"
      />
    </div>
  );
};

export default PhoneInput;
