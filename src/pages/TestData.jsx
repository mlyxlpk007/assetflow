import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const TestData = () => {
    const [testResult, setTestResult] = useState(null);
    const [users, setUsers] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [projects, setProjects] = useState(null);
    const [loading, setLoading] = useState(false);

    const testBridge = async () => {
        setLoading(true);
        try {
            console.log('========== 开始测试桥接 ==========');
            
            // 检查桥接对象
            const bridge = window.chrome?.webview?.hostObjects?.nativeBridge;
            console.log('桥接对象:', bridge);
            
            if (!bridge) {
                setTestResult({ error: '桥接对象不存在' });
                return;
            }
            
            // 测试数据库连接
            console.log('测试数据库连接...');
            const dbTest = await bridge.TestDatabaseConnection();
            console.log('数据库测试结果:', dbTest);
            const dbTestParsed = typeof dbTest === 'string' ? JSON.parse(dbTest) : dbTest;
            setTestResult(dbTestParsed);
            
            // 测试获取用户
            console.log('测试获取用户...');
            const usersRaw = await bridge.GetUsers();
            console.log('GetUsers 原始返回:', usersRaw);
            console.log('GetUsers 类型:', typeof usersRaw);
            const usersParsed = typeof usersRaw === 'string' ? JSON.parse(usersRaw) : usersRaw;
            console.log('GetUsers 解析后:', usersParsed);
            setUsers(usersParsed);
            
            // 测试获取任务
            console.log('测试获取任务...');
            const tasksRaw = await bridge.GetTasks();
            console.log('GetTasks 原始返回:', tasksRaw);
            console.log('GetTasks 类型:', typeof tasksRaw);
            const tasksParsed = typeof tasksRaw === 'string' ? JSON.parse(tasksRaw) : tasksRaw;
            console.log('GetTasks 解析后:', tasksParsed);
            setTasks(tasksParsed);
            
            // 测试获取项目
            console.log('测试获取项目...');
            const projectsRaw = await bridge.GetProjects();
            console.log('GetProjects 原始返回:', projectsRaw);
            console.log('GetProjects 类型:', typeof projectsRaw);
            const projectsParsed = typeof projectsRaw === 'string' ? JSON.parse(projectsRaw) : projectsRaw;
            console.log('GetProjects 解析后:', projectsParsed);
            setProjects(projectsParsed);
            
            console.log('========== 测试完成 ==========');
        } catch (error) {
            console.error('测试失败:', error);
            setTestResult({ error: error.message, stack: error.stack });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 自动运行测试
        testBridge();
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-gray-900 text-gray-300 overflow-y-auto p-6">
            <h1 className="text-2xl font-bold mb-4">数据测试页面</h1>
            
            <Button onClick={testBridge} disabled={loading} className="mb-4">
                {loading ? '测试中...' : '重新测试'}
            </Button>

            <div className="space-y-6">
                {/* 数据库测试结果 */}
                <div className="glass-effect rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-2">数据库连接测试</h2>
                    <pre className="text-xs overflow-auto max-h-40 bg-gray-800 p-2 rounded">
                        {JSON.stringify(testResult, null, 2)}
                    </pre>
                </div>

                {/* 用户数据 */}
                <div className="glass-effect rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-2">
                        用户数据 ({Array.isArray(users) ? users.length : 'N/A'})
                    </h2>
                    {Array.isArray(users) ? (
                        <div>
                            <pre className="text-xs overflow-auto max-h-60 bg-gray-800 p-2 rounded mb-2">
                                {JSON.stringify(users, null, 2)}
                            </pre>
                            <div className="mt-2">
                                {users.map((user, index) => (
                                    <div key={index} className="mb-2 p-2 bg-gray-800 rounded">
                                        <div>ID: {user.id || user.Id || 'N/A'}</div>
                                        <div>Name: {user.name || user.Name || 'N/A'}</div>
                                        <div>Email: {user.email || user.Email || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>用户数据: {users ? JSON.stringify(users) : 'null'}</div>
                    )}
                </div>

                {/* 任务数据 */}
                <div className="glass-effect rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-2">
                        任务数据 ({Array.isArray(tasks) ? tasks.length : 'N/A'})
                    </h2>
                    {Array.isArray(tasks) ? (
                        <div>
                            <pre className="text-xs overflow-auto max-h-60 bg-gray-800 p-2 rounded mb-2">
                                {JSON.stringify(tasks, null, 2)}
                            </pre>
                            <div className="mt-2">
                                {tasks.slice(0, 3).map((task, index) => (
                                    <div key={index} className="mb-2 p-2 bg-gray-800 rounded">
                                        <div>ID: {task.id || task.Id || 'N/A'}</div>
                                        <div>Name: {task.name || task.Name || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>任务数据: {tasks ? JSON.stringify(tasks) : 'null'}</div>
                    )}
                </div>

                {/* 项目数据 */}
                <div className="glass-effect rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-2">
                        项目数据 ({Array.isArray(projects) ? projects.length : 'N/A'})
                    </h2>
                    {Array.isArray(projects) ? (
                        <div>
                            <pre className="text-xs overflow-auto max-h-60 bg-gray-800 p-2 rounded mb-2">
                                {JSON.stringify(projects, null, 2)}
                            </pre>
                            <div className="mt-2">
                                {projects.slice(0, 3).map((project, index) => (
                                    <div key={index} className="mb-2 p-2 bg-gray-800 rounded">
                                        <div>ID: {project.id || project.Id || 'N/A'}</div>
                                        <div>Name: {project.projectName || project.ProjectName || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>项目数据: {projects ? JSON.stringify(projects) : 'null'}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestData;
