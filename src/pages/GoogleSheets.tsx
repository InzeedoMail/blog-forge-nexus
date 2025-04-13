
import React from "react";
import { motion } from "framer-motion";

const GoogleSheets = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Google Sheets</h1>
      <p className="text-muted-foreground">
        This page will allow you to manage your Google Sheets integration.
      </p>
      <p className="mt-4">
        The full implementation will be added in the next version, with options to view, edit, and manage data in your Google Sheets.
      </p>
    </motion.div>
  );
};

export default GoogleSheets;
