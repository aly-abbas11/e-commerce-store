import { DM_Sans, Fraunces } from "next/font/google";

/** Biometic cream / forest theme: serif display + clean sans */
export const gadgetSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-gadget-sans",
  display: "swap",
  preload: false,
});

export const gadgetDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-gadget-display",
  display: "swap",
  preload: false,
});

export const gadgetFontClass = `${gadgetSans.variable} ${gadgetDisplay.variable}`;
