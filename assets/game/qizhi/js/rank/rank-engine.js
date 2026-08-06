/* ============================================
   启知 · 赛季排行榜
   功能：
   - 日榜 / 周榜 / 月榜 切换
   - 用户自主设置网名（仅展示网名，保护隐私）
   - 绘本风格榜单（奖牌、头像、积分）
   - 实时更新（基于用户经验）+ 内存缓存
   - 模拟社区成员（Bot）增加竞争氛围
   ============================================ */

const RankEngine = {
    /* === 当前榜单类型 === */
    currentTab: 'weekly',

    /* === 模拟社区成员（稳定数据）=== */
    botUsers: [
        { id: 'bot_1', nickname: '熊猫守护者', avatar: '🐼', baseExp: 86 },
        { id: 'bot_2', nickname: '锦江漫步者', avatar: '🌿', baseExp: 72 },
        { id: 'bot_3', nickname: '三国迷小张', avatar: '⚔️', baseExp: 65 },
        { id: 'bot_4', nickname: '科普小达人', avatar: '🔬', baseExp: 58 },
        { id: 'bot_5', nickname: '社区李阿姨', avatar: '🌸', baseExp: 51 },
        { id: 'bot_6', nickname: '科技前沿王', avatar: '🚀', baseExp: 44 },
        { id: 'bot_7', nickname: '环保践行者', avatar: '♻️', baseExp: 38 },
        { id: 'bot_8', nickname: '阳光少年', avatar: '☀️', baseExp: 31 },
        { id: 'bot_9', nickname: '生活观察家', avatar: '👀', baseExp: 25 },
        { id: 'bot_10', nickname: '好奇宝宝', avatar: '🌟', baseExp: 19 },
        { id: 'bot_11', nickname: '科普新朋友', avatar: '🌱', baseExp: 12 },
        { id: 'bot_12', nickname: '邻里热心人', avatar: '🤝', baseExp: 8 }
    ],

    /* === 缓存 === */
    cache: { daily: null, weekly: null, monthly: null, lastUpdate: 0 },

    /* === 初始化 === */
    init() {
        this.loadUserNick();
    },

    /* === 网名管理 === */
    loadUserNick() {
        // 优先使用 ShareEngine 的网名，否则默认
        if (typeof ShareEngine !== 'undefined' && ShareEngine.nickname) {
            return ShareEngine.nickname;
        }
        return '启知探索者';
    },

    getUserAvatar() {
        if (typeof ShareEngine !== 'undefined' && ShareEngine.avatar) {
            return ShareEngine.avatar;
        }
        return '🌱';
    },

    /* === 计算用户各周期经验 === */
    getUserExp() {
        if (typeof State === 'undefined') return { daily: 0, weekly: 0, monthly: 0 };
        const total = State.user.totalExpEarned || 0;
        // 日榜：今日完成数 × 平均经验
        const todayCount = State.history.filter(h => {
            return new Date(h.completedAt).toDateString() === new Date().toDateString();
        }).length;
        const daily = todayCount + (State.user.completedCount > 0 ? 1 : 0);
        // 周榜：近7天完成数
        const weekAgo = Date.now() - 7 * 86400000;
        const weeklyCount = State.history.filter(h => h.completedAt >= weekAgo).length;
        const weekly = weeklyCount + Math.floor(total / 3);
        // 月榜：总经验
        const monthly = total;
        return { daily, weekly, monthly };
    },

    /* === 生成完整榜单 === */
    generateRanking(period) {
        // 缓存检查（5分钟内有效）
        const now = Date.now();
        if (this.cache[period] && (now - this.cache.lastUpdate) < 300000) {
            // 仍需更新用户实时数据
            return this.injectUser(this.cache[period], period);
        }

        // Bot 用户的分数（根据周期缩放）
        const botList = this.botUsers.map(bot => {
            let exp;
            if (period === 'daily') {
                // 日榜：bot 分数较低且随机波动
                exp = Math.floor(bot.baseExp * 0.15 + Math.random() * 5);
            } else if (period === 'weekly') {
                exp = Math.floor(bot.baseExp * 0.5 + Math.random() * 10);
            } else {
                exp = bot.baseExp + Math.floor(Math.random() * 15);
            }
            return {
                id: bot.id,
                nickname: bot.nickname,
                avatar: bot.avatar,
                exp: exp,
                isCurrentUser: false
            };
        });

        this.cache[period] = botList;
        this.cache.lastUpdate = now;
        return this.injectUser(botList, period);
    },

    /* === 注入当前用户到榜单 === */
    injectUser(botList, period) {
        const userExp = this.getUserExp();
        const userEntry = {
            id: 'current_user',
            nickname: this.loadUserNick(),
            avatar: this.getUserAvatar(),
            exp: userExp[period],
            isCurrentUser: true
        };

        const combined = [...botList, userEntry];
        // 降序排列
        combined.sort((a, b) => b.exp - a.exp);
        // 排名
        combined.forEach((u, i) => u.rank = i + 1);
        return combined;
    },

    /* === 渲染排行榜 === */
    render() {
        const container = document.getElementById('rankContainer');
        if (!container) return;

        const ranking = this.generateRanking(this.currentTab);
        const userEntry = ranking.find(u => u.isCurrentUser);

        container.innerHTML = `
            <div class="rank-header">
                <h3>🏆 社区科普达人榜</h3>
                <p>纯激励 · 无攀比 · 重实用</p>
            </div>

            <div class="rank-tabs">
                <button class="rank-tab ${this.currentTab === 'daily' ? 'active' : ''}" data-period="daily">日榜</button>
                <button class="rank-tab ${this.currentTab === 'weekly' ? 'active' : ''}" data-period="weekly">周榜</button>
                <button class="rank-tab ${this.currentTab === 'monthly' ? 'active' : ''}" data-period="monthly">月榜</button>
            </div>

            ${userEntry ? this.renderUserCard(userEntry) : ''}

            <div class="rank-podium">
                ${this.renderPodium(ranking.slice(0, 3))}
            </div>

            <div class="rank-list">
                ${this.renderRankList(ranking.slice(3))}
            </div>

            <div class="rank-footer">
                <button class="rank-edit-btn" id="rankEditNick">✏️ 修改我的网名</button>
                <p class="rank-privacy">🔒 排行榜仅展示网名，不显示真实姓名</p>
            </div>
        `;

        this.bindEvents();
    },

    /* === 渲染用户当前排名卡片 === */
    renderUserCard(user) {
        return `
            <div class="rank-user-card">
                <div class="ruc-rank">#${user.rank}</div>
                <div class="ruc-avatar">${user.avatar}</div>
                <div class="ruc-info">
                    <div class="ruc-name">${this.escapeHTML(user.nickname)} <span class="ruc-me">（我）</span></div>
                    <div class="ruc-exp">${user.exp} 积分</div>
                </div>
            </div>
        `;
    },

    /* === 渲染前三名领奖台 === */
    renderPodium(top3) {
        const medals = ['🥇', '🥈', '🥉'];
        const heights = [110, 80, 60];
        const colors = ['#FFD54F', '#B0BEC5', '#FFB74D'];

        // 领奖台顺序：2nd - 1st - 3rd
        const order = [1, 0, 2];
        return order.map(i => {
            const u = top3[i];
            if (!u) return '';
            return `
                <div class="podium-item podium-${i + 1} ${u.isCurrentUser ? 'me' : ''}">
                    <div class="podium-medal">${medals[i]}</div>
                    <div class="podium-avatar" style="background:${colors[i]}">${u.avatar}</div>
                    <div class="podium-name">${this.escapeHTML(u.nickname)}</div>
                    <div class="podium-exp">${u.exp}</div>
                    <div class="podium-bar" style="height:${heights[i]}px;background:${colors[i]}"></div>
                    <div class="podium-rank">${i + 1}</div>
                </div>
            `;
        }).join('');
    },

    /* === 渲染排名列表（4名以后）=== */
    renderRankList(list) {
        if (list.length === 0) return '';
        return list.map(u => `
            <div class="rank-row ${u.isCurrentUser ? 'me' : ''}">
                <span class="rr-rank">${u.rank}</span>
                <span class="rr-avatar">${u.avatar}</span>
                <span class="rr-name">${this.escapeHTML(u.nickname)}${u.isCurrentUser ? ' <small>(我)</small>' : ''}</span>
                <span class="rr-exp">${u.exp} 积分</span>
            </div>
        `).join('');
    },

    /* === 事件绑定 === */
    bindEvents() {
        // 榜单切换
        document.querySelectorAll('.rank-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.period;
                this.render();
            });
        });

        // 修改网名
        const editBtn = document.getElementById('rankEditNick');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.openNickEditor());
        }
    },

    /* === 网名修改弹窗 === */
    openNickEditor() {
        const overlay = document.getElementById('rankOverlay');
        if (!overlay) return;

        const currentNick = this.loadUserNick();
        const avatars = ['🌱','🐼','🌿','🌸','🚀','☀️','🔬','♻️','⭐','🌟','🦊','🐯','🐰','🐱','🐶','🦉','🐢','🐬','🦋','🍀'];

        overlay.innerHTML = `
            <div class="nick-editor" onclick="event.stopPropagation()">
                <div class="ne-header">
                    <h3>✏️ 设置我的网名</h3>
                </div>
                <div class="ne-rules">
                    <p>📌 网名规则：</p>
                    <ul>
                        <li>长度 2-12 个字符</li>
                        <li>排行榜中仅展示网名，不显示真实姓名</li>
                        <li>可随时修改，修改后榜单即时更新</li>
                    </ul>
                </div>
                <div class="ne-input-wrap">
                    <input type="text" class="ne-input" id="nickInput" value="${this.escapeHTML(currentNick)}" maxlength="12" placeholder="输入你的网名">
                    <div class="ne-counter"><span id="nickCount">${currentNick.length}</span>/12</div>
                </div>
                <div class="ne-avatar-section">
                    <div class="ne-avatar-title">选择头像</div>
                    <div class="ne-avatar-grid" id="nickAvatarGrid">
                        ${avatars.map(a => `<button class="ne-avatar-btn ${a === this.getUserAvatar() ? 'selected' : ''}" data-a="${a}">${a}</button>`).join('')}
                    </div>
                </div>
                <button class="ne-save-btn" id="nickSaveBtn">保存</button>
            </div>
        `;
        overlay.classList.add('show');

        // 事件
        const input = document.getElementById('nickInput');
        const counter = document.getElementById('nickCount');
        input.addEventListener('input', () => {
            counter.textContent = input.value.length;
        });

        let selectedAvatar = this.getUserAvatar();
        document.querySelectorAll('.ne-avatar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ne-avatar-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedAvatar = btn.dataset.a;
            });
        });

        document.getElementById('nickSaveBtn').addEventListener('click', () => {
            const nick = input.value.trim();
            if (nick.length < 2) {
                if (typeof showToast === 'function') showToast('网名至少需要2个字符');
                return;
            }
            // 同步到 ShareEngine
            if (typeof ShareEngine !== 'undefined') {
                ShareEngine.nickname = nick;
                ShareEngine.avatar = selectedAvatar;
                ShareEngine.save();
            }
            // 清除缓存使榜单更新
            this.cache = { daily: null, weekly: null, monthly: null, lastUpdate: 0 };
            this.closeNickEditor();
            this.render();
            if (typeof showToast === 'function') showToast('✅ 网名已更新！');
        });

        // 遮罩点击关闭
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'rankOverlay') this.closeNickEditor();
        });
    },

    closeNickEditor() {
        const overlay = document.getElementById('rankOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.innerHTML = '';
        }
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
