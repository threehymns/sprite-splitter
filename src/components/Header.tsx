"use client";

import React from "react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header: React.FC = () => {
  return (
    <motion.header
      className="flex justify-between items-center pt-3 pl-6 pr-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold">Spritesheet Cutter</h1>
      <SidebarTrigger />
    </motion.header>
  );
};

export default Header;