import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search credentials...",
}: SearchBarProps) {
  return (
    <InputGroup className="bg-muted/50 h-9 w-full rounded-lg transition-colors">
      <InputGroupAddon>
        <SearchIcon className="text-muted-foreground size-4" />
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            onClick={() => onChange("")}
          >
            <XIcon className="size-3.5" />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
