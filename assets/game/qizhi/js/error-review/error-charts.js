/* ============================================
   错题复盘 - 纯 SVG 图表（绘本风格）
   折线图 / 饼图 / 热力图
   ============================================ */

const ErrorCharts = {
    /* === 折线图：近30天错题趋势 === */
    renderTrendChart(trend) {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            days.push({
                date: key,
                label: `${d.getMonth()+1}/${d.getDate()}`,
                count: trend[key] || 0
            });
        }

        const maxCount = Math.max(1, ...days.map(d => d.count));
        const chartW = 300;
        const chartH = 100;
        const padding = 20;
        const plotW = chartW - padding * 2;
        const plotH = chartH - padding * 2;
        const stepX = plotW / (days.length - 1);

        // 折线路径
        let pathD = '';
        let areaD = '';
        days.forEach((d, i) => {
            const x = padding + i * stepX;
            const y = padding + plotH - (d.count / maxCount) * plotH;
            if (i === 0) {
                pathD += `M${x},${y}`;
                areaD += `M${x},${padding + plotH} L${x},${y}`;
            } else {
                pathD += ` L${x},${y}`;
                areaD += ` L${x},${y}`;
            }
        });
        areaD += ` L${padding + plotW},${padding + plotH} Z`;

        // 数据点
        const points = days.map((d, i) => {
            const x = padding + i * stepX;
            const y = padding + plotH - (d.count / maxCount) * plotH;
            return d.count > 0
                ? `<circle cx="${x}" cy="${y}" r="3" fill="#FFD54F" stroke="#4E342E" stroke-width="2"/>`
                : '';
        }).join('');

        // X轴标签（每5天一个）
        const labels = days.filter((_, i) => i % 5 === 0).map(d => {
            const i = days.indexOf(d);
            const x = padding + i * stepX;
            return `<text x="${x}" y="${chartH - 2}" text-anchor="middle" font-size="8" fill="#8D6E63">${d.label}</text>`;
        }).join('');

        return `<div class="chart-container">
            <div class="chart-title">📈 近30天错题趋势</div>
            <svg viewBox="0 0 ${chartW} ${chartH}" class="error-chart-svg" preserveAspectRatio="xMidYMid meet">
                <path d="${areaD}" fill="rgba(229, 115, 115, 0.15)"/>
                <path d="${pathD}" fill="none" stroke="#E57373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                ${points}
                ${labels}
            </svg>
        </div>`;
    },

    /* === 饼图：按学科分布 === */
    renderSubjectPie(bySubject) {
        const entries = Object.entries(bySubject).map(([name, data]) => ({
            name, count: data.count
        })).sort((a, b) => b.count - a.count);

        if (entries.length === 0) return '';

        const total = entries.reduce((s, e) => s + e.count, 0);
        const colors = ['#FF8A65', '#4FC3F7', '#FFD54F', '#81C784', '#BA68C8', '#E57373', '#A1887F'];
        const cx = 60, cy = 60, r = 45;

        let currentAngle = -Math.PI / 2;
        let paths = '';
        let legend = '';

        entries.forEach((e, i) => {
            const angle = (e.count / total) * Math.PI * 2;
            const x1 = cx + Math.cos(currentAngle) * r;
            const y1 = cy + Math.sin(currentAngle) * r;
            const x2 = cx + Math.cos(currentAngle + angle) * r;
            const y2 = cy + Math.sin(currentAngle + angle) * r;
            const largeArc = angle > Math.PI ? 1 : 0;
            const color = colors[i % colors.length];

            paths += `<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${color}" stroke="#4E342E" stroke-width="2" stroke-linejoin="round"/>`;

            // 图例
            const pct = Math.round(e.count / total * 100);
            legend += `<div class="pie-legend-item">
                <span class="pie-legend-color" style="background:${color}"></span>
                <span class="pie-legend-name">${e.name}</span>
                <span class="pie-legend-count">${e.count} (${pct}%)</span>
            </div>`;

            currentAngle += angle;
        });

        return `<div class="chart-container">
            <div class="chart-title">🎯 学科分布</div>
            <div class="pie-chart-wrap">
                <svg viewBox="0 0 120 120" class="error-chart-svg pie-svg">
                    ${paths}
                    <circle cx="${cx}" cy="${cy}" r="20" fill="#FFFBF0" stroke="#4E342E" stroke-width="2"/>
                    <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="14" font-weight="bold" fill="#4E342E">${total}</text>
                    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="7" fill="#8D6E63">总错题</text>
                </svg>
                <div class="pie-legend">${legend}</div>
            </div>
        </div>`;
    },

    /* === 热力图：难度×错误率 === */
    renderDifficultyHeatmap(byDifficulty, byKnowledge) {
        const difficulties = [
            { key: 'easy', label: '轻松' },
            { key: 'normal', label: '普通' },
            { key: 'advanced', label: '进阶' }
        ];

        // 取错误数前6的知识点
        const topKnowledge = Object.entries(byKnowledge)
            .map(([name, data]) => ({ name, count: data.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        if (topKnowledge.length === 0) return '';

        const maxCount = Math.max(1, ...topKnowledge.map(k => k.count));

        // 计算每个知识点在各难度下的错误数（简化：用总体分布比例）
        let cells = '';
        topKnowledge.forEach((kp, rowIdx) => {
            difficulties.forEach((diff, colIdx) => {
                // 简化：用知识点总数按难度比例分配
                const ratio = byDifficulty[diff.key] / Math.max(1, byDifficulty.easy + byDifficulty.normal + byDifficulty.advanced);
                const count = Math.round(kp.count * ratio);
                const intensity = count / maxCount;
                const color = this.heatColor(intensity);

                const x = 70 + colIdx * 50;
                const y = 10 + rowIdx * 24;

                cells += `<rect x="${x}" y="${y}" width="44" height="20" rx="4" fill="${color}" stroke="#4E342E" stroke-width="1.5"/>`;
                if (count > 0) {
                    cells += `<text x="${x + 22}" y="${y + 14}" text-anchor="middle" font-size="10" font-weight="bold" fill="#4E342E">${count}</text>`;
                }
            });
        });

        // 行标签
        let rowLabels = '';
        topKnowledge.forEach((kp, i) => {
            const y = 14 + i * 24;
            const name = kp.name.length > 6 ? kp.name.slice(0, 6) + '…' : kp.name;
            rowLabels += `<text x="65" y="${y}" text-anchor="end" font-size="8" fill="#6D4C41">${name}</text>`;
        });

        // 列标签
        let colLabels = '';
        difficulties.forEach((d, i) => {
            const x = 92 + i * 50;
            colLabels += `<text x="${x}" y="6" text-anchor="middle" font-size="8" font-weight="bold" fill="#6D4C41">${d.label}</text>`;
        });

        const chartW = 230;
        const chartH = 20 + topKnowledge.length * 24;

        return `<div class="chart-container">
            <div class="chart-title">🔥 知识薄弱点热力图</div>
            <svg viewBox="0 0 ${chartW} ${chartH}" class="error-chart-svg" preserveAspectRatio="xMidYMid meet">
                ${colLabels}
                ${rowLabels}
                ${cells}
            </svg>
        </div>`;
    },

    /* === 热力图颜色 === */
    heatColor(intensity) {
        if (intensity <= 0) return '#FFF8E1';
        if (intensity < 0.25) return '#FFCCBC';
        if (intensity < 0.5) return '#FFAB91';
        if (intensity < 0.75) return '#FF8A65';
        return '#E64A19';
    }
};
