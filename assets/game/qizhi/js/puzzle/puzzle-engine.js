/* ============================================
   启知 · 知识碎片拼图引擎
   功能：
   - 碎片收集（完成任务获得）
   - 拖拽 / 旋转 / 吸附 交互（pointer 事件，跨端）
   - 吉祥物旅行轨迹动画（手绘路径，物理缓动）
   - 解锁提示弹窗（庆祝 + 知识 + 引导）
   - 模块化架构，预留扩展接口（PuzzleAPI）
   ============================================ */

const PuzzleEngine = {
    /* === 状态 === */
    state: {
        earned: [],        // 已获得的碎片 id 列表
        placed: [],        // 已放置的碎片 id 列表
        lastPlacedPos: { x: 200, y: 280 }, // 吉祥物上次位置
        trajectoryPath: []  // 旅行轨迹点序列
    },

    /* === 拖拽临时状态 === */
    drag: {
        active: false,
        fragmentEl: null,
        landmarkId: null,
        svgPt: null,       // SVG 坐标转换点
        startSvg: { x: 0, y: 0 },
        rotation: 0
    },

    /* === 初始化 === */
    init() {
        this.load();
        this.bindEvents();
    },

    /* === 持久化 === */
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('qizhi_puzzle') || '{}');
            this.state.earned = data.earned || [];
            this.state.placed = data.placed || [];
            this.state.lastPlacedPos = data.lastPlacedPos || { x: 200, y: 280 };
            this.state.trajectoryPath = data.trajectoryPath || [];
        } catch (e) {
            this.state.earned = [];
            this.state.placed = [];
        }
    },

    save() {
        localStorage.setItem('qizhi_puzzle', JSON.stringify(this.state));
    },

    /* === 渲染整个拼图面板 === */
    render() {
        const container = document.getElementById('puzzleContainer');
        if (!container) return;

        const placedCount = this.state.placed.length;
        const totalCount = CHENGDU_LANDMARKS.length;
        const earnedNotPlaced = this.state.earned.filter(id => !this.state.placed.includes(id));

        container.innerHTML = `
            <div class="puzzle-header">
                <h3>🗺️ 成都知识地图</h3>
                <p>完成任务收集碎片，拼出你的成都科普之旅</p>
            </div>

            <div class="puzzle-map-wrap">
                ${renderChengduMapSVG()}
            </div>

            <div class="puzzle-tray" id="puzzleTray">
                <div class="tray-title">🎒 我的碎片（${earnedNotPlaced.length} 待放置）</div>
                <div class="tray-list" id="trayList">
                    ${this.renderTrayItems()}
                </div>
            </div>

            <div class="puzzle-stats">
                <div class="pstat"><span class="pn">${placedCount}</span><span class="pl">已拼接</span></div>
                <div class="pstat"><span class="pn">${this.state.earned.length}</span><span class="pl">已收集</span></div>
                <div class="pstat"><span class="pn">${totalCount - placedCount}</span><span class="pl">待探索</span></div>
            </div>
        `;

        this.renderMapLayer();
        this.updateFragmentCount();
        this.bindDragEvents();
    },

    /* === 渲染碎片托盘 === */
    renderTrayItems() {
        const earnedNotPlaced = this.state.earned.filter(id => !this.state.placed.includes(id));
        if (earnedNotPlaced.length === 0) {
            return '<div class="tray-empty">完成日常任务即可获得知识碎片 ✨</div>';
        }
        return earnedNotPlaced.map(id => {
            const lm = CHENGDU_LANDMARKS.find(l => l.id === id);
            if (!lm) return '';
            return `
                <div class="tray-item" data-id="${lm.id}">
                    <div class="tray-piece" style="background:${lm.color}">
                        <span class="tray-icon">${lm.icon}</span>
                    </div>
                    <span class="tray-name">${lm.name}</span>
                    <button class="tray-rotate" data-id="${lm.id}" title="旋转">⟳</button>
                </div>`;
        }).join('');
    },

    /* === 渲染地图上的目标点与已放置碎片 === */
    renderMapLayer() {
        const svg = document.getElementById('puzzleMapSVG');
        if (!svg) return;

        const targetsG = svg.querySelector('#mapTargets');
        const placedG = svg.querySelector('#placedFragments');

        // 目标点：仅渲染尚未放置的
        targetsG.innerHTML = CHENGDU_LANDMARKS
            .filter(lm => !this.state.placed.includes(lm.id))
            .map(lm => renderMapTarget(lm)).join('');

        // 已放置碎片
        placedG.innerHTML = this.state.placed
            .map(id => CHENGDU_LANDMARKS.find(l => l.id === id))
            .filter(Boolean)
            .map(lm => renderPlacedFragment(lm)).join('');

        // 渲染历史轨迹
        this.renderTrajectory();
    },

    /* === 更新碎片计数 === */
    updateFragmentCount() {
        const el = document.getElementById('fragmentCountText');
        if (el) el.textContent = `已收集 ${this.state.placed.length} / ${CHENGDU_LANDMARKS.length}`;
    },

    /* === 事件绑定 === */
    bindEvents() {
        // 事件在 render 后动态绑定，这里仅做一次性委托
        document.addEventListener('click', (e) => {
            const rotateBtn = e.target.closest('.tray-rotate');
            if (rotateBtn) {
                e.stopPropagation();
                this.rotateTrayPiece(rotateBtn.dataset.id);
            }
        });
    },

    /* === 托盘碎片旋转（视觉反馈）=== */
    rotateTrayPiece(id) {
        const item = document.querySelector(`.tray-item[data-id="${id}"] .tray-piece`);
        if (!item) return;
        const cur = parseInt(item.dataset.rot || '0');
        const next = cur + 90;
        item.dataset.rot = next;
        item.style.transform = `rotate(${next}deg)`;
    },

    /* === 绑定拖拽事件（pointer，跨端）=== */
    bindDragEvents() {
        const trayItems = document.querySelectorAll('.tray-item');
        trayItems.forEach(item => {
            item.addEventListener('pointerdown', (e) => this.startDrag(e, item.dataset.id));
        });
    },

    /* === 开始拖拽：从托盘生成可拖动碎片 === */
    startDrag(e, landmarkId) {
        e.preventDefault();
        const lm = CHENGDU_LANDMARKS.find(l => l.id === landmarkId);
        if (!lm) return;

        const svg = document.getElementById('puzzleMapSVG');
        if (!svg) return;

        this.drag.active = true;
        this.drag.landmarkId = landmarkId;
        this.drag.rotation = 0;

        // 创建可拖动的 SVG 碎片组
        const dragLayer = svg.querySelector('#placedFragments');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'dragging-fragment');
        g.setAttribute('data-id', landmarkId);
        g.innerHTML = `
            <circle cx="0" cy="0" r="26" fill="${lm.color}" stroke="#4E342E" stroke-width="3" opacity="0.95"/>
            <text x="0" y="7" text-anchor="middle" font-size="22">${lm.icon}</text>
        `;
        dragLayer.appendChild(g);
        this.drag.fragmentEl = g;

        // SVG 坐标转换工具
        this.drag.svgPt = svg.createSVGPoint();

        // 初始定位到指针位置
        this.moveDrag(e);

        // 全局监听
        const onMove = (ev) => this.moveDrag(ev);
        const onUp = (ev) => {
            this.endDrag(ev);
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
    },

    /* === 拖拽中：转换屏幕坐标 → SVG 坐标 === */
    moveDrag(e) {
        if (!this.drag.active || !this.drag.fragmentEl) return;
        const svg = document.getElementById('puzzleMapSVG');
        if (!svg) return;

        const pt = this.drag.svgPt;
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const svgP = pt.matrixTransform(ctm.inverse());

        this.drag.fragmentEl.setAttribute('transform',
            `translate(${svgP.x.toFixed(1)},${svgP.y.toFixed(1)}) rotate(${this.drag.rotation})`);

        // 高亮接近的目标点
        this.highlightNearbyTarget(svgP.x, svgP.y);
    },

    /* === 高亮邻近目标 === */
    highlightNearbyTarget(x, y) {
        const lm = CHENGDU_LANDMARKS.find(l => l.id === this.drag.landmarkId);
        if (!lm) return;
        const dist = Math.hypot(x - lm.x, y - lm.y);
        const target = document.querySelector(`.map-target[data-id="${lm.id}"]`);
        if (!target) return;
        if (dist < 40) {
            target.classList.add('near');
        } else {
            target.classList.remove('near');
        }
    },

    /* === 结束拖拽：判定吸附 === */
    endDrag(e) {
        if (!this.drag.active) return;
        const svg = document.getElementById('puzzleMapSVG');
        if (!svg) { this.cancelDrag(); return; }

        const pt = this.drag.svgPt;
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) { this.cancelDrag(); return; }
        const svgP = pt.matrixTransform(ctm.inverse());

        const lm = CHENGDU_LANDMARKS.find(l => l.id === this.drag.landmarkId);
        const dist = Math.hypot(svgP.x - lm.x, svgP.y - lm.y);

        // 移除拖动元素
        if (this.drag.fragmentEl) this.drag.fragmentEl.remove();
        const target = document.querySelector(`.map-target[data-id="${lm.id}"]`);
        if (target) target.classList.remove('near');

        if (dist < 40) {
            // 吸附成功
            this.placeFragment(lm);
        } else {
            // 未吸附，碎片回到托盘
            this.showToast('再靠近一点目标位置～');
        }

        this.drag.active = false;
        this.drag.fragmentEl = null;
        this.drag.landmarkId = null;
    },

    cancelDrag() {
        if (this.drag.fragmentEl) this.drag.fragmentEl.remove();
        this.drag.active = false;
        this.drag.fragmentEl = null;
        this.drag.landmarkId = null;
    },

    /* === 放置碎片：锁定 + 轨迹 + 弹窗 === */
    placeFragment(landmark) {
        this.state.placed.push(landmark.id);
        this.save();

        // 渲染已放置碎片
        this.renderMapLayer();
        this.updateFragmentCount();

        // 触发吉祥物旅行轨迹动画
        this.animateTrajectory(landmark).then(() => {
            // 显示解锁弹窗
            this.showUnlockPopup(landmark);
        });

        // 刷新托盘
        const trayList = document.getElementById('trayList');
        if (trayList) trayList.innerHTML = this.renderTrayItems();
        this.bindDragEvents();
    },

    /* === 吉祥物旅行轨迹动画 === */
    async animateTrajectory(landmark) {
        const svg = document.getElementById('puzzleMapSVG');
        if (!svg) return;
        const trajLayer = svg.querySelector('#trajectoryLayer');
        if (!trajLayer) return;

        const start = { ...this.state.lastPlacedPos };
        const end = { x: landmark.x, y: landmark.y };

        // 生成手绘风格弯曲路径（贝塞尔，带随机偏移营造手绘感）
        const midX = (start.x + end.x) / 2 + (Math.random() - 0.5) * 40;
        const midY = (start.y + end.y) / 2 + (Math.random() - 0.5) * 40;
        const pathD = `M${start.x},${start.y} Q${midX},${midY} ${end.x},${end.y}`;

        // 绘制虚线轨迹（逐步显示）
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', pathD);
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('stroke', landmark.color);
        pathEl.setAttribute('stroke-width', '3');
        pathEl.setAttribute('stroke-linecap', 'round');
        pathEl.setAttribute('stroke-dasharray', '6 4');
        pathEl.setAttribute('opacity', '0.8');
        trajLayer.appendChild(pathEl);

        // 路径长度动画
        const totalLen = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = totalLen;
        pathEl.style.strokeDashoffset = totalLen;
        // 强制 reflow
        pathEl.getBoundingClientRect();
        pathEl.style.transition = 'stroke-dashoffset 1.2s ease-in-out';
        pathEl.style.strokeDashoffset = '0';

        // 起点标记
        const startMark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startMark.setAttribute('cx', start.x);
        startMark.setAttribute('cy', start.y);
        startMark.setAttribute('r', '4');
        startMark.setAttribute('fill', '#FFFBF0');
        startMark.setAttribute('stroke', '#4E342E');
        startMark.setAttribute('stroke-width', '2');
        trajLayer.appendChild(startMark);

        // 吉祥物沿路径移动（用 animateMotion）
        const mascotColor = (typeof getMascotColorForAudience !== 'undefined')
            ? getMascotColorForAudience(State.audience) : 'blue';
        const mascotSrc = (typeof getMascotSrc !== 'undefined')
            ? getMascotSrc(mascotColor) : 'assets/blue_thing.png';

        const mascotG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        mascotG.innerHTML = `
            <image href="${mascotSrc}" x="-14" y="-14" width="28" height="28" opacity="0"/>
            <animateMotion dur="1.2s" fill="freeze" rotate="auto">
                <mpath href="#trajPath_${landmark.id}"/>
            </animateMotion>
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" fill="freeze"/>
        `;
        const hiddenPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hiddenPath.setAttribute('id', `trajPath_${landmark.id}`);
        hiddenPath.setAttribute('d', pathD);
        hiddenPath.setAttribute('fill', 'none');
        hiddenPath.setAttribute('stroke', 'none');
        trajLayer.appendChild(hiddenPath);
        trajLayer.appendChild(mascotG);

        // 终点标记（脉冲）
        const endMark = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        endMark.innerHTML = `
            <circle cx="${end.x}" cy="${end.y}" r="6" fill="${landmark.color}" stroke="#4E342E" stroke-width="2">
                <animate attributeName="r" values="6;14;6" dur="0.8s" repeatCount="2"/>
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="2"/>
            </circle>
        `;
        trajLayer.appendChild(endMark);

        // 更新轨迹历史
        this.state.trajectoryPath.push({ x: end.x, y: end.y, id: landmark.id });
        this.state.lastPlacedPos = { x: end.x, y: end.y };
        this.save();

        // 等待动画完成
        await new Promise(r => setTimeout(r, 1300));

        // 吉祥物淡出（保留在终点小图标）
        mascotG.style.transition = 'opacity 0.4s';
        mascotG.style.opacity = '0';
        setTimeout(() => mascotG.remove(), 400);
    },

    /* === 渲染历史轨迹（页面重载时恢复）=== */
    renderTrajectory() {
        const svg = document.getElementById('puzzleMapSVG');
        if (!svg) return;
        const trajLayer = svg.querySelector('#trajectoryLayer');
        if (!trajLayer) return;
        trajLayer.innerHTML = '';

        if (this.state.trajectoryPath.length === 0) return;

        // 绘制连接线
        let pathD = '';
        const origin = { x: 200, y: 280 };
        let prev = origin;
        this.state.trajectoryPath.forEach((pt, i) => {
            const midX = (prev.x + pt.x) / 2 + (i % 2 === 0 ? 20 : -20);
            const midY = (prev.y + pt.y) / 2 - 15;
            pathD += (i === 0 ? `M${prev.x},${prev.y}` : ` L${prev.x},${prev.y}`);
            pathD += ` Q${midX},${midY} ${pt.x},${pt.y}`;
            prev = pt;
        });

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#FF8A65');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-dasharray', '5 4');
        path.setAttribute('opacity', '0.5');
        trajLayer.appendChild(path);
    },

    /* === 解锁提示弹窗 === */
    showUnlockPopup(landmark) {
        const overlay = document.getElementById('puzzleOverlay');
        if (!overlay) return;

        const isLast = this.state.placed.length === CHENGDU_LANDMARKS.length;

        overlay.innerHTML = `
            <div class="puzzle-popup" onclick="event.stopPropagation()">
                <div class="popup-confetti">
                    ${this.renderConfetti()}
                </div>
                <div class="popup-icon-wrap" style="--lc:${landmark.color}">
                    <span class="popup-icon">${landmark.icon}</span>
                </div>
                <div class="popup-tag">🔓 碎片解锁</div>
                <h3 class="popup-title">${landmark.name}</h3>
                <div class="popup-district">📍 ${landmark.district}</div>
                <div class="popup-knowledge">
                    <div class="pk-title">📚 ${landmark.knowledge.title}</div>
                    <div class="pk-content">${landmark.knowledge.content}</div>
                </div>
                <div class="popup-progress">
                    已拼接 ${this.state.placed.length} / ${CHENGDU_LANDMARKS.length}
                    <div class="pp-bar"><div class="pp-fill" style="width:${this.state.placed.length / CHENGDU_LANDMARKS.length * 100}%"></div></div>
                </div>
                <button class="popup-btn" id="popupNextBtn">
                    ${isLast ? '🏆 查看完整地图' : '继续探索 →'}
                </button>
            </div>
        `;
        overlay.classList.add('show');

        const btn = document.getElementById('popupNextBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.closePopup();
                if (isLast) {
                    this.showCompleteCelebration();
                }
            });
        }
    },

    /* === 全部完成的庆祝 === */
    showCompleteCelebration() {
        const overlay = document.getElementById('puzzleOverlay');
        overlay.innerHTML = `
            <div class="puzzle-popup complete" onclick="event.stopPropagation()">
                <div class="popup-confetti">${this.renderConfetti(24)}</div>
                <div class="popup-icon-wrap" style="--lc:#FFD54F">
                    <span class="popup-icon">🏆</span>
                </div>
                <h3 class="popup-title">成都知识地图·集齐！</h3>
                <p class="popup-desc">恭喜你拼出完整的成都科普地图！<br>从都江堰到东郊记忆，你已走遍十处城市知识地标。</p>
                <div class="popup-knowledge">
                    <div class="pk-title">🎁 成就奖励</div>
                    <div class="pk-content">解锁「成都通」称号，获得 10 经验值奖励</div>
                </div>
                <button class="popup-btn" id="popupCloseBtn">太棒了！</button>
            </div>
        `;
        overlay.classList.add('show');
        document.getElementById('popupCloseBtn').addEventListener('click', () => this.closePopup());

        // 奖励经验
        if (typeof State !== 'undefined') {
            State.user.totalExpEarned += 10;
            State.user.availableExp += 10;
            if (typeof updateLevel === 'function') updateLevel();
            if (typeof saveState === 'function') saveState();
            if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
        }
    },

    closePopup() {
        const overlay = document.getElementById('puzzleOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.innerHTML = '';
        }
    },

    /* === 庆祝彩带 === */
    renderConfetti(count = 14) {
        const colors = ['#FF8A65', '#4FC3F7', '#FFD54F', '#81C784', '#BA68C8', '#E91E63'];
        let html = '';
        for (let i = 0; i < count; i++) {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const dur = 1 + Math.random() * 0.8;
            const color = colors[i % colors.length];
            const rot = Math.random() * 360;
            html += `<span class="confetti-piece" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;background:${color};transform:rotate(${rot}deg)"></span>`;
        }
        return html;
    },

    showToast(msg) {
        if (typeof showToast === 'function') {
            showToast(msg);
        }
    },

    /* ============================================
       公开 API（模块化扩展接口）
       ============================================ */
    api: {
        /* 完成任务时调用：随机奖励一片碎片 */
        rewardFragment() {
            const unearned = CHENGDU_LANDMARKS.filter(l => !PuzzleEngine.state.earned.includes(l.id));
            if (unearned.length === 0) return null;
            const pick = unearned[Math.floor(Math.random() * unearned.length)];
            PuzzleEngine.state.earned.push(pick.id);
            PuzzleEngine.save();
            return pick;
        },

        /* 获取进度统计 */
        getProgress() {
            return {
                earned: PuzzleEngine.state.earned.length,
                placed: PuzzleEngine.state.placed.length,
                total: CHENGDU_LANDMARKS.length
            };
        },

        /* 重置（调试用）*/
        reset() {
            PuzzleEngine.state = {
                earned: [], placed: [],
                lastPlacedPos: { x: 200, y: 280 },
                trajectoryPath: []
            };
            PuzzleEngine.save();
            PuzzleEngine.render();
        },

        /* 注册新地标（扩展接口，新增功能最小改动）*/
        registerLandmark(landmark) {
            if (!CHENGDU_LANDMARKS.find(l => l.id === landmark.id)) {
                CHENGDU_LANDMARKS.push(landmark);
            }
        }
    }
};
