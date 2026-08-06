/* ============================================
   启知 · 合成进化 — 知识分享系统
   功能：
   - 朋友圈风格知识分享广场（绘本风格）
   - 富文本编辑器（文字 + 表情）
   - 语音录制（录音/暂停/重录/播放，MediaRecorder API）
   - 发布前预览
   - 发布 + 状态反馈 + 点赞互动
   ============================================ */

const ShareEngine = {
    /* === 状态 === */
    posts: [],
    nickname: '启知探索者',
    avatar: '🌱',

    /* === 编辑器临时状态 === */
    editor: {
        text: '',
        emojis: [],
        audioBlob: null,
        audioBase64: null,
        audioDuration: 0,
        mediaRecorder: null,
        audioChunks: [],
        recording: false,
        recordTimer: null,
        recordSeconds: 0,
        audioStream: null
    },

    /* === 表情库 === */
    EMOJI_SET: ['💡','🔬','🌍','🌱','♻️','🧪','🔭','📊','🦠','⚡','🌊','🐼','🌿','☀️','🔬','🧬','📡','🚀','💚','✨'],

    /* === 初始化 === */
    init() {
        this.load();
    },

    /* === 持久化 === */
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('qizhi_shares') || '{}');
            this.posts = data.posts || this.seedPosts();
            this.nickname = data.nickname || '启知探索者';
            this.avatar = data.avatar || '🌱';
            if (!data.posts) this.save();
        } catch (e) {
            this.posts = this.seedPosts();
        }
    },

    save() {
        // 注意：语音 base64 可能较大，限制存储条数
        const toStore = this.posts.slice(0, 50);
        localStorage.setItem('qizhi_shares', JSON.stringify({
            posts: toStore,
            nickname: this.nickname,
            avatar: this.avatar
        }));
    },

    /* === 种子内容（示例分享）=== */
    seedPosts() {
        return [
            {
                id: 'seed_1',
                author: '熊猫守护者',
                avatar: '🐼',
                content: '今天在启知学到一招：大熊猫在地球上生存了至少800万年，被称为「活化石」！保护国宝，从了解开始 💚',
                emojis: [],
                audioBase64: null,
                audioDuration: 0,
                knowledgeTag: '大熊猫基地',
                timestamp: Date.now() - 3600000 * 5,
                likes: 12,
                liked: false
            },
            {
                id: 'seed_2',
                author: '锦江漫步者',
                avatar: '🌿',
                content: '都江堰居然是公元前256年建的，李冰父子太厉害了！鱼嘴分水、飞沙堰排沙、宝瓶口引水，三大工程让成都平原成为天府之国 🌊',
                emojis: [],
                audioBase64: null,
                audioDuration: 0,
                knowledgeTag: '都江堰',
                timestamp: Date.now() - 3600000 * 24,
                likes: 8,
                liked: false
            },
            {
                id: 'seed_3',
                author: '三国迷小张',
                avatar: '⚔️',
                content: '武侯祠是中国唯一的君臣合祀祠庙，纪念诸葛亮和刘备。去锦里逛了一圈，三国文化氛围满满！',
                emojis: [],
                audioBase64: null,
                audioDuration: 0,
                knowledgeTag: '武侯祠·锦里',
                timestamp: Date.now() - 3600000 * 48,
                likes: 5,
                liked: false
            }
        ];
    },

    /* === 渲染分享广场 === */
    render() {
        const container = document.getElementById('shareContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="share-header">
                <h3>📖 知识分享广场</h3>
                <p>分享你的科普发现，和邻居一起成长</p>
            </div>

            <button class="share-publish-btn" id="sharePublishBtn">
                <span>✏️</span> 发布知识分享
            </button>

            <div class="share-feed" id="shareFeed">
                ${this.renderFeed()}
            </div>
        `;

        // 绑定发布按钮
        const pubBtn = document.getElementById('sharePublishBtn');
        if (pubBtn) {
            pubBtn.addEventListener('click', () => this.openEditor());
        }

        // 绑定点赞
        container.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleLike(btn.dataset.id));
        });

        // 绑定语音播放
        container.querySelectorAll('.play-audio-btn').forEach(btn => {
            btn.addEventListener('click', () => this.playPostAudio(btn.dataset.id));
        });
    },

    /* === 渲染信息流 === */
    renderFeed() {
        if (this.posts.length === 0) {
            return '<div class="feed-empty">还没有分享，快来发布第一条吧！</div>';
        }
        return this.posts.map(p => this.renderPost(p)).join('');
    },

    /* === 渲染单条分享 === */
    renderPost(post) {
        const timeStr = this.formatTime(post.timestamp);
        const audioHTML = post.audioBase64 ? `
            <button class="play-audio-btn" data-id="${post.id}">
                <span class="pa-icon">🔊</span>
                <span class="pa-text">语音 ${post.audioDuration}s</span>
            </button>` : '';

        const tagHTML = post.knowledgeTag ? `
            <span class="share-tag">📍 ${post.knowledgeTag}</span>` : '';

        return `
            <div class="share-post">
                <div class="sp-avatar">${post.avatar}</div>
                <div class="sp-body">
                    <div class="sp-author">${post.author}</div>
                    <div class="sp-content">${this.escapeHTML(post.content)}</div>
                    ${post.emojis && post.emojis.length ? `<div class="sp-emojis">${post.emojis.join(' ')}</div>` : ''}
                    ${audioHTML}
                    <div class="sp-footer">
                        ${tagHTML}
                        <span class="sp-time">${timeStr}</span>
                        <button class="like-btn ${post.liked ? 'liked' : ''}" data-id="${post.id}">
                            ${post.liked ? '❤️' : '🤍'} ${post.likes}
                        </button>
                    </div>
                </div>
            </div>`;
    },

    /* === 打开编辑器 === */
    openEditor() {
        const overlay = document.getElementById('shareOverlay');
        if (!overlay) return;

        // 重置编辑器状态
        this.resetEditor();

        overlay.innerHTML = this.renderEditor();
        overlay.classList.add('show');
        this.bindEditorEvents();
    },

    /* === 渲染编辑器 === */
    renderEditor() {
        return `
            <div class="share-editor" onclick="event.stopPropagation()">
                <div class="editor-header">
                    <button class="editor-close" id="editorClose">✕</button>
                    <h3>📝 发布分享</h3>
                    <button class="editor-preview" id="editorPreview">预览</button>
                </div>

                <div class="editor-user">
                    <span class="eu-avatar">${this.avatar}</span>
                    <input type="text" class="eu-name" id="editorNickname" value="${this.escapeHTML(this.nickname)}" placeholder="你的网名" maxlength="12">
                </div>

                <div class="editor-content-wrap">
                    <textarea class="editor-textarea" id="editorText" placeholder="分享你今天学到的科普知识..." maxlength="500"></textarea>
                    <div class="editor-counter"><span id="textCount">0</span>/500</div>
                </div>

                <div class="editor-emoji-section">
                    <div class="emoji-title">😀 添加表情</div>
                    <div class="emoji-grid" id="emojiGrid">
                        ${this.EMOJI_SET.map(e => `<button class="emoji-btn" data-e="${e}">${e}</button>`).join('')}
                    </div>
                    <div class="selected-emojis" id="selectedEmojis"></div>
                </div>

                <div class="editor-voice-section">
                    <div class="voice-title">🎙️ 语音分享（选填）</div>
                    <div class="voice-controls" id="voiceControls">
                        <button class="voice-record-btn" id="voiceRecordBtn">
                            <span class="vr-icon">🎤</span>
                            <span class="vr-text">开始录音</span>
                        </button>
                        <div class="voice-timer" id="voiceTimer" style="display:none;">
                            <span id="voiceTimeText">0:00</span>
                            <div class="voice-wave"><span></span><span></span><span></span><span></span><span></span></div>
                        </div>
                        <button class="voice-play-btn" id="voicePlayBtn" style="display:none;">▶️ 试听</button>
                        <button class="voice-redo-btn" id="voiceRedoBtn" style="display:none;">🔄 重录</button>
                    </div>
                    <audio id="editorAudioPlayer" style="display:none;"></audio>
                </div>

                <div class="editor-tag-section">
                    <div class="tag-title">📍 关联知识标签（选填）</div>
                    <select class="editor-tag-select" id="editorTagSelect">
                        <option value="">不关联</option>
                        ${CHENGDU_LANDMARKS.map(l => `<option value="${l.name}">${l.icon} ${l.name}</option>`).join('')}
                    </select>
                </div>

                <button class="editor-publish-btn" id="editorPublish">📢 发布分享</button>
            </div>
        `;
    },

    /* === 绑定编辑器事件 === */
    bindEditorEvents() {
        // 关闭
        $('editorClose').addEventListener('click', () => this.closeEditor());
        // 遮罩点击关闭
        document.getElementById('shareOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'shareOverlay') this.closeEditor();
        });

        // 文字计数
        const textarea = $('editorText');
        const counter = $('textCount');
        textarea.addEventListener('input', () => {
            counter.textContent = textarea.value.length;
        });

        // 表情选择
        const emojiGrid = $('emojiGrid');
        const selectedEl = $('selectedEmojis');
        emojiGrid.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.e;
                this.editor.emojis.push(emoji);
                this.renderSelectedEmojis();
            });
        });

        // 语音录制
        $('voiceRecordBtn').addEventListener('click', () => this.toggleRecording());
        $('voicePlayBtn').addEventListener('click', () => this.playPreviewAudio());
        $('voiceRedoBtn').addEventListener('click', () => this.redoRecording());

        // 预览
        $('editorPreview').addEventListener('click', () => this.showPreview());

        // 发布
        $('editorPublish').addEventListener('click', () => this.publish());
    },

    /* === 渲染已选表情 === */
    renderSelectedEmojis() {
        const el = $('selectedEmojis');
        if (!el) return;
        if (this.editor.emojis.length === 0) {
            el.innerHTML = '';
            return;
        }
        el.innerHTML = this.editor.emojis.map((e, i) =>
            `<span class="sel-emoji" data-i="${i}">${e} <small>✕</small></span>`
        ).join('');
        el.querySelectorAll('.sel-emoji').forEach(s => {
            s.addEventListener('click', () => {
                this.editor.emojis.splice(parseInt(s.dataset.i), 1);
                this.renderSelectedEmojis();
            });
        });
    },

    /* === 语音录制：开始/停止 === */
    async toggleRecording() {
        if (this.editor.recording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    },

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.editor.audioStream = stream;
            this.editor.audioChunks = [];
            this.editor.mediaRecorder = new MediaRecorder(stream);

            this.editor.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.editor.audioChunks.push(e.data);
            };

            this.editor.mediaRecorder.onstop = () => {
                const blob = new Blob(this.editor.audioChunks, { type: 'audio/webm' });
                this.editor.audioBlob = blob;
                // 转 base64 存储
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.editor.audioBase64 = reader.result;
                };
                reader.readAsDataURL(blob);
            };

            this.editor.mediaRecorder.start();
            this.editor.recording = true;
            this.editor.recordSeconds = 0;

            // 计时器
            this.editor.recordTimer = setInterval(() => {
                this.editor.recordSeconds++;
                if (this.editor.recordSeconds >= 60) {
                    this.stopRecording();
                }
                this.updateRecordTime();
            }, 1000);

            // UI 更新
            const btn = $('voiceRecordBtn');
            btn.querySelector('.vr-icon').textContent = '⏹️';
            btn.querySelector('.vr-text').textContent = '停止录音';
            btn.classList.add('recording');
            $('voiceTimer').style.display = 'flex';
            $('voicePlayBtn').style.display = 'none';
            $('voiceRedoBtn').style.display = 'none';
            this.updateRecordTime();
        } catch (e) {
            if (typeof showToast === 'function') showToast('🎤 无法访问麦克风，请检查权限');
            console.warn('录音启动失败:', e);
        }
    },

    stopRecording() {
        if (this.editor.mediaRecorder && this.editor.mediaRecorder.state !== 'inactive') {
            this.editor.mediaRecorder.stop();
        }
        if (this.editor.audioStream) {
            this.editor.audioStream.getTracks().forEach(t => t.stop());
        }
        clearInterval(this.editor.recordTimer);
        this.editor.recording = false;
        this.editor.audioDuration = this.editor.recordSeconds;

        // UI 更新
        const btn = $('voiceRecordBtn');
        btn.querySelector('.vr-icon').textContent = '🎤';
        btn.querySelector('.vr-text').textContent = '重新录音';
        btn.classList.remove('recording');
        $('voiceTimer').style.display = 'none';

        if (this.editor.audioBlob) {
            $('voicePlayBtn').style.display = 'inline-block';
            $('voiceRedoBtn').style.display = 'inline-block';
        }
    },

    redoRecording() {
        this.editor.audioBlob = null;
        this.editor.audioBase64 = null;
        this.editor.audioDuration = 0;
        $('voicePlayBtn').style.display = 'none';
        $('voiceRedoBtn').style.display = 'none';
        const btn = $('voiceRecordBtn');
        btn.querySelector('.vr-text').textContent = '开始录音';
        if (typeof showToast === 'function') showToast('已清除录音，可重新录制');
    },

    updateRecordTime() {
        const el = $('voiceTimeText');
        if (!el) return;
        const m = Math.floor(this.editor.recordSeconds / 60);
        const s = this.editor.recordSeconds % 60;
        el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    },

    playPreviewAudio() {
        if (!this.editor.audioBlob) return;
        const url = URL.createObjectURL(this.editor.audioBlob);
        const player = $('editorAudioPlayer');
        player.src = url;
        player.play();
    },

    /* === 播放已发布语音 === */
    playPostAudio(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post || !post.audioBase64) return;
        // 使用一个临时 audio 元素播放
        let player = document.getElementById('postAudioPlayer');
        if (!player) {
            player = document.createElement('audio');
            player.id = 'postAudioPlayer';
            document.body.appendChild(player);
        }
        if (player.src !== post.audioBase64) {
            player.src = post.audioBase64;
        }
        if (player.paused) {
            player.play();
        } else {
            player.pause();
        }
    },

    /* === 预览 === */
    showPreview() {
        const text = $('editorText').value.trim();
        if (!text && this.editor.emojis.length === 0 && !this.editor.audioBase64) {
            if (typeof showToast === 'function') showToast('请输入分享内容');
            return;
        }

        const nickname = $('editorNickname').value.trim() || '启知探索者';
        const tag = $('editorTagSelect').value;

        const previewPost = {
            id: 'preview',
            author: nickname,
            avatar: this.avatar,
            content: text || '(无文字内容)',
            emojis: [...this.editor.emojis],
            audioBase64: this.editor.audioBase64,
            audioDuration: this.editor.audioDuration,
            knowledgeTag: tag,
            timestamp: Date.now(),
            likes: 0,
            liked: false
        };

        const overlay = document.getElementById('shareOverlay');
        const previewHTML = `
            <div class="share-preview" onclick="event.stopPropagation()">
                <div class="preview-header">
                    <button class="editor-close" id="previewBack">← 返回编辑</button>
                    <h3>👁️ 预览效果</h3>
                    <div></div>
                </div>
                <div class="preview-label">发布后将这样展示：</div>
                <div class="preview-post-wrap">
                    ${this.renderPost(previewPost)}
                </div>
                <button class="editor-publish-btn" id="previewPublish">📢 确认发布</button>
            </div>
        `;

        const currentHTML = overlay.querySelector('.share-editor');
        if (currentHTML) currentHTML.style.display = 'none';
        const previewDiv = document.createElement('div');
        previewDiv.innerHTML = previewHTML;
        overlay.appendChild(previewDiv.firstElementChild);

        $('previewBack').addEventListener('click', () => {
            const preview = overlay.querySelector('.share-preview');
            if (preview) preview.remove();
            if (currentHTML) currentHTML.style.display = '';
        });

        $('previewPublish').addEventListener('click', () => this.publish());
    },

    /* === 发布 === */
    publish() {
        const text = $('editorText').value.trim();
        if (!text && this.editor.emojis.length === 0 && !this.editor.audioBase64) {
            if (typeof showToast === 'function') showToast('请输入分享内容');
            return;
        }

        const nickname = $('editorNickname').value.trim() || '启知探索者';
        const tag = $('editorTagSelect').value;

        // 保存网名
        this.nickname = nickname;
        this.save();

        const post = {
            id: 'post_' + Date.now(),
            author: nickname,
            avatar: this.avatar,
            content: text || '(分享了语音)',
            emojis: [...this.editor.emojis],
            audioBase64: this.editor.audioBase64,
            audioDuration: this.editor.audioDuration,
            knowledgeTag: tag,
            timestamp: Date.now(),
            likes: 0,
            liked: false
        };

        this.posts.unshift(post);
        this.save();
        this.closeEditor();

        // 状态反馈
        if (typeof showToast === 'function') showToast('🎉 分享发布成功！');

        // 奖励经验
        if (typeof State !== 'undefined') {
            State.user.totalExpEarned += 2;
            State.user.availableExp += 2;
            if (typeof updateLevel === 'function') updateLevel();
            if (typeof saveState === 'function') saveState();
            if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
        }

        // 刷新分享列表
        this.render();
    },

    /* === 点赞 === */
    toggleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        if (post.liked) {
            post.liked = false;
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.liked = true;
            post.likes++;
        }
        this.save();
        this.render();
    },

    /* === 关闭编辑器 === */
    closeEditor() {
        // 停止录音
        if (this.editor.recording) this.stopRecording();
        this.resetEditor();
        const overlay = document.getElementById('shareOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.innerHTML = '';
        }
    },

    resetEditor() {
        this.editor.text = '';
        this.editor.emojis = [];
        this.editor.audioBlob = null;
        this.editor.audioBase64 = null;
        this.editor.audioDuration = 0;
    },

    /* === 工具函数 === */
    formatTime(ts) {
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 60) return '刚刚';
        if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
        const d = new Date(ts);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
