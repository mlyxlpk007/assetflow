import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ProjectHealth = ({ projects }) => {
  const navigate = useNavigate();

  const calculateHealthScore = (project) => {
    if (!project.estimatedCompletion) return { score: 0, status: 'unknown', label: '未知' };
    
    const today = new Date();
    const completionDate = parseISO(project.estimatedCompletion);
    const daysUntilCompletion = differenceInDays(completionDate, today);
    
    // 判断项目是否过期（截止日期当天不算过期，只有过了23:59:59才算）
    const isOverdue = () => {
      try {
        const deadline = parseISO(project.estimatedCompletion);
        // 将截止日期设置为当天的23:59:59.999
        deadline.setHours(23, 59, 59, 999);
        return today > deadline;
      } catch (e) {
        return false;
      }
    };
    
    // 计算进度
    const stages = ['requirements', 'structural_design', 'electronic_design', 'system_design', 'software_design', 'production', 'debugging', 'shipping'];
    const currentIndex = stages.findIndex(s => s === project.currentStageId);
    const progress = currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;
    
    // 计算健康度分数 (0-100)
    let score = progress;
    
    // 如果接近交期但进度不足，扣分
    if (daysUntilCompletion <= 7) {
      const expectedProgress = ((7 - daysUntilCompletion) / 7) * 100;
      if (progress < expectedProgress) {
        score -= (expectedProgress - progress) * 0.5;
      }
    }
    
    // 如果已过期，大幅扣分
    if (isOverdue()) {
      score -= Math.abs(daysUntilCompletion) * 10;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    let status, label, color;
    if (score >= 80) {
      status = 'healthy';
      label = '健康';
      color = 'text-green-400';
    } else if (score >= 60) {
      status = 'warning';
      label = '注意';
      color = 'text-yellow-400';
    } else if (score >= 40) {
      status = 'risk';
      label = '风险';
      color = 'text-orange-400';
    } else {
      status = 'critical';
      label = '紧急';
      color = 'text-red-400';
    }
    
    return { score: Math.round(score), status, label, color, progress, daysUntilCompletion };
  };

  const projectsWithHealth = projects.map(project => ({
    ...project,
    health: calculateHealthScore(project)
  })).sort((a, b) => a.health.score - b.health.score);

  const criticalProjects = projectsWithHealth.filter(p => p.health.status === 'critical' || p.health.status === 'risk');
  const healthyProjects = projectsWithHealth.filter(p => p.health.status === 'healthy');

  return (
    <div className="space-y-4 mb-6">
      {/* 项目健康度概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-5 rounded-xl"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-indigo-400" />
          项目健康度概览
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{healthyProjects.length}</div>
            <div className="text-sm text-gray-400">健康项目</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {projectsWithHealth.filter(p => p.health.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-400">需注意</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {projectsWithHealth.filter(p => p.health.status === 'risk').length}
            </div>
            <div className="text-sm text-gray-400">有风险</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {projectsWithHealth.filter(p => p.health.status === 'critical').length}
            </div>
            <div className="text-sm text-gray-400">紧急</div>
          </div>
        </div>
      </motion.div>

      {/* 需要关注的项目 */}
      {criticalProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect p-5 rounded-xl border-l-4 border-red-500"
        >
          <h3 className="text-lg font-bold text-white mb-4">需要紧急关注的项目</h3>
          <div className="space-y-3">
            {criticalProjects.slice(0, 5).map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="p-4 bg-red-500/10 rounded-lg hover:bg-red-500/20 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{project.projectName}</h4>
                    <p className="text-xs text-gray-400 mt-1">{project.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${project.health.color}`}>
                      {project.health.score}
                    </div>
                    <div className="text-xs text-gray-400">健康度</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span>进度: {Math.round(project.health.progress)}%</span>
                  {project.health.daysUntilCompletion >= 0 ? (
                    <span>剩余: {project.health.daysUntilCompletion} 天</span>
                  ) : (
                    <span className="text-red-400">已过期: {Math.abs(project.health.daysUntilCompletion)} 天</span>
                  )}
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.health.score >= 80 ? 'bg-green-500' :
                      project.health.score >= 60 ? 'bg-yellow-500' :
                      project.health.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${project.health.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectHealth;
