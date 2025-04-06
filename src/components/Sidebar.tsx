"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import {
  Sidebar as SidebarContainer,
  SidebarHeader,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { SidebarSlider } from "@/components/SettingSlider";


interface SidebarProps {
  offsetX: number;
  setOffsetX: React.Dispatch<React.SetStateAction<number>>;
  offsetY: number;
  setOffsetY: React.Dispatch<React.SetStateAction<number>>;
  marginX: number;
  setMarginX: React.Dispatch<React.SetStateAction<number>>;
  marginY: number;
  setMarginY: React.Dispatch<React.SetStateAction<number>>;
  columns: number;
  setColumns: React.Dispatch<React.SetStateAction<number>>;
  rows: number;
  setRows: React.Dispatch<React.SetStateAction<number>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  offsetX,
  setOffsetX,
  offsetY,
  setOffsetY,
  marginX,
  setMarginX,
  marginY,
  setMarginY,
  columns,
  setColumns,
  rows,
  setRows,
}) => {
  const { theme, setTheme } = useTheme();
  return (
    <SidebarContainer side="right">
      <SidebarHeader className="flex flex-row justify-between items-center">
        <h2 className="text-lg font-semibold">Grid Settings</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex flex-col gap-8 w-full p-2">
              <SidebarSlider
                label="Offset X"
                unit="px"
                value={[offsetX, setOffsetX, 0]}
                min={-100}
                max={100}
              />
              <SidebarSlider
                label="Offset Y"
                unit="px"
                value={[offsetY, setOffsetY, 0]}
                min={-100}
                max={100}
              />
              <SidebarSlider
                label="Margin X"
                unit="px"
                value={[marginX, setMarginX, 0]}
                min={0}
                max={100}
              />
              <SidebarSlider
                label="Margin Y"
                unit="px"
                value={[marginY, setMarginY, 0]}
                min={0}
                max={100}
              />
              <SidebarSlider
                label="Columns"
                value={[columns, setColumns, 4]}
                min={1}
                max={20}
              />
              <SidebarSlider
                label="Rows"
                value={[rows, setRows, 4]}
                min={1}
                max={20}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;