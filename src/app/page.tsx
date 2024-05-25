"use client";

import ChangeThemeButton from "@/components/layouts/change-theme-button";
import { TypographySmall } from "@/components/ui/typography";
import LineGraph from "@/components/LineGraph";

export default function Home() {
  return (
    <div>
      <ChangeThemeButton />
      <LineGraph />
    </div>
  );
}
