import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Filter, BookOpen, Tag, X, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lessonLearnedApi } from '@/lib/api';
import { format } from 'date-fns';

const LessonLearned = () => {
    const { toast } = useToast();
    const [lessons, setLessons] = useState([]);
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTagType, setFilterTagType] = useState('all');
    const [filterReuseValue, setFilterReuseValue] = useState('all');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    const tagTypes = [
        { value: 'rework', label: '返工', color: 'bg-red-500/20 text-red-400 border-red-500/50' },
        { value: 'delay', label: '延期', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        { value: 'defect', label: '缺陷回流', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
        { value: 'change', label: '临时变更', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterLessons();
    }, [lessons, searchTerm, filterTagType, filterReuseValue]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await lessonLearnedApi.getAll();
            setLessons(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('加载经验教训失败:', error);
            toast({ title: "加载经验教训失败", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const filterLessons = () => {
        let filtered = [...lessons];

        // 按标签类型过滤
        if (filterTagType !== 'all') {
            filtered = filtered.filter(l => l.tagType === filterTagType);
        }

        // 按复用价值过滤
        if (filterReuseValue === 'yes') {
            filtered = filtered.filter(l => l.hasReuseValue);
        } else if (filterReuseValue === 'no') {
            filtered = filtered.filter(l => !l.hasReuseValue);
        }

        // 按搜索关键词过滤
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(l =>
                l.background?.toLowerCase().includes(term) ||
                l.rootCause?.toLowerCase().includes(term) ||
                l.ifRedo?.toLowerCase().includes(term) ||
                l.relatedProjectName?.toLowerCase().includes(term) ||
                l.relatedTaskName?.toLowerCase().includes(term)
            );
        }

        setFilteredLessons(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('确定要删除这条经验教训吗？')) return;

        try {
            await lessonLearnedApi.delete(id);
            toast({ title: "删除成功" });
            loadData();
        } catch (error) {
            console.error('删除失败:', error);
            toast({ title: "删除失败", variant: "destructive" });
        }
    };

    const getTagInfo = (tagType) => {
        return tagTypes.find(t => t.value === tagType) || tagTypes[0];
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
                <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-indigo-400" />
                    <h2 className="text-2xl font-bold text-white">经验教训库</h2>
                    <span className="text-sm text-gray-400">({filteredLessons.length} 条)</span>
                </div>
                <Button
                    onClick={() => { setEditingLesson(null); setModalOpen(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" /> 新建经验教训
                </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                {/* 搜索和过滤 */}
                <div className="glass-effect rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索经验教训..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <select
                            value={filterTagType}
                            onChange={(e) => setFilterTagType(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="all">所有标签</option>
                            {tagTypes.map(tag => (
                                <option key={tag.value} value={tag.value}>{tag.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterReuseValue}
                            onChange={(e) => setFilterReuseValue(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="all">所有</option>
                            <option value="yes">有复用价值</option>
                            <option value="no">无复用价值</option>
                        </select>
                    </div>
                </div>

                {/* 经验教训列表 */}
                {filteredLessons.length === 0 ? (
                    <div className="glass-effect rounded-xl p-8 text-center">
                        <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">暂无经验教训</p>
                        <Button
                            onClick={() => { setEditingLesson(null); setModalOpen(true); }}
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="mr-2 h-4 w-4" /> 创建第一条经验教训
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredLessons.map((lesson) => {
                            const tagInfo = getTagInfo(lesson.tagType);
                            return (
                                <motion.div
                                    key={lesson.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-effect rounded-xl p-6 hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${tagInfo.color}`}>
                                                {tagInfo.label}
                                            </span>
                                            {lesson.hasReuseValue && (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" /> 有复用价值
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setEditingLesson(lesson); setModalOpen(true); }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(lesson.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">背景（发生了什么）</p>
                                            <p className="text-white">{lesson.background}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">根因（不是人，是系统）</p>
                                            <p className="text-white">{lesson.rootCause}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">如果重来一次会怎么做</p>
                                            <p className="text-white">{lesson.ifRedo}</p>
                                        </div>
                                    </div>

                                    {(lesson.relatedProjectName || lesson.relatedTaskName) && (
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <p className="text-xs text-gray-500">
                                                关联：{lesson.relatedProjectName || ''} {lesson.relatedTaskName ? `- ${lesson.relatedTaskName}` : ''}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                                        <span>创建时间: {format(new Date(lesson.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                                        {lesson.createdBy && <span>创建人: {lesson.createdBy}</span>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <LessonLearnedModal
                    isOpen={isModalOpen}
                    onClose={() => { setModalOpen(false); setEditingLesson(null); }}
                    onSubmit={async (data) => {
                        try {
                            if (editingLesson) {
                                await lessonLearnedApi.update(editingLesson.id, data);
                                toast({ title: "更新成功" });
                            } else {
                                await lessonLearnedApi.create(data);
                                toast({ title: "创建成功" });
                            }
                            await loadData();
                            setModalOpen(false);
                            setEditingLesson(null);
                        } catch (error) {
                            console.error('保存失败:', error);
                            toast({ title: "保存失败", variant: "destructive" });
                        }
                    }}
                    editingLesson={editingLesson}
                />
            )}
        </div>
    );
};

const LessonLearnedModal = ({ isOpen, onClose, onSubmit, editingLesson }) => {
    const [formData, setFormData] = useState({
        tagType: 'rework',
        background: '',
        rootCause: '',
        ifRedo: '',
        hasReuseValue: false,
        projectId: null,
        taskId: null,
        timelineEventId: null,
        relatedProjectName: '',
        relatedTaskName: '',
        createdBy: ''
    });

    useEffect(() => {
        if (editingLesson) {
            setFormData({
                tagType: editingLesson.tagType || 'rework',
                background: editingLesson.background || '',
                rootCause: editingLesson.rootCause || '',
                ifRedo: editingLesson.ifRedo || '',
                hasReuseValue: editingLesson.hasReuseValue || false,
                projectId: editingLesson.projectId || null,
                taskId: editingLesson.taskId || null,
                timelineEventId: editingLesson.timelineEventId || null,
                relatedProjectName: editingLesson.relatedProjectName || '',
                relatedTaskName: editingLesson.relatedTaskName || '',
                createdBy: editingLesson.createdBy || ''
            });
        } else {
            setFormData({
                tagType: 'rework',
                background: '',
                rootCause: '',
                ifRedo: '',
                hasReuseValue: false,
                projectId: null,
                taskId: null,
                timelineEventId: null,
                relatedProjectName: '',
                relatedTaskName: '',
                createdBy: ''
            });
        }
    }, [editingLesson, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.background || !formData.rootCause || !formData.ifRedo) {
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    const tagTypes = [
        { value: 'rework', label: '返工' },
        { value: 'delay', label: '延期' },
        { value: 'defect', label: '缺陷回流' },
        { value: 'change', label: '临时变更' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {editingLesson ? '编辑经验教训' : '新建经验教训'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
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

export default LessonLearned;
