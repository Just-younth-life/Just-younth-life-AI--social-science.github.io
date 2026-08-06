/* ============================================
   错题复盘 - 数据存储与聚合
   挂钩 verification.js 的测验答错分支
   ============================================ */

const ErrorReview = {
    errors: [],
    totalErrors: 0,
    totalAttempts: 0,

    /* === 初始化 === */
    init() {
        this.load();
    },

    /* === 持久化 === */
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('qizhi_errors') || '{}');
            this.errors = data.errors || [];
            this.totalErrors = data.totalErrors || 0;
            this.totalAttempts = data.totalAttempts || 0;
        } catch(e) {
            this.errors = [];
            this.totalErrors = 0;
            this.totalAttempts = 0;
        }
    },

    save() {
        localStorage.setItem('qizhi_errors', JSON.stringify({
            errors: this.errors,
            totalErrors: this.totalErrors,
            totalAttempts: this.totalAttempts
        }));
    },

    /* === 记录错题 === */
    record(errorData) {
        const entry = {
            id: 'err_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            taskId: errorData.taskId || '',
            taskTitle: errorData.taskTitle || '',
            audience: errorData.audience || 'general',
            difficulty: errorData.difficulty || 'easy',
            subject: errorData.subject || '',
            sourceUrl: errorData.sourceUrl || '',
            knowledgePoint: errorData.knowledgePoint || '',
            question: errorData.question || '',
            userAnswer: errorData.userAnswer || '',
            correctAnswer: errorData.correctAnswer || '',
            knowledge: errorData.knowledge || [],
            timestamp: Date.now(),
            reviewed: false,
            reviewCount: 0
        };

        this.errors.unshift(entry);
        if (this.errors.length > 200) this.errors = this.errors.slice(0, 200);
        this.totalErrors++;
        this.totalAttempts++;
        this.save();
        return entry;
    },

    /* === 记录答对（用于错误率计算）=== */
    recordCorrect() {
        this.totalAttempts++;
        this.save();
    },

    /* === 查询 === */
    getAll() {
        return this.errors;
    },

    getById(id) {
        return this.errors.find(e => e.id === id);
    },

    getStats() {
        const bySubject = {};
        const byKnowledge = {};
        const byDifficulty = { easy: 0, normal: 0, advanced: 0 };
        const last30Days = {};

        this.errors.forEach(err => {
            // 按学科
            const subj = err.subject || '未知来源';
            if (!bySubject[subj]) bySubject[subj] = { count: 0, errors: [] };
            bySubject[subj].count++;
            bySubject[subj].errors.push(err.id);

            // 按知识点
            const kp = err.knowledgePoint || '未分类';
            if (!byKnowledge[kp]) byKnowledge[kp] = { count: 0, errors: [] };
            byKnowledge[kp].count++;
            byKnowledge[kp].errors.push(err.id);

            // 按难度
            if (byDifficulty[err.difficulty] !== undefined) {
                byDifficulty[err.difficulty]++;
            }

            // 近30天趋势
            const date = new Date(err.timestamp);
            const dateKey = date.toISOString().slice(0, 10);
            last30Days[dateKey] = (last30Days[dateKey] || 0) + 1;
        });

        const errorRate = this.totalAttempts > 0
            ? Math.round(this.totalErrors / this.totalAttempts * 100)
            : 0;

        return {
            total: this.errors.length,
            errorRate: errorRate,
            totalAttempts: this.totalAttempts,
            bySubject: bySubject,
            byKnowledge: byKnowledge,
            byDifficulty: byDifficulty,
            trend: last30Days,
            reviewed: this.errors.filter(e => e.reviewed).length,
            unreviewed: this.errors.filter(e => !e.reviewed).length
        };
    },

    /* === 标记已掌握 === */
    markReviewed(id) {
        const err = this.getById(id);
        if (err) {
            err.reviewed = true;
            err.reviewCount++;
            this.save();
        }
    },

    /* === 删除错题 === */
    remove(id) {
        this.errors = this.errors.filter(e => e.id !== id);
        this.totalErrors = Math.max(0, this.totalErrors - 1);
        this.save();
    },

    /* === 清空 === */
    clearAll() {
        this.errors = [];
        this.totalErrors = 0;
        this.totalAttempts = 0;
        this.save();
    },

    /* === 导出 JSON === */
    exportJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            stats: this.getStats(),
            errors: this.errors
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qizhi_errors_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
