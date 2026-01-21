import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Package, Edit, Trash2, GripVertical } from 'lucide-react';

const OrderCard = ({ order, onEdit, onDelete, onDragStart, priorityProps }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-4 cursor-grab"
      draggable
      onDragStart={(e) => onDragStart(e, order)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-white text-base pr-4">{order.orderNumber}</h3>
        <div className="flex items-center gap-2">
            <button onClick={() => onEdit(order)} className="text-gray-400 hover:text-white transition-colors"><Edit size={16} /></button>
            <button onClick={() => onDelete(order.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{order.technicalRequirements}</p>

      <div className="flex justify-between items-center mb-4">
        <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityProps.color}`}>{priorityProps.text}</div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
            <User size={14} />
            <span>{order.salesName}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{order.estimatedCompletion || 'N/A'}</span>
        </div>
         <div className="flex items-center gap-2">
          <Package size={14} />
          <span>{order.deviceQuantity}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;