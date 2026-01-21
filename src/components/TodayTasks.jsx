import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, User } from 'lucide-react';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CompleteTaskModal from './CompleteTaskModal';
import { tasksApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const TodayTasks = ({ tasks, users, projects, onTaskUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = new Date();
  const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);

  const handleCompleteTask = async (completionData) => {
    try {
      await tasksApi.update(completingTask.id, {
        ...completingTask,
        ...completionData
      });
      toast({ title: "任务已完成", description: "任务已标记为完成" });
      setCompleteModalOpen(false);
      setCompletingTask(null);
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      toast({ title: "完成任务失败", variant: "destructive" });
    }
  };

  // 获取今天的任务（排除已完成的）
  const getTodayTasks = () => {
    return tasks.filter(task => {
      const status = (task.status || 'pending').toString().toLowerCase();
      if (status === 'completed') return false;
      // 如果没有日期，也显示（旧任务兼容）
      if (!task.startDate && !task.endDate) return true;
      // 如果有日期，检查是否是今天的任务
      if (task.startDate || task.endDate) {
        try {
          if (task.startDate) {
            const start = parseISO(task.startDate);
            if (isToday(start)) return true;
          }
          if (task.endDate) {
            const end = parseISO(task.endDate);
            if (isToday(end)) return true;
            // 如果开始日期和结束日期都在今天之前或之后，也显示
            if (task.startDate) {
              const start = parseISO(task.startDate);
              if (start <= today && end >= today) return true;
            }
          }
        } catch (e) {
          // 日期解析失败，仍然显示（旧任务兼容）
          return true;
        }
      }
      return false;
    });
  };

  // 获取本周任务（排除已完成的）
  const getThisWeekTasks = () => {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    // 设置时间为23:59:59，确保包含整周
    weekEnd.setHours(23, 59, 59, 999);
    
    // 获取今日任务ID集合，确保今日任务也出现在本周任务中
    const todayTaskIds = new Set(getTodayTasks().map(t => t.id));
    
    return tasks.filter(task => {
      const status = (task.status || 'pending').toString().toLowerCase();
      if (status === 'completed') return false;
      
      // 如果是今日任务，一定显示在本周任务中
      if (todayTaskIds.has(task.id)) return true;
      
      // 如果没有结束日期，也显示（旧任务兼容）
      if (!task.endDate) return true;
      
      try {
        const end = parseISO(task.endDate);
        // 显示未来7天内到期的任务，或者今天到期的任务
        return end >= today && end <= weekEnd;
      } catch (e) {
        // 日期解析失败，仍然显示（旧任务兼容）
        return true;
      }
    });
  };

  const todayTasks = getTodayTasks();
  const weekTasks = getThisWeekTasks();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* 今日任务 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-5 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">今日任务</h3>
            <p className="text-sm text-gray-400">{todayTasks.length} 个任务</p>
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {todayTasks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">今天没有任务</p>
          ) : (
            todayTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const assignedUsers = (task.assignedTo || []).map(uid => users.find(u => u.id === uid)).filter(Boolean);
              // 判断任务是否过期（截止日期当天不算过期，只有过了23:59:59才算）
              let isOverdue = false;
              if (task.endDate) {
                try {
                  const deadline = parseISO(task.endDate);
                  // 将截止日期设置为当天的23:59:59.999
                  deadline.setHours(23, 59, 59, 999);
                  isOverdue = today > deadline;
                } catch (e) {
                  isOverdue = false;
                }
              }
              
              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 rounded-lg transition-colors",
                    isOverdue ? "bg-red-500/10 hover:bg-red-500/20" : "bg-gray-700/50 hover:bg-gray-700/70"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => navigate(`/tasks`)}>
                      <p className="text-sm font-medium text-white">{task.name}</p>
                      {project && (
                        <p className="text-xs text-gray-400 mt-1">{project.projectName}</p>
                      )}
                      {assignedUsers.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <User className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-400">
                            {assignedUsers.map(u => u.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        {isOverdue ? (
                          <span className="text-xs text-red-400 font-semibold">已过期</span>
                      ) : task.endDate ? (
                        (() => {
                          try {
                            return <span className="text-xs text-gray-400">{format(parseISO(task.endDate), 'HH:mm')}</span>;
                          } catch (e) {
                            return <span className="text-xs text-gray-400">-</span>;
                          }
                        })()
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompletingTask(task);
                          setCompleteModalOpen(true);
                        }}
                        title="完成任务"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* 本周任务 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect p-5 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">本周任务</h3>
            <p className="text-sm text-gray-400">{weekTasks.length} 个任务</p>
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {weekTasks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">本周没有任务</p>
          ) : (
            weekTasks.slice(0, 10).map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const assignedUsers = (task.assignedTo || []).map(uid => users.find(u => u.id === uid)).filter(Boolean);
              let daysUntilDue = 999;
              if (task.endDate) {
                try {
                  daysUntilDue = differenceInDays(parseISO(task.endDate), today);
                } catch (e) {
                  daysUntilDue = 999;
                }
              }
              
              return (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks`)}
                  className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{task.name}</p>
                      {project && (
                        <p className="text-xs text-gray-400 mt-1">{project.projectName}</p>
                      )}
                      {assignedUsers.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <User className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-400">
                            {assignedUsers.map(u => u.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {task.endDate ? (
                        (() => {
                          try {
                            return (
                              <>
                                <span className="text-xs text-gray-400">
                                  {format(parseISO(task.endDate), 'MM/dd')}
                                </span>
                                {daysUntilDue <= 3 && daysUntilDue >= 0 && (
                                  <span className="text-xs text-yellow-400 block mt-1">
                                    {daysUntilDue === 0 ? '今天' : `${daysUntilDue}天后`}
                                  </span>
                                )}
                              </>
                            );
                          } catch (e) {
                            return <span className="text-xs text-gray-400">-</span>;
                          }
                        })()
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      <CompleteTaskModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setCompletingTask(null);
        }}
        task={completingTask}
        onSubmit={handleCompleteTask}
      />
    </div>
  );
};

export default TodayTasks;
