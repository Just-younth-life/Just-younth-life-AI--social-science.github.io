/* ============================================
   错题复盘 - 列表与详情渲染
   ============================================ */

const ErrorRenderer = {
    /* === 渲染整个错题复盘面板 === */
    render() {
        const panel = document.getElementById('errorReviewPanel');
        if (!panel) return;

        const stats = ErrorReview.getStats();

        if (stats.total === 0) {
            panel.innerHTML = this.renderEmpty();
            return;
        }

        let html = '';

        // 数据概览卡片
        html += this.renderStatsCards(stats);

        // 图表区
        html += `<div class="error-charts-section">`;
        html += ErrorCharts.renderTrendChart(stats.trend);
        html += ErrorCharts.renderSubjectPie(stats.bySubject);
        html += ErrorCharts.renderDifficultyHeatmap(stats.byDifficulty, stats.byKnowledge);
        html += `</div>`;

        // 操作按钮
        html += `<div class="error-actions">
            <button class="error-btn export-btn" onclick="ErrorReview.exportJSON()">📥 导出错题</button>
            <button class="error-btn clear-btn" onclick="ErrorRenderer.confirmClear()">🗑️ 清空记录</button>
        </div>`;

        // 错题列表
        html += `<div class="error-list-title">📝 错题列表（${stats.total} 题）</div>`;
        html += `<div class="error-list">`;
        ErrorReview.getAll().forEach(err => {
            html += this.renderErrorItem(err);
        });
        html += `</div>`;

        panel.innerHTML = html;
    },

    /* === 空状态 === */
    renderEmpty() {
        return `<div class="error-empty">
            <div style="font-size: 48px; margin-bottom: 12px;">📖</div>
            <p style="color: var(--pb-text-light); font-size: 15px; margin-bottom: 6px;">还没有错题记录</p>
            <p style="color: var(--pb-text-muted); font-size: 13px;">完成知识小测验后，答错的题目会自动收集到这里</p>
        </div>`;
    },

    /* === 数据概览卡片 === */
    renderStatsCards(stats) {
        return `<div class="error-stats-grid">
            <div class="error-stat-card">
                <div class="error-stat-num" style="color: var(--pb-danger);">${stats.total}</div>
                <div class="error-stat-label">总错题数</div>
            </div>
            <div class="error-stat-card">
                <div class="error-stat-num" style="color: var(--pb-accent);">${stats.errorRate}%</div>
                <div class="error-stat-label">错误率</div>
            </div>
            <div class="error-stat-card">
                <div class="error-stat-num" style="color: var(--pb-success);">${stats.reviewed}</div>
                <div class="error-stat-label">已掌握</div>
            </div>
            <div class="error-stat-card">
                <div class="error-stat-num" style="color: var(--pb-secondary);">${stats.unreviewed}</div>
                <div class="error-stat-label">待复习</div>
            </div>
        </div>`;
    },

    /* === 单条错题 === */
    renderErrorItem(err) {
        const date = new Date(err.timestamp);
        const dateStr = `${date.getMonth()+1}月${date.getDate()}日`;
        const reviewedClass = err.reviewed ? 'reviewed' : '';

        return `<div class="error-item ${reviewedClass}" onclick="ErrorRenderer.toggleDetail('${err.id}')">
            <div class="error-item-header">
                <span class="error-item-difficulty difficulty-${err.difficulty}">${this.difficultyLabel(err.difficulty)}</span>
                <span class="error-item-title">${err.taskTitle}</span>
                <span class="error-item-date">${dateStr}</span>
            </div>
            <div class="error-item-question">${err.question}</div>
            <div class="error-item-detail" id="detail_${err.id}" style="display:none;">
                <div class="error-answer-row wrong">
                    <span class="answer-label">你的答案：</span>
                    <span class="answer-text">${err.userAnswer}</span>
                </div>
                <div class="error-answer-row correct">
                    <span class="answer-label">正确答案：</span>
                    <span class="answer-text">${err.correctAnswer}</span>
                </div>
                ${err.knowledge && err.knowledge.length > 0 ? `
                    <div class="error-knowledge">
                        ${err.knowledge.map(k => `<div class="error-knowledge-item">
                            <strong>${k.title || ''}</strong>
                            <span>${k.content || ''}</span>
                        </div>`).join('')}
                    </div>
                ` : ''}
                ${err.sourceUrl ? `<a href="${err.sourceUrl}" target="_blank" rel="noopener" class="error-source-link">📎 ${err.subject} →</a>` : ''}
                <div class="error-item-actions">
                    <button class="error-btn-small review-btn" onclick="event.stopPropagation();ErrorRenderer.markReviewed('${err.id}')">
                        ${err.reviewed ? '✅ 已掌握' : '标记已掌握'}
                    </button>
                    <button class="error-btn-small delete-btn" onclick="event.stopPropagation();ErrorRenderer.removeError('${err.id}')">🗑️ 删除</button>
                </div>
            </div>
        </div>`;
    },

    /* === 展开/收起详情 === */
    toggleDetail(id) {
        const el = document.getElementById('detail_' + id);
        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    },

    /* === 标记已掌握 === */
    markReviewed(id) {
        ErrorReview.markReviewed(id);
        this.render();
    },

    /* === 删除错题 === */
    removeError(id) {
        ErrorReview.remove(id);
        this.render();
    },

    /* === 确认清空 === */
    confirmClear() {
        if (confirm('确定要清空所有错题记录吗？此操作不可恢复。')) {
            ErrorReview.clearAll();
            this.render();
        }
    },

    /* === 难度标签 === */
    difficultyLabel(d) {
        const map = { easy: '轻松', normal: '普通', advanced: '进阶' };
        return map[d] || '未知';
    }
};
