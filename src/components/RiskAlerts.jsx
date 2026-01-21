import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, CheckCircle, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays, isPast, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CompleteTaskModal from './CompleteTaskModal';
import { tasksApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const RiskAlerts = ({ projects, tasks, users, onTaskUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // 判断日期是否过期（截止日期当天不算过期，只有过了23:59:59才算）
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    try {
      const deadline = parseISO(dateString);
      // 将截止日期设置为当天的23:59:59.999
      deadline.setHours(23, 59, 59, 999);
      const now = new Date();
      return now > deadline;
    } catch (e) {
      return false;
    }
  };

  // 计算风险指标
  const calculateRisks = () => {
    const today = new Date();
    const risks = {
      overdueTasks: [],
      dueSoonTasks: [],
      atRiskProjects: [],
      overdueProjects: []
    };

    // 检查任务（排除已完成的）
    tasks.forEach(task => {
      const status = (task.status || 'pending').toString().toLowerCase();
      if (status === 'completed') return;
      // 如果没有结束日期，跳过风险检查（旧任务兼容）
      if (!task.endDate) return;
      try {
        const endDate = parseISO(task.endDate);
        const daysUntilDue = differenceInDays(endDate, today);
        
        if (isOverdue(task.endDate)) {
          risks.overdueTasks.push({ ...task, daysOverdue: Math.abs(daysUntilDue) });
        } else if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          risks.dueSoonTasks.push({ ...task, daysUntilDue });
        }
      } catch (e) {
        // 忽略日期解析错误（旧任务兼容）
        console.warn('Invalid date format for task:', task.id, task.endDate);
      }
    });

    // 检查项目
    projects.forEach(project => {
      if (!project.estimatedCompletion) return;
      const completionDate = parseISO(project.estimatedCompletion);
      const daysUntilCompletion = differenceInDays(completionDate, today);
      const progress = calculateProjectProgress(project);
      
      if (isOverdue(project.estimatedCompletion) && progress < 100) {
        risks.overdueProjects.push({ ...project, daysOverdue: Math.abs(daysUntilCompletion), progress });
      } else if (daysUntilCompletion <= 7 && progress < 80) {
        risks.atRiskProjects.push({ ...project, daysUntilCompletion, progress });
      }
    });

    return risks;
  };

  const calculateProjectProgress = (project) => {
    const stages = ['requirements', 'structural_design', 'electronic_design', 'system_design', 'software_design', 'production', 'debugging', 'shipping'];
    const currentIndex = stages.findIndex(s => s === project.currentStageId);
    return currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;
  };

  const risks = calculateRisks();
  const totalRisks = risks.overdueTasks.length + risks.dueSoonTasks.length + 
                     risks.atRiskProjects.length + risks.overdueProjects.length;

  if (totalRisks === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-6 rounded-xl mb-6"
      >
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle className="h-6 w-6" />
          <h3 className="text-lg font-bold">一切正常</h3>
        </div>
        <p className="text-gray-400 mt-2">当前没有需要关注的风险项目或任务</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-6"
    >
      {/* 已过期任务 */}
      {risks.overdueTasks.length > 0 && (
        <div className="glass-effect p-5 rounded-xl border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="font-bold text-white">已过期任务 ({risks.overdueTasks.length})</h3>
          </div>
          <div className="space-y-2">
            {risks.overdueTasks.slice(0, 5).map(task => {
              const assignedUsers = (task.assignedTo || []).map(uid => users.find(u => u.id === uid)?.name).filter(Boolean);
              return (
                <div
                  key={task.id}
                  className="p-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => navigate(`/tasks`)}>
                      <p className="text-sm font-medium text-white">{task.name}</p>
                      {assignedUsers.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">负责人: {assignedUsers.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400 font-semibold">
                        已过期 {task.daysOverdue} 天
                      </span>
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
            })}
          </div>
        </div>
      )}

      {/* 即将到期任务 */}
      {risks.dueSoonTasks.length > 0 && (
        <div className="glass-effect p-5 rounded-xl border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-yellow-400" />
            <h3 className="font-bold text-white">即将到期任务 ({risks.dueSoonTasks.length})</h3>
          </div>
          <div className="space-y-2">
            {risks.dueSoonTasks.slice(0, 5).map(task => {
              const assignedUsers = (task.assignedTo || []).map(uid => users.find(u => u.id === uid)?.name).filter(Boolean);
              return (
                <div
                  key={task.id}
                  className="p-3 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => navigate(`/tasks`)}>
                      <p className="text-sm font-medium text-white">{task.name}</p>
                      {assignedUsers.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">负责人: {assignedUsers.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-yellow-400 font-semibold">
                        {task.daysUntilDue === 0 ? '今天到期' : `${task.daysUntilDue} 天后到期`}
                      </span>
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
            })}
          </div>
        </div>
      )}

      {/* 延期风险项目 */}
      {risks.atRiskProjects.length > 0 && (
        <div className="glass-effect p-5 rounded-xl border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="h-5 w-5 text-orange-400" />
            <h3 className="font-bold text-white">延期风险项目 ({risks.atRiskProjects.length})</h3>
          </div>
          <div className="space-y-2">
            {risks.atRiskProjects.slice(0, 5).map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="p-3 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{project.projectName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      预计完成: {format(parseISO(project.estimatedCompletion), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-orange-400 font-semibold block">
                      {project.daysUntilCompletion} 天后到期
                    </span>
                    <span className="text-xs text-gray-400">
                      进度: {Math.round(project.progress)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 已过期项目 */}
      {risks.overdueProjects.length > 0 && (
        <div className="glass-effect p-5 rounded-xl border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="font-bold text-white">已过期项目 ({risks.overdueProjects.length})</h3>
          </div>
          <div className="space-y-2">
            {risks.overdueProjects.slice(0, 5).map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="p-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{project.projectName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      预计完成: {format(parseISO(project.estimatedCompletion), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-red-400 font-semibold block">
                      已过期 {project.daysOverdue} 天
                    </span>
                    <span className="text-xs text-gray-400">
                      进度: {Math.round(project.progress)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CompleteTaskModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setCompletingTask(null);
        }}
        task={completingTask}
        onSubmit={handleCompleteTask}
      />
    </motion.div>
  );
};

export default RiskAlerts;
