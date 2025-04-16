"use client";

import { motion } from "framer-motion";

interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
      className="px-4 text-lg sm:text-2xl md:text-2xl lg:text-2xl tracking-tighter font-semibold"
    >
      {title}
    </motion.div>
  );
};

export default Title;
