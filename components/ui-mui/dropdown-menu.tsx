"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";

import {
  CheckIcon,
  ChevronRightIcon,
  CircleIcon,
  ChevronDown,
  Search
} from "lucide-react";

export default function DropdownSelect({
  value,
  options,
  onChange,
  placeholder = "Select…",
  className = "",
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleTriggerClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={handleTriggerClick}>
        <button
          className={cn(
            "w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm flex items-center justify-between text-gray-700 hover:border-gray-400 transition",
            className
          )}
        >
          <span>{value || placeholder}</span>
          <ChevronDown className={cn("w-4 h-4 text-gray-500 transition", open && "rotate-180")} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        align="start"
        className="w-48"
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => {
              onChange(opt);
              setAnchorEl(null);
            }}
          >
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function DropdownSelectSearch({
  value,
  options,
  onChange,
  placeholder = "Select…",
  className = "",
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const [query, setQuery] = React.useState("");

  const filteredOptions = React.useMemo(
    () => options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase())),
    [query, options]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}>
        <button
          className={cn(
            "w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm flex items-center justify-between text-gray-700 hover:border-gray-400 transition",
            className
          )}
        >
          <span>{value || placeholder}</span>
          <ChevronDown className={cn("w-4 h-4 text-gray-500 transition", open && "rotate-180")} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null);
          setQuery("");
        }}
        align="start"
        className="w-60"
      >
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2 px-2 h-9 rounded-md border border-gray-300 bg-gray-50">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              autoFocus
              value={query}
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {filteredOptions.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
        ) : (
          filteredOptions.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onClick={() => {
                onChange(opt);
                setAnchorEl(null);
                setQuery("");
              }}
              className="text-sm py-2"
            >
              {opt}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuTrigger<T extends HTMLElement>({
  children,
  onClick,
}: {
  children: React.ReactElement<
    React.HTMLAttributes<T>
  >;
  onClick?: (e: React.MouseEvent<T>) => void;
}) {
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent<T>) => {
      children.props.onClick?.(e);
      onClick?.(e);
    },
  });
}


function DropdownMenuContent({
  anchorEl,
  open,
  onClose,
  className,
  align = "start",
  children,
  ...props
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  className?: string;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        list: {
          autoFocusItem: false,
          disableListWrap: true,
          onKeyDown: (e: React.KeyboardEvent<HTMLUListElement>) => {
            e.stopPropagation();
          },
        },
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: align === "end" ? "right" : "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: align === "end" ? "right" : "left",
      }}
      classes={{
        paper: cn("rounded-md border shadow-md p-1 bg-white text-gray-900", className),
      }}
      {...props}
    >
      {children}
    </Menu>
  );
}


function DropdownMenuItem({
  inset,
  variant = "default",
  className,
  children,
  onClick,
}: {
  inset?: boolean;
  variant?: "default" | "destructive";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <MenuItem
      onClick={onClick}
      className={cn(
        "flex cursor-pointer gap-2 rounded-sm text-sm px-2 py-2",
        inset && "pl-8",
        variant === "destructive" && "text-red-600",
        className
      )}
    >
      {children}
    </MenuItem>
  );
}


function DropdownMenuCheckboxItem({
  checked,
  children,
  onClick,
}: {
  checked: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <MenuItem onClick={onClick} className="relative pl-8 py-2">
      {checked && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2">
          <CheckIcon className="size-4" />
        </span>
      )}
      {children}
    </MenuItem>
  );
}

function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function DropdownMenuRadioItem({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <MenuItem onClick={onClick} className="relative pl-8 py-2">
      {selected && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2">
          <CircleIcon className="size-2 fill-current" />
        </span>
      )}
      {children}
    </MenuItem>
  );
}

function DropdownMenuLabel({
  children,
  inset,
  className,
}: {
  children: React.ReactNode;
  inset?: boolean;
  className?: string;
}) {
  return (
    <Typography className={cn("px-2 py-1.5 text-xs font-semibold", inset && "pl-8", className)}>
      {children}
    </Typography>
  );
}

function DropdownMenuSeparator() {
  return <Divider className="my-1" />;
}

function DropdownMenuShortcut({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto text-xs text-gray-400">{children}</span>;
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function DropdownMenuSubTrigger({
  children,
  inset,
  className,
  onClick,
}: {
  children: React.ReactNode;
  inset?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <MenuItem
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-sm px-2 py-2",
        inset && "pl-8",
        className
      )}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuItem>
  );
}

function DropdownMenuSubContent({
  anchorEl,
  open,
  onClose,
  children,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      classes={{
        paper: "rounded-md border shadow-lg p-1",
      }}
    >
      {children}
    </Popover>
  );
}


export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
