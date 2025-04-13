
import React from "react";
import { motion } from "framer-motion";

const History = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Post History</h1>
      <p className="text-muted-foreground">
        This page will display all your past entries stored in Google Sheets.
      </p>
      <p className="mt-4">
        The full implementation will be added in the next version, with a table showing all posts, sorting, and filtering options.
      </p>
    </motion.div>
  );
};

export default History;
