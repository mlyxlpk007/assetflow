import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Trash2, Edit, Calendar, User, Package, ChevronDown, Search, LayoutDashboard, Folder, ClipboardList, Bell, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import OrderModal from '@/components/OrderModal';
import OrderCard from '@/components/OrderCard';

const OrderTrackingBoard = () => {
  const { toast } = useToast();
  const [stages, setStages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('zh-CN', options));
  }, []);

  useEffect(() => {
    const initialStages = [
      { id: 'requirements', name: '需求管道', color: 'border-blue-500' },
      { id: 'design', name: '设计阶段', color: 'border-purple-500' },
      { id: 'development', name: '开发阶段', color: 'border-green-500' },
      { id: 'testing', name: '测试验证', color: 'border-yellow-500' },
      { id: 'production', name: '生产准备', color: 'border-red-500' },
      { id: 'completed', name: '已完成', color: 'border-indigo-500' }
    ];
    const sampleOrders = [
      { id: '1', orderNumber: 'RD-2024-001', salesName: '张明', technicalRequirements: '高精度传感器模组', deviceQuantity: 500, estimatedCompletion: '2025-10-15', priority: 'high', stage: 'requirements', notes: '客户要求加急', size: '120x80mm', moduleModel: 'SM-A', certificationRequirements: 'CE, FCC', installationEnvironment: '工业', region: '欧洲' },
      { id: '2', orderNumber: 'RD-2024-002', salesName: '李华', technicalRequirements: '低功耗无线模块', deviceQuantity: 1000, estimatedCompletion: '2025-11-20', priority: 'medium', stage: 'design', notes: '优化天线设计', size: '50x30mm', moduleModel: 'WM-B', certificationRequirements: 'CE', installationEnvironment: '户外', region: '北美' },
      { id: '3', orderNumber: 'RD-2024-003', salesName: '王芳', technicalRequirements: '智能家居控制器', deviceQuantity: 200, estimatedCompletion: '2025-09-30', priority: 'low', stage: 'development', notes: '', size: '100x60mm', moduleModel: 'CT-C', certificationRequirements: 'FCC', installationEnvironment: '室内', region: '亚太' }
    ];

    const savedStages = localStorage.getItem('orderTrackingStages');
    const savedOrders = localStorage.getItem('orderTrackingOrders');

    setStages(savedStages ? JSON.parse(savedStages) : initialStages);
    if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
    } else {
        setOrders(sampleOrders);
        localStorage.setItem('orderTrackingOrders', JSON.stringify(sampleOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orderTrackingStages', JSON.stringify(stages));
  }, [stages]);

  useEffect(() => {
    localStorage.setItem('orderTrackingOrders', JSON.stringify(orders));
  }, [orders]);

  const handleSaveOrder = (orderData) => {
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...orderData } : o));
      toast({ title: "订单更新成功！" });
    } else {
      const newOrder = { ...orderData, id: Date.now().toString() };
      setOrders([...orders, newOrder]);
      toast({ title: "订单添加成功！" });
    }
    setIsModalOpen(false);
    setEditingOrder(null);
  };
  
  const handleDeleteOrder = (orderId) => {
    setOrders(orders.filter(order => order.id !== orderId));
    toast({ title: "订单已删除" });
  };

  const handleDragStart = (e, order) => { setDraggedOrder(order); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    if (draggedOrder && draggedOrder.stage !== targetStage) {
      setOrders(orders.map(o => o.id === draggedOrder.id ? { ...o, stage: targetStage } : o));
      toast({ title: `订单已移至 ${stages.find(s => s.id === targetStage).name}` });
    }
    setDraggedOrder(null);
  };

  const getOrdersByStage = (stageId) => orders.filter(order => order.stage === stageId);
  const getPriorityProps = (priority) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-500/20 text-red-400', text: '高' };
      case 'medium': return { color: 'bg-yellow-500/20 text-yellow-400', text: '中' };
      case 'low': return { color: 'bg-green-500/20 text-green-400', text: '低' };
      default: return { color: 'bg-gray-500/20 text-gray-400', text: '无' };
    }
  };

  const showToast = () => {
    toast({
      title: '🚧 功能尚未实现',
      description: '别担心！您可以在下一次提示中请求它！🚀',
    });
  };

  const navItems = [
    { icon: LayoutDashboard, label: '仪表盘', active: true },
    { icon: Folder, label: '项目' },
    { icon: ClipboardList, label: '任务' },
    { icon: Calendar, label: '日历' },
    { icon: User, label: '客户' },
  ];

  const reportItems = [
    { icon: BarChart2, label: '报告' },
    { icon: Bell, label: '通知' },
    { icon: Settings, label: '设置' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      <aside className="w-64 bg-gray-900/70 backdrop-blur-xl border-r border-gray-800 p-6 flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Package size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">订单跟踪</h1>
        </div>
        <nav className="flex-grow">
          <ul>
            {navItems.map(item => (
              <li key={item.label} onClick={item.active ? null : showToast}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-2 cursor-pointer transition-colors ${item.active ? 'bg-indigo-600/20 text-indigo-300' : 'hover:bg-gray-800'}`}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
          <ul>
            {reportItems.map(item => (
              <li key={item.label} onClick={showToast}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-gray-800">
                <item.icon size={20} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input type="text" placeholder="搜索订单, 任务, 客户..." className="w-full bg-gray-800 border border-transparent rounded-lg pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-6">
            <span className="text-gray-400">{currentDate}</span>
            <div className="flex items-center gap-4">
              <button onClick={showToast} className="p-2 rounded-full hover:bg-gray-800"><Bell size={20} /></button>
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">YH</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-white">项目管道</h2>
             <Button onClick={() => { setEditingOrder(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                <Plus size={16} className="mr-2" /> 新增订单
              </Button>
          </div>
          <div className="flex gap-6 min-w-max">
            {stages.map((stage) => (
              <div key={stage.id} className="w-80 flex-shrink-0" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)}>
                <div className={`flex items-center justify-between p-3 rounded-t-lg bg-gray-800 border-b-2 ${stage.color}`}>
                  <h3 className="font-semibold text-white">{stage.name}</h3>
                  <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{getOrdersByStage(stage.id).length}</span>
                </div>
                <div className="p-1 pt-4 space-y-4 h-full">
                  <AnimatePresence>
                    {getOrdersByStage(stage.id).map((order) => (
                      <OrderCard
                        key={order.id} order={order}
                        onEdit={(order) => { setEditingOrder(order); setIsModalOpen(true); }}
                        onDelete={handleDeleteOrder}
                        onDragStart={handleDragStart}
                        priorityProps={getPriorityProps(order.priority)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveOrder}
        editingOrder={editingOrder}
        stages={stages}
      />
    </div>
  );
};

export default OrderTrackingBoard;