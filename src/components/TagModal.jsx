import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { lessonLearnedApi } from '@/lib/api';

const TagModal = ({ isOpen, onClose, onSubmit, entityType, entityId, entityName, projectId, projectName, currentTag, currentLessonId }) => {
    const { toast } = useToast();
    const [tagType, setTagType] = useState(currentTag || '');
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [lessonFormData, setLessonFormData] = useState({
        background: '',
        rootCause: '',
        ifRedo: '',
        hasReuseValue: false
    });

    useEffect(() => {
        if (isOpen) {
            setTagType(currentTag || '');
            setShowLessonForm(false);
            setLessonFormData({
                background: '',
                rootCause: '',
                ifRedo: '',
                hasReuseValue: false
            });
        }
    }, [isOpen, currentTag]);

    const tagTypes = [
        { value: 'rework', label: '返工', color: 'bg-red-500/20 text-red-400 border-red-500/50' },
        { value: 'delay', label: '延期', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        { value: 'defect', label: '缺陷回流', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
        { value: 'change', label: '临时变更', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    ];

    const handleSaveTag = async () => {
        if (!tagType) {
            toast({ title: "请选择标签类型", variant: "destructive" });
            return;
        }

        // 如果只是添加标签，不创建经验教训
        if (!showLessonForm) {
            onSubmit(tagType, null);
            onClose();
            return;
        }

        // 如果创建经验教训，先验证表单
        if (!lessonFormData.background || !lessonFormData.rootCause || !lessonFormData.ifRedo) {
            toast({ title: "请填写所有经验教训字段", variant: "destructive" });
            return;
        }

        try {
            // 创建经验教训
            const lessonData = {
                tagType: tagType,
                background: lessonFormData.background,
                rootCause: lessonFormData.rootCause,
                ifRedo: lessonFormData.ifRedo,
                hasReuseValue: lessonFormData.hasReuseValue,
                projectId: projectId || null,
                taskId: entityType === 'task' ? entityId : null,
                timelineEventId: entityType === 'timeline' ? entityId : null,
                relatedProjectName: projectName || null,
                relatedTaskName: entityType === 'task' ? entityName : null,
            };

            const result = await lessonLearnedApi.create(lessonData);
            const lessonId = result.id || result;

            // 提交标签和经验教训ID
            onSubmit(tagType, lessonId);
            toast({ title: "标签和经验教训保存成功" });
            onClose();
        } catch (error) {
            console.error('保存经验教训失败:', error);
            toast({ title: "保存经验教训失败", variant: "destructive" });
        }
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
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        添加标签
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 标签选择 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">选择标签类型</label>
                        <div className="grid grid-cols-2 gap-3">
                            {tagTypes.map(tag => (
                                <button
                                    key={tag.value}
                                    type="button"
                                    onClick={() => setTagType(tag.value)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        tagType === tag.value
                                            ? `${tag.color} border-current`
                                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="font-semibold">{tag.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 是否创建经验教训 */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="createLesson"
                            checked={showLessonForm}
                            onChange={(e) => setShowLessonForm(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="createLesson" className="text-sm text-gray-300 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            创建经验教训（5分钟内完成）
                        </label>
                    </div>

                    {/* 经验教训表单 */}
                    {showLessonForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-4 border-t border-gray-700"
                        >
                            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-4">
                                <p className="text-sm text-indigo-300">
                                    💡 使用固定模板快速沉淀经验教训，帮助团队持续改进
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    背景（发生了什么）*
                                </label>
                                <textarea
                                    value={lessonFormData.background}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, background: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-y"
                                    placeholder="描述发生了什么..."
                                    required={showLessonForm}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    根因（不是人，是系统）*
                                </label>
                                <textarea
                                    value={lessonFormData.rootCause}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, rootCause: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-y"
                                    placeholder="分析根本原因（系统性问题，而非个人问题）..."
                                    required={showLessonForm}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    如果重来一次会怎么做*
                                </label>
                                <textarea
                                    value={lessonFormData.ifRedo}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, ifRedo: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-y"
                                    placeholder="描述如果重来一次，会采取什么不同的做法..."
                                    required={showLessonForm}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hasReuseValue"
                                    checked={lessonFormData.hasReuseValue}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, hasReuseValue: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="hasReuseValue" className="text-sm text-gray-300">
                                    是否具有复用价值
                                </label>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-700">
                    <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
                    <Button onClick={handleSaveTag} className="bg-indigo-600 hover:bg-indigo-700">
                        保存
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default TagModal;
