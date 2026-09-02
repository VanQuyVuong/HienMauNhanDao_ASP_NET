import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#fdf8f9]">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px] z-[1]"></div>
      
      {/* Orb 1: Đỏ hồng */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#ff6b7e] to-[#e62e43] opacity-30 mix-blend-multiply blur-[80px]"
        animate={{
          x: [0, 150, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%', left: '10%' }}
      />

      {/* Orb 2: Đỏ thẫm */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#c01b30] to-[#990014] opacity-20 mix-blend-multiply blur-[100px]"
        animate={{
          x: [0, -200, 100, 0],
          y: [0, 150, -100, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '40%', right: '5%' }}
      />

      {/* Orb 3: Xanh ngọc (Accent) */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[#00b894] to-[#00d2d3] opacity-15 mix-blend-multiply blur-[60px]"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -50, 150, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '5%', left: '30%' }}
      />
      
      {/* Lưới Grid pattern nhẹ */}
      <div className="absolute inset-0 z-[2] opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#121826 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    </div>
  );
};

export default AnimatedBackground;
