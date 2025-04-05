import * as React from "react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";
import { ReactNode } from "react";

interface ProviderProps extends ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children, ...props }: ProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
