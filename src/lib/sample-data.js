import { format, addDays, isWeekend, addMonths } from 'date-fns';

export const sampleUsers = [
    { id: 'eng1', name: '张三', role: '结构工程师', email: 'zhang.san@example.com' },
    { id: 'eng2', name: '李四', role: '软件工程师', email: 'li.si@example.com' },
    { id: 'eng3', name: '王五', role: '系统工程师', email: 'wang.wu@example.com' },
    { id: 'eng4', name: '赵六', role: '电子工程师', email: 'zhao.liu@example.com' },
    { id: 'eng5', name: '钱七', role: '方案工程师', email: 'qian.qi@example.com' },
    { id: 'eng6', name: '孙八', role: '线材包装', email: 'sun.ba@example.com' },
    { id: 'eng7', name: '周九', role: '结构工程师', email: 'zhou.jiu@example.com' },
    { id: 'eng8', name: '吴十', role: '软件工程师', email: 'wu.shi@example.com' },
    { id: 'eng9', name: '郑十一', role: '系统工程师', email: 'zheng.shiyi@example.com' },
    { id: 'eng10', name: '冯十二', role: '电子工程师', email: 'feng.shier@example.com' },
    { id: 'eng11', name: '陈十三', role: '方案工程师', email: 'chen.shisan@example.com' },
    { id: 'eng12', name: '褚十四', role: '线材包装', email: 'chu.shisi@example.com' },
    { id: 'eng13', name: '卫十五', role: '其他', email: 'wei.shiwu@example.com' },
    { id: 'eng14', name: '蒋十六', role: '其他', email: 'jiang.shiliu@example.com' },
    { id: 'eng15', name: '沈十七', role: '总工程师', email: 'shen.shiqi@example.com' },
    { id: 'eng16', name: '韩十八', role: '结构工程师', email: 'han.shiba@example.com' },
    { id: 'eng17', name: '杨十九', role: '软件工程师', email: 'yang.shijiu@example.com' },
    { id: 'eng18', name: '朱二十', role: '系统工程师', email: 'zhu.ershi@example.com' },
    { id: 'eng19', name: '秦二十一', role: '电子工程师', email: 'qin.ershiyi@example.com' },
    { id: 'eng20', name: '尤二十二', role: '方案工程师', email: 'you.ershier@example.com' }
];

export const sampleProjects = [
    {
      id: 'proj1',
      orderNumber: 'RD-2024-001',
      projectName: '高精度传感器模组',
      salesName: '张明',
      deviceQuantity: 500,
      size: '120x80x25mm',
      moduleModel: 'SM-2024-A',
      currentStageId: 'structural_design',
      priority: 'high',
      estimatedCompletion: '2025-10-15',
      timeline: [
        { stageId: 'requirements', date: '2025-08-01', events: [{ id: 'evt1', date: '2025-08-02', description: '客户提出初步需求' }] },
        { stageId: 'structural_design', date: '2025-08-15', events: [] },
      ]
    },
    {
      id: 'proj2',
      orderNumber: 'RD-2024-002',
      projectName: '低功耗无线模块',
      salesName: '李华',
      deviceQuantity: 1000,
      size: '50x30x8mm',
      moduleModel: 'WM-2024-B',
      currentStageId: 'software_design',
      priority: 'medium',
      estimatedCompletion: '2025-11-20',
      timeline: [
        { stageId: 'requirements', date: '2025-08-05', events: [] },
        { stageId: 'structural_design', date: '2025-08-20', events: [] },
        { stageId: 'electronic_design', date: '2025-09-05', events: [{ id: 'evt2', date: '2025-09-10', description: '更换主控芯片' }] },
        { stageId: 'system_design', date: '2025-09-20', events: [] },
        { stageId: 'software_design', date: '2025-10-01', events: [] },
      ]
    },
    {
        id: 'proj3',
        orderNumber: 'RD-2024-003',
        projectName: '智能家居中控',
        salesName: '王丽',
        deviceQuantity: 200,
        moduleModel: 'HC-2024-C',
        currentStageId: 'production',
        priority: 'low',
        estimatedCompletion: '2025-09-30',
        timeline: []
    },
    {
        id: 'proj4',
        orderNumber: 'RD-2024-004',
        projectName: '工业物联网网关',
        salesName: '赵刚',
        deviceQuantity: 300,
        moduleModel: 'IG-2024-D',
        currentStageId: 'requirements',
        priority: 'high',
        estimatedCompletion: '2025-12-01',
        timeline: []
    },
    {
        id: 'proj5',
        orderNumber: 'RD-2024-005',
        projectName: '车载娱乐系统',
        salesName: '孙静',
        deviceQuantity: 800,
        moduleModel: 'CE-2024-E',
        currentStageId: 'shipping',
        priority: 'medium',
        estimatedCompletion: '2025-09-01',
        timeline: []
    },
    {
        id: 'proj6',
        orderNumber: 'RD-2024-006',
        projectName: '智能穿戴设备',
        salesName: '刘强',
        deviceQuantity: 1500,
        moduleModel: 'WE-2024-F',
        currentStageId: 'electronic_design',
        priority: 'high',
        estimatedCompletion: '2025-11-01',
        timeline: []
    },
    {
        id: 'proj7',
        orderNumber: 'RD-2024-007',
        projectName: '医疗健康监测仪',
        salesName: '陈芳',
        deviceQuantity: 300,
        moduleModel: 'HM-2024-G',
        currentStageId: 'system_design',
        priority: 'high',
        estimatedCompletion: '2025-10-25',
        timeline: []
    },
    {
        id: 'proj8',
        orderNumber: 'RD-2024-008',
        projectName: '智能农业传感器',
        salesName: '周波',
        deviceQuantity: 700,
        moduleModel: 'AS-2024-H',
        currentStageId: 'software_design',
        priority: 'medium',
        estimatedCompletion: '2025-12-10',
        timeline: []
    },
    {
        id: 'proj9',
        orderNumber: 'RD-2024-009',
        projectName: '环境监测系统',
        salesName: '吴迪',
        deviceQuantity: 400,
        moduleModel: 'EM-2024-I',
        currentStageId: 'testing',
        priority: 'low',
        estimatedCompletion: '2025-09-15',
        timeline: []
    },
    {
        id: 'proj10',
        orderNumber: 'RD-2024-010',
        projectName: '智能照明系统',
        salesName: '郑凯',
        deviceQuantity: 900,
        moduleModel: 'LS-2024-J',
        currentStageId: 'production',
        priority: 'medium',
        estimatedCompletion: '2025-09-28',
        timeline: []
    },
    {
        id: 'proj11',
        orderNumber: 'RD-2024-011',
        projectName: 'AR眼镜原型机',
        salesName: '林涛',
        deviceQuantity: 10,
        moduleModel: 'AR-2024-K',
        currentStageId: 'requirements',
        priority: 'high',
        estimatedCompletion: '2026-01-30',
        timeline: []
    },
    {
        id: 'proj12',
        orderNumber: 'RD-2024-012',
        projectName: 'AI语音助手',
        salesName: '高山',
        deviceQuantity: 5000,
        moduleModel: 'VA-2024-L',
        currentStageId: 'software_design',
        priority: 'high',
        estimatedCompletion: '2025-11-15',
        timeline: []
    },
    {
        id: 'proj13',
        orderNumber: 'RD-2024-013',
        projectName: '高速数据采集卡',
        salesName: '何莉',
        deviceQuantity: 150,
        moduleModel: 'DC-2024-M',
        currentStageId: 'electronic_design',
        priority: 'medium',
        estimatedCompletion: '2025-10-05',
        timeline: []
    },
    {
        id: 'proj14',
        orderNumber: 'RD-2024-014',
        projectName: '智能工厂机器人',
        salesName: '冯源',
        deviceQuantity: 50,
        moduleModel: 'FR-2024-N',
        currentStageId: 'system_design',
        priority: 'high',
        estimatedCompletion: '2026-03-01',
        timeline: []
    },
    {
        id: 'proj15',
        orderNumber: 'RD-2024-015',
        projectName: '智慧城市管理平台',
        salesName: '蔡文',
        deviceQuantity: 1,
        moduleModel: 'SC-2024-O',
        currentStageId: 'testing',
        priority: 'low',
        estimatedCompletion: '2025-09-20',
        timeline: []
    },
    {
        id: 'proj16',
        orderNumber: 'RD-2024-016',
        projectName: '微型无人机',
        salesName: '杜莎',
        deviceQuantity: 2000,
        moduleModel: 'MD-2024-P',
        currentStageId: 'structural_design',
        priority: 'medium',
        estimatedCompletion: '2025-11-25',
        timeline: []
    },
    {
        id: 'proj17',
        orderNumber: 'RD-2024-017',
        projectName: '量子计算芯片',
        salesName: '包正',
        deviceQuantity: 5,
        moduleModel: 'QC-2024-Q',
        currentStageId: 'requirements',
        priority: 'high',
        estimatedCompletion: '2027-01-01',
        timeline: []
    },
    {
        id: 'proj18',
        orderNumber: 'RD-2024-018',
        projectName: '新能源汽车充电桩',
        salesName: '华丽',
        deviceQuantity: 100,
        moduleModel: 'EV-2024-R',
        currentStageId: 'production',
        priority: 'medium',
        estimatedCompletion: '2025-10-10',
        timeline: []
    },
    {
        id: 'proj19',
        orderNumber: 'RD-2024-019',
        projectName: '智能可穿戴医疗设备',
        salesName: '钱枫',
        deviceQuantity: 750,
        moduleModel: 'WMD-2024-S',
        currentStageId: 'debugging',
        priority: 'high',
        estimatedCompletion: '2025-12-05',
        timeline: []
    },
    {
        id: 'proj20',
        orderNumber: 'RD-2024-020',
        projectName: '虚拟现实内容平台',
        salesName: '陈伟',
        deviceQuantity: 1,
        moduleModel: 'VR-2024-T',
        currentStageId: 'shipping',
        priority: 'low',
        estimatedCompletion: '2025-09-01',
        timeline: []
    }
];

const generateTasks = () => {
    const tasks = [];
    const taskNames = [
        "需求分析", "原型设计", "UI/UX 设计", "数据库设计", "API 开发", "前端开发", "后端开发", "集成测试",
        "性能优化", "安全审计", "文档编写", "用户验收测试", "部署上线", "结构设计", "电路设计", "固件编程",
        "样品制作", "供应链协调", "生产测试", "包装设计", "市场调研", "竞品分析", "用户访谈", "技术选型",
        "风险评估", "成本核算", "专利申请", "合规性审查", "用户手册编写", "培训材料准备", "系统集成", "质量控制",
        "故障排除", "用户培训", "竞品测试", "模块化设计", "硬件调试", "固件更新", "性能基准测试", "用户反馈收集"
    ];

    const projects = sampleProjects;
    const users = sampleUsers;

    const today = new Date();
    const startMonth = addMonths(today, -3);

    for (let i = 0; i < 1500; i++) { // Increased task count to 1500
        const project = projects[Math.floor(Math.random() * projects.length)];
        const userCount = Math.floor(Math.random() * 3) + 1;
        const assignedTo = [];
        for(let j = 0; j < userCount; j++) {
            const user = users[Math.floor(Math.random() * users.length)];
            if (!assignedTo.includes(user.id)) {
                assignedTo.push(user.id);
            }
        }
        
        const randomDayOffset = Math.floor(Math.random() * 180); // Spread tasks over ~6 months
        let startDate = addDays(startMonth, randomDayOffset);
        
        while (isWeekend(startDate)) {
            startDate = addDays(startDate, 1);
        }

        const duration = Math.floor(Math.random() * 9) + 1; // Task duration 1-9 days
        let endDate = startDate;

        let workDays = 0;
        let currentDate = startDate;
        while (workDays < duration) {
            if (!isWeekend(currentDate)) {
                workDays++;
            }
            if (workDays < duration) {
                currentDate = addDays(currentDate, 1);
            }
        }
        endDate = currentDate;

        tasks.push({
            id: `task${i + 1}`,
            name: `${project.projectName} - ${taskNames[Math.floor(Math.random() * taskNames.length)]}`,
            projectId: project.id,
            assignedTo: assignedTo,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
        });
    }

    return tasks;
};

export const sampleTasks = generateTasks();