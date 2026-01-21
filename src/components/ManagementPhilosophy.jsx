import React from 'react';
import { motion } from 'framer-motion';

const ManagementPhilosophy = () => {
  const philosophy = [
    { text: '研发管理 ≠ 项目管理', highlight: false },
    { text: '项目管理 ≠ 排期', highlight: false },
    { text: '排期 ≠ 可预测', highlight: false },
    { text: '可预测 = 历史 + 节奏 + 约束 + 风险', highlight: true },
    { text: '好的管理 = 提前量', highlight: true },
    { text: '高级管理 = 系统稳定性', highlight: true },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 border-b border-indigo-800/50 backdrop-blur-sm shadow-lg">
      <div className="px-6 py-2.5">
        <div className="flex items-center justify-center gap-3 flex-wrap max-w-full">
          {philosophy.map((item, index) => (
            <React.Fragment key={index}>
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                  item.highlight
                    ? 'text-indigo-300 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {item.text}
              </motion.span>
              {index < philosophy.length - 1 && (
                <span className="text-gray-600 text-xs">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagementPhilosophy;
