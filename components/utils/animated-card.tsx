"use client";

import { motion } from "framer-motion";
import { Card } from "../ui/card";

interface AnimatedCardProps {
  text: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ text }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
      className="px-4"
    >
      <Card className="p-4">{text}</Card>
    </motion.div>
  );
};

export default AnimatedCard;
