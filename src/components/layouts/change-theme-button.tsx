"use client";
import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

export default function ChangeThemeButton() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <LuSun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <LuMoon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    </Button>
  );
}
