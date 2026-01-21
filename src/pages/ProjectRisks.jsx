import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, X, AlertTriangle, Shield, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { risksApi, projectsApi, usersApi, lessonLearnedApi } from '@/lib/api';
import { format } from 'date-fns';

const ProjectRisks = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [project, setProject] = useState(null);
    const [risks, setRisks] = useState([]);
    const [users, setUsers] = useState([]);
    const [isRiskModalOpen, setRiskModalOpen] = useState(false);
    const [isResponseModalOpen, setResponseModalOpen] = useState(false);
    const [isLessonModalOpen, setLessonModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState(null);
    const [selectedRisk, setSelectedRisk] = useState(null);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [riskValue, setRiskValue] = useState(0);
    const [loading, setLoading] = useState(true);

    const riskCategories = [
        '技术风险', '进度风险', '成本风险', '质量风险', '资源风险', '外部风险', '其他'
    ];

    const riskStatuses = [
        { value: 'identified', label: '已识别', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
        { value: 'analyzed', label: '已分析', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
        { value: 'responded', label: '已应对', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        { value: 'monitored', label: '监控中', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
        { value: 'closed', label: '已关闭', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
    ];

    const responseStrategies = [
        { value: 'avoid', label: '规避', icon: Shield, color: 'bg-red-500/20 text-red-400' },
        { value: 'mitigate', label: '减轻', icon: AlertTriangle, color: 'bg-yellow-500/20 text-yellow-400' },
        { value: 'transfer', label: '转移', icon: ArrowLeft, color: 'bg-blue-500/20 text-blue-400' },
        { value: 'accept', label: '接受', icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
    ];

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectData, risksData, usersData, riskValueData] = await Promise.all([
                projectsApi.getById(projectId),
                risksApi.getByProject(projectId),
                usersApi.getAll(),
                risksApi.getRiskValue(projectId).catch(() => ({ riskValue: 0 }))
            ]);
            
            setProject(projectData);
            setRisks(Array.isArray(risksData) ? risksData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setRiskValue(riskValueData.riskValue || 0);
        } catch (error) {
            console.error('加载数据失败:', error);
            toast({ title: "加载数据失败", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRiskSave = async (formData) => {
        try {
            if (editingRisk) {
                await risksApi.update(editingRisk.id, formData);
                toast({ title: "风险更新成功" });
            } else {
                await risksApi.create(formData);
                toast({ title: "风险创建成功" });
            }
            await loadData();
            setRiskModalOpen(false);
            setEditingRisk(null);
        } catch (error) {
            console.error('保存风险失败:', error);
            toast({ title: "保存风险失败", variant: "destructive" });
        }
    };

    const handleRiskDelete = async (id) => {
        if (!confirm('确定要删除这个风险吗？')) return;
        
        try {
            await risksApi.delete(id);
            toast({ title: "风险删除成功" });
            await loadData();
        } catch (error) {
            console.error('删除风险失败:', error);
            toast({ title: "删除风险失败", variant: "destructive" });
        }
    };

    const handleResponseSave = async (formData) => {
        try {
            if (formData.id) {
                await risksApi.updateResponse(formData.id, formData);
                toast({ title: "应对措施更新成功" });
            } else {
                await risksApi.createResponse(selectedRisk.id, formData);
                toast({ title: "应对措施创建成功" });
            }
            await loadData();
            setResponseModalOpen(false);
            setSelectedRisk(null);
        } catch (error) {
            console.error('保存应对措施失败:', error);
            toast({ title: "保存应对措施失败", variant: "destructive" });
        }
    };

    const handleAddToLessonLearned = (risk, response) => {
        setSelectedRisk(risk);
        setSelectedResponse(response);
        setLessonModalOpen(true);
    };

    const handleLessonSave = async (formData) => {
        try {
            await lessonLearnedApi.create({
                ...formData,
                projectId: projectId,
                relatedProjectName: project?.projectName,
            });
            toast({ title: "已加入经验教训库" });
            setLessonModalOpen(false);
            setSelectedRisk(null);
            setSelectedResponse(null);
        } catch (error) {
            console.error('保存经验教训失败:', error);
            toast({ title: "保存经验教训失败", variant: "destructive" });
        }
    };

    const getRiskLevelColor = (riskLevel) => {
        if (riskLevel >= 15) return 'bg-red-500/20 text-red-400 border-red-500/50';
        else if (riskLevel >= 8) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        else return 'bg-green-500/20 text-green-400 border-green-500/50';
    };

    const getRiskLevelText = (riskLevel) => {
        if (riskLevel >= 15) return '高风险';
        else if (riskLevel >= 8) return '中风险';
        else return '低风险';
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-300">
                <p>加载中...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-900 text-gray-300 overflow-hidden">
            <header className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> 返回
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{project?.projectName || '项目风险管理'}</h2>
                        <p className="text-sm text-gray-400">{project?.orderNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${
                            riskValue >= 70 ? 'bg-red-500' :
                            riskValue >= 40 ? 'bg-yellow-500' :
                            riskValue >= 20 ? 'bg-orange-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-lg font-bold">风险值: {riskValue}</span>
                    </div>
                    <Button onClick={() => { setEditingRisk(null); setRiskModalOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> 新建风险
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                {risks.length === 0 ? (
                    <div className="glass-effect rounded-xl p-8 text-center">
                        <AlertTriangle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">暂无风险记录</p>
                        <Button
                            onClick={() => { setEditingRisk(null); setRiskModalOpen(true); }}
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="mr-2 h-4 w-4" /> 创建第一条风险
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {risks.map((risk) => {
                            const statusInfo = riskStatuses.find(s => s.value === risk.status) || riskStatuses[0];
                            return (
                                <motion.div
                                    key={risk.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-effect rounded-xl p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-white">{risk.description}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(risk.riskLevel)}`}>
                                                    {getRiskLevelText(risk.riskLevel)} (等级: {risk.riskLevel})
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-400">类别:</span>
                                                    <span className="ml-2 text-white">{risk.category || '未分类'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">概率:</span>
                                                    <span className="ml-2 text-white">{risk.probability}/5</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">影响:</span>
                                                    <span className="ml-2 text-white">{risk.impact}/5</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">责任人:</span>
                                                    <span className="ml-2 text-white">{risk.owner || '未指定'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setSelectedRisk(risk); setResponseModalOpen(true); }}
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> 应对措施
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setEditingRisk(risk); setRiskModalOpen(true); }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRiskDelete(risk.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>

                                    {risk.rootCause && (
                                        <div className="mb-2">
                                            <span className="text-sm text-gray-400">根本原因:</span>
                                            <p className="text-white mt-1">{risk.rootCause}</p>
                                        </div>
                                    )}

                                    {risk.trigger && (
                                        <div className="mb-2">
                                            <span className="text-sm text-gray-400">触发条件:</span>
                                            <p className="text-white mt-1">{risk.trigger}</p>
                                        </div>
                                    )}

                                    {risk.responses && risk.responses.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <h4 className="text-sm font-semibold text-gray-300 mb-2">应对措施:</h4>
                                            <div className="space-y-2">
                                                {risk.responses.map((response) => {
                                                    const strategyInfo = responseStrategies.find(s => s.value === response.strategy) || responseStrategies[1];
                                                    const StrategyIcon = strategyInfo.icon;
                                                    return (
                                                        <div key={response.id} className="bg-gray-800/50 rounded-lg p-3 flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <StrategyIcon className={`h-4 w-4 ${strategyInfo.color.replace('bg-', 'text-').replace('/20', '')}`} />
                                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${strategyInfo.color}`}>
                                                                        {strategyInfo.label}
                                                                    </span>
                                                                    {response.status === 'completed' && (
                                                                        <span className="text-xs text-green-400">✓ 已完成</span>
                                                                    )}
                                                                    {response.status === 'executing' && (
                                                                        <span className="text-xs text-yellow-400">⏳ 执行中</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-white">{response.actionPlan}</p>
                                                                {response.responsible && (
                                                                    <p className="text-xs text-gray-400 mt-1">负责人: {response.responsible}</p>
                                                                )}
                                                                {response.dueDate && (
                                                                    <p className="text-xs text-gray-400">截止日期: {response.dueDate}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {response.status === 'completed' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleAddToLessonLearned(risk, response)}
                                                                        className="text-indigo-400 hover:text-indigo-300"
                                                                        title="加入经验库"
                                                                    >
                                                                        <BookOpen className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedRisk(risk);
                                                                        setResponseModalOpen(true);
                                                                        // 设置编辑的应对措施
                                                                    }}
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                                        识别日期: {format(new Date(risk.identifiedDate), 'yyyy-MM-dd')}
                                        {risk.expectedOccurrenceDate && ` | 预期发生: ${format(new Date(risk.expectedOccurrenceDate), 'yyyy-MM-dd')}`}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isRiskModalOpen && (
                <RiskModal
                    isOpen={isRiskModalOpen}
                    onClose={() => { setRiskModalOpen(false); setEditingRisk(null); }}
                    onSubmit={handleRiskSave}
                    editingRisk={editingRisk}
                    projectId={projectId}
                    users={users}
                    riskCategories={riskCategories}
                    riskStatuses={riskStatuses}
                />
            )}

            {isResponseModalOpen && selectedRisk && (
                <ResponseModal
                    isOpen={isResponseModalOpen}
                    onClose={() => { setResponseModalOpen(false); setSelectedRisk(null); }}
                    onSubmit={handleResponseSave}
                    risk={selectedRisk}
                    users={users}
                    responseStrategies={responseStrategies}
                />
            )}

            {isLessonModalOpen && selectedRisk && selectedResponse && (
                <RiskToLessonModal
                    isOpen={isLessonModalOpen}
                    onClose={() => { 
                        setLessonModalOpen(false); 
                        setSelectedRisk(null); 
                        setSelectedResponse(null); 
                    }}
                    onSubmit={handleLessonSave}
                    risk={selectedRisk}
                    response={selectedResponse}
                    projectName={project?.projectName}
                />
            )}
        </div>
    );
};

const RiskModal = ({ isOpen, onClose, onSubmit, editingRisk, projectId, users, riskCategories, riskStatuses }) => {
    const [formData, setFormData] = useState({
        projectId: projectId,
        description: '',
        category: '',
        probability: 1,
        impact: 1,
        status: 'identified',
        owner: '',
        rootCause: '',
        trigger: '',
        notes: '',
        identifiedDate: format(new Date(), 'yyyy-MM-dd'),
        expectedOccurrenceDate: ''
    });

    useEffect(() => {
        if (editingRisk) {
            setFormData({
                projectId: editingRisk.projectId,
                description: editingRisk.description || '',
                category: editingRisk.category || '',
                probability: editingRisk.probability || 1,
                impact: editingRisk.impact || 1,
                status: editingRisk.status || 'identified',
                owner: editingRisk.owner || '',
                rootCause: editingRisk.rootCause || '',
                trigger: editingRisk.trigger || '',
                notes: editingRisk.notes || '',
                identifiedDate: editingRisk.identifiedDate ? format(new Date(editingRisk.identifiedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                expectedOccurrenceDate: editingRisk.expectedOccurrenceDate ? format(new Date(editingRisk.expectedOccurrenceDate), 'yyyy-MM-dd') : ''
            });
        } else {
            setFormData({
                projectId: projectId,
                description: '',
                category: '',
                probability: 1,
                impact: 1,
                status: 'identified',
                owner: '',
                rootCause: '',
                trigger: '',
                notes: '',
                identifiedDate: format(new Date(), 'yyyy-MM-dd'),
                expectedOccurrenceDate: ''
            });
        }
    }, [editingRisk, projectId, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.description) {
            return;
        }
        onSubmit(formData);
    };

    const riskLevel = formData.probability * formData.impact;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {editingRisk ? '编辑风险' : '新建风险'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label>风险描述 *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="form-input min-h-[80px] resize-y"
                            placeholder="描述风险的具体情况..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>风险类别</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="form-select"
                            >
                                <option value="">选择类别</option>
                                {riskCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>风险状态</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="form-select"
                            >
                                {riskStatuses.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>概率 (1-5) *</label>
                            <input
                                type="number"
                                name="probability"
                                value={formData.probability}
                                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 1 })}
                                className="form-input"
                                min="1"
                                max="5"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">1=很低, 2=低, 3=中, 4=高, 5=很高</p>
                        </div>
                        <div className="form-group">
                            <label>影响 (1-5) *</label>
                            <input
                                type="number"
                                name="impact"
                                value={formData.impact}
                                onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) || 1 })}
                                className="form-input"
                                min="1"
                                max="5"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">1=很低, 2=低, 3=中, 4=高, 5=很高</p>
                        </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                        <p className="text-sm text-indigo-300">
                            风险等级: <span className="font-bold">{riskLevel}</span> ({formData.probability} × {formData.impact})
                            {riskLevel >= 15 && <span className="ml-2 text-red-400">高风险</span>}
                            {riskLevel >= 8 && riskLevel < 15 && <span className="ml-2 text-yellow-400">中风险</span>}
                            {riskLevel < 8 && <span className="ml-2 text-green-400">低风险</span>}
                        </p>
                    </div>

                    <div className="form-group">
                        <label>责任人</label>
                        <select
                            name="owner"
                            value={formData.owner}
                            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                            className="form-select"
                        >
                            <option value="">选择责任人</option>
                            {users.map(user => (
                                <option key={user.id} value={user.name}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>根本原因</label>
                        <textarea
                            name="rootCause"
                            value={formData.rootCause}
                            onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                            className="form-input min-h-[80px] resize-y"
                            placeholder="分析风险的根本原因..."
                        />
                    </div>

                    <div className="form-group">
                        <label>触发条件</label>
                        <textarea
                            name="trigger"
                            value={formData.trigger}
                            onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                            className="form-input min-h-[80px] resize-y"
                            placeholder="描述风险的触发条件..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>识别日期</label>
                            <input
                                type="date"
                                name="identifiedDate"
                                value={formData.identifiedDate}
                                onChange={(e) => setFormData({ ...formData, identifiedDate: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>预期发生日期</label>
                            <input
                                type="date"
                                name="expectedOccurrenceDate"
                                value={formData.expectedOccurrenceDate}
                                onChange={(e) => setFormData({ ...formData, expectedOccurrenceDate: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>备注</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="form-input min-h-[60px] resize-y"
                            placeholder="其他备注信息..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
                        <Button type="submit">保存</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const ResponseModal = ({ isOpen, onClose, onSubmit, risk, users, responseStrategies }) => {
    const [formData, setFormData] = useState({
        strategy: 'mitigate',
        actionPlan: '',
        responsible: '',
        status: 'planned',
        dueDate: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                strategy: 'mitigate',
                actionPlan: '',
                responsible: '',
                status: 'planned',
                dueDate: '',
                notes: ''
            });
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.actionPlan) {
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">添加应对措施</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-indigo-300">
                            风险: {risk.description}
                        </p>
                    </div>

                    <div className="form-group">
                        <label>应对策略 *</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {responseStrategies.map(strategy => {
                                const StrategyIcon = strategy.icon;
                                return (
                                    <button
                                        key={strategy.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, strategy: strategy.value })}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            formData.strategy === strategy.value
                                                ? `${strategy.color} border-current`
                                                : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                                        }`}
                                    >
                                        <StrategyIcon className="h-5 w-5 mx-auto mb-1" />
                                        <div className="text-sm font-semibold">{strategy.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>行动计划 *</label>
                        <textarea
                            name="actionPlan"
                            value={formData.actionPlan}
                            onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
                            className="form-input min-h-[100px] resize-y"
                            placeholder="详细描述应对措施和行动计划..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>负责人</label>
                            <select
                                name="responsible"
                                value={formData.responsible}
                                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                className="form-select"
                            >
                                <option value="">选择负责人</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.name}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>状态</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="form-select"
                            >
                                <option value="planned">计划中</option>
                                <option value="executing">执行中</option>
                                <option value="completed">已完成</option>
                                <option value="cancelled">已取消</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>截止日期</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>备注</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="form-input min-h-[60px] resize-y"
                            placeholder="其他备注信息..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
                        <Button type="submit">保存</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const RiskToLessonModal = ({ isOpen, onClose, onSubmit, risk, response, projectName }) => {
    const [formData, setFormData] = useState({
        tagType: 'change',
        background: '',
        rootCause: '',
        ifRedo: '',
        hasReuseValue: true
    });

    useEffect(() => {
        if (isOpen && risk && response) {
            // 根据应对策略确定标签类型
            let tagType = 'change';
            if (response.strategy === 'avoid') tagType = 'rework';
            else if (response.strategy === 'mitigate') tagType = 'defect';
            else if (response.strategy === 'transfer') tagType = 'delay';
            else tagType = 'change';

            // 自动填充经验教训内容
            setFormData({
                tagType: tagType,
                background: `项目 "${projectName}" 中识别到风险：${risk.description}。风险等级：${risk.riskLevel}（概率${risk.probability}/5 × 影响${risk.impact}/5）。${risk.rootCause ? `根本原因：${risk.rootCause}。` : ''}${risk.trigger ? `触发条件：${risk.trigger}。` : ''}`,
                rootCause: risk.rootCause || '系统性问题，需要从流程、制度、工具等层面解决',
                ifRedo: `采用"${getStrategyLabel(response.strategy)}"策略：${response.actionPlan}。${response.responsible ? `负责人：${response.responsible}。` : ''}${response.dueDate ? `截止日期：${response.dueDate}。` : ''}`,
                hasReuseValue: true
            });
        }
    }, [isOpen, risk, response, projectName]);

    const getStrategyLabel = (strategy) => {
        const strategies = {
            'avoid': '规避',
            'mitigate': '减轻',
            'transfer': '转移',
            'accept': '接受'
        };
        return strategies[strategy] || strategy;
    };

    const tagTypes = [
        { value: 'rework', label: '返工' },
        { value: 'delay', label: '延期' },
        { value: 'defect', label: '缺陷回流' },
        { value: 'change', label: '临时变更' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.background || !formData.rootCause || !formData.ifRedo) {
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-indigo-400" />
                            加入经验教训库
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            将有效的风险应对措施沉淀为经验教训，便于后续项目复用
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-indigo-300 mb-2">
                        <strong>风险：</strong>{risk.description}
                    </p>
                    <p className="text-sm text-indigo-300">
                        <strong>应对措施：</strong>{response.actionPlan}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label>标签类型</label>
                        <select
                            name="tagType"
                            value={formData.tagType}
                            onChange={(e) => setFormData({ ...formData, tagType: e.target.value })}
                            className="form-select"
                        >
                            {tagTypes.map(tag => (
                                <option key={tag.value} value={tag.value}>{tag.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            已根据应对策略自动选择，可根据实际情况调整
                        </p>
                    </div>

                    <div className="form-group">
                        <label>背景（发生了什么）*</label>
                        <textarea
                            name="background"
                            value={formData.background}
                            onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                            className="form-input min-h-[100px] resize-y"
                            placeholder="描述发生了什么..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            已自动填充风险信息，可补充或修改
                        </p>
                    </div>

                    <div className="form-group">
                        <label>根因（不是人，是系统）*</label>
                        <textarea
                            name="rootCause"
                            value={formData.rootCause}
                            onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                            className="form-input min-h-[100px] resize-y"
                            placeholder="分析根本原因（系统性问题，而非个人问题）..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            已自动填充风险的根本原因，可补充或修改
                        </p>
                    </div>

                    <div className="form-group">
                        <label>如果重来一次会怎么做*</label>
                        <textarea
                            name="ifRedo"
                            value={formData.ifRedo}
                            onChange={(e) => setFormData({ ...formData, ifRedo: e.target.value })}
                            className="form-input min-h-[100px] resize-y"
                            placeholder="描述如果重来一次，会采取什么不同的做法..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            已自动填充应对措施，可补充或修改
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.hasReuseValue}
                                onChange={(e) => setFormData({ ...formData, hasReuseValue: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span>是否具有复用价值</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                            有效的风险应对措施通常具有复用价值，默认已勾选
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                        <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            <BookOpen className="mr-2 h-4 w-4" /> 加入经验库
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ProjectRisks;
