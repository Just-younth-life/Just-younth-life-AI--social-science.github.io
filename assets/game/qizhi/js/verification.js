/* ============================================
   启知·任务验证系统
   三种验证方式：self(自确认) / quiz(小测验) / timed(计时阅读)
   ============================================ */

const VerificationEngine = {
    // 为知识片段生成小测验
    generateQuiz(knowledgeItem) {
        if (!knowledgeItem || !knowledgeItem.content) return null;
        const content = knowledgeItem.content;
        // 从知识内容中提取关键词生成判断题
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 5);
        if (sentences.length === 0) return null;

        const correctSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();
        if (correctSentence.length < 5) return null;

        // 生成判断题 - 50% 概率为正确陈述
        const isTrue = Math.random() > 0.5;
        let question;
        if (isTrue) {
            question = correctSentence;
        } else {
            question = this.createFalseStatement(correctSentence);
            // 如果无法生成错误陈述，退化为正确陈述
            if (question === correctSentence) {
                return null; // 跳过此题
            }
        }

        return {
            type: 'truefalse',
            question: `判断对错：${question}`,
            options: ['✅ 正确', '❌ 错误'],
            answer: isTrue ? 0 : 1,
            explanation: knowledgeItem.title + '：' + knowledgeItem.content
        };
    },

    // 将正确陈述转换为错误陈述
    createFalseStatement(sentence) {
        // 替换词对（反义词/干扰词）
        const replacements = [
            ['增加', '减少'], ['提高', '降低'], ['上升', '下降'],
            ['分钟', '小时'], ['小时', '分钟'], ['年', '月'], ['月', '年'],
            ['以上', '以下'], ['以下', '以上'], ['可以', '禁止'],
            ['正确', '错误'], ['安全', '危险'], ['有效', '无效'],
            ['必须', '无需'], ['定期', '偶尔'], ['立即', '延迟'],
            ['高', '低'], ['多', '少'], ['快', '慢'],
            ['三大', '五大'], ['三种', '五种'], ['三个', '五个'],
            ['每日', '每周'], ['每次', '偶尔'], ['重要', '无关'],
            ['有助于', '有害于'], ['保护', '危害'], ['预防', '导致']
        ];

        for (const [key, val] of replacements) {
            if (sentence.includes(key)) {
                return sentence.replace(key, val);
            }
        }

        // 回退策略：在合适位置添加/移除否定词
        if (sentence.includes('不')) {
            return sentence.replace('不', '');
        }
        // 在动词前添加"不"
        const verbs = ['是', '有', '能', '会', '要', '应', '可', '需', '为', '属于'];
        for (const v of verbs) {
            if (sentence.includes(v)) {
                const idx = sentence.indexOf(v);
                return sentence.slice(0, idx) + '不' + sentence.slice(idx);
            }
        }

        // 最后回退：调换数量词
        const numMatch = sentence.match(/(\d+)/);
        if (numMatch) {
            const num = parseInt(numMatch[1]);
            const newNum = num === 0 ? 1 : num + 1;
            return sentence.replace(numMatch[1], String(newNum));
        }

        return sentence; // 无法修改
    },

    // 渲染验证UI
    render(task, container, callbacks) {
        const verifyType = task.verifyType || 'confirm';
        container.innerHTML = '';

        if (verifyType === 'quiz') {
            this._renderQuiz(task, container, callbacks);
        } else if (verifyType === 'timed') {
            this._renderTimed(task, container, callbacks);
        } else {
            this._renderSelfConfirm(task, container, callbacks);
        }
    },

    _renderQuiz(task, container, callbacks) {
        // 选择一个知识片段
        const k = task.knowledge[Math.floor(Math.random() * task.knowledge.length)];
        const quiz = this.generateQuiz(k);
        if (!quiz) {
            this._renderSelfConfirm(task, container, callbacks);
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'verify-box verify-quiz';
        wrapper.innerHTML = `
            <div class="verify-header">
                <span class="verify-badge">📝 知识小测验</span>
                <span class="verify-hint">答对即可完成打卡</span>
            </div>
            <div class="verify-question">${quiz.question}</div>
            <div class="verify-options">
                ${quiz.options.map((opt, i) => `
                    <button class="verify-option" data-idx="${i}">${opt}</button>
                `).join('')}
            </div>
            <div class="verify-explanation" style="display:none;"></div>
        `;

        container.appendChild(wrapper);

        const options = wrapper.querySelectorAll('.verify-option');
        let answered = false;
        options.forEach(btn => {
            btn.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                const idx = parseInt(btn.dataset.idx);
                const isCorrect = idx === quiz.answer;
                btn.classList.add(isCorrect ? 'correct' : 'wrong');

                const explanation = wrapper.querySelector('.verify-explanation');
                explanation.style.display = 'block';
                if (isCorrect) {
                    explanation.innerHTML = `<div class="exp-correct">🎉 回答正确！</div><div class="exp-content">${quiz.explanation}</div>`;
                    if (typeof ErrorReview !== 'undefined') ErrorReview.recordCorrect();
                    setTimeout(() => callbacks.onVerified(), 1200);
                } else {
                    explanation.innerHTML = `<div class="exp-wrong">❌ 答案有误，正确答案是「${quiz.options[quiz.answer]}」</div><div class="exp-content">${quiz.explanation}</div>`;
                    // 记录错题
                    if (typeof ErrorReview !== 'undefined') {
                        ErrorReview.record({
                            taskId: task.id,
                            taskTitle: task.title,
                            audience: task.audience || State.audience,
                            difficulty: task.difficulty || 'easy',
                            subject: task.source || '',
                            sourceUrl: task.sourceUrl || '',
                            knowledgePoint: task.knowledge && task.knowledge[0] ? task.knowledge[0].title : '',
                            question: quiz.question,
                            userAnswer: quiz.options[idx],
                            correctAnswer: quiz.options[quiz.answer],
                            knowledge: task.knowledge || []
                        });
                    }
                    // 答错可以重试
                    answered = false;
                    setTimeout(() => {
                        options.forEach(b => b.classList.remove('correct', 'wrong'));
                        explanation.style.display = 'none';
                    }, 2000);
                }
            });
        });
    },

    _renderTimed(task, container, callbacks) {
        const duration = 8; // 8秒阅读计时
        const wrapper = document.createElement('div');
        wrapper.className = 'verify-box verify-timed';

        wrapper.innerHTML = `
            <div class="verify-header">
                <span class="verify-badge">📖 精读挑战</span>
                <span class="verify-hint">认真阅读后完成打卡</span>
            </div>
            <div class="verify-timer">
                <div class="timer-circle" style="--progress: 0;">
                    <span class="timer-num">${duration}</span>
                </div>
                <span class="timer-label">阅读中...</span>
            </div>
            <div class="verify-knowledge">
                ${task.knowledge.map(k => `
                    <div class="knowledge-item">
                        <div class="knowledge-title">${k.title}</div>
                        <div class="knowledge-content">${k.content}</div>
                    </div>
                `).join('')}
            </div>
            <button class="verify-submit" disabled>我已认真阅读，完成打卡</button>
        `;

        container.appendChild(wrapper);

        const timerNum = wrapper.querySelector('.timer-num');
        const timerCircle = wrapper.querySelector('.timer-circle');
        const submitBtn = wrapper.querySelector('.verify-submit');
        let remaining = duration;

        const interval = setInterval(() => {
            remaining--;
            timerNum.textContent = remaining;
            const progress = ((duration - remaining) / duration) * 100;
            timerCircle.style.setProperty('--progress', progress);

            if (remaining <= 0) {
                clearInterval(interval);
                submitBtn.disabled = false;
                submitBtn.classList.add('ready');
                timerCircle.style.opacity = '0.5';
                timerNum.textContent = '✓';
            }
        }, 1000);

        submitBtn.addEventListener('click', () => {
            if (!submitBtn.disabled) {
                callbacks.onVerified();
            }
        });
    },

    _renderSelfConfirm(task, container, callbacks) {
        const wrapper = document.createElement('div');
        wrapper.className = 'verify-box verify-self';

        // 展开显示知识
        const knowledgeHTML = task.knowledge.map((k, i) => `
            <div class="knowledge-item" style="${i > 0 ? 'display:none;' : ''}">
                <div class="knowledge-title">${k.title}</div>
                <div class="knowledge-content">${k.content}</div>
            </div>
        `).join('');

        const showMore = task.knowledge.length > 1 ? `
            <button class="knowledge-more" id="knowledgeMore">查看更多知识（${task.knowledge.length - 1}）▼</button>
        ` : '';

        wrapper.innerHTML = `
            <div class="verify-header">
                <span class="verify-badge">✅ 自确认</span>
                <span class="verify-hint">完成任务后点击打卡</span>
            </div>
            <div class="verify-knowledge compact">
                ${knowledgeHTML}
                ${showMore}
            </div>
            <button class="verify-confirm">我已完成，打卡 +1</button>
        `;

        container.appendChild(wrapper);

        const moreBtn = wrapper.querySelector('#knowledgeMore');
        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                const items = wrapper.querySelectorAll('.knowledge-item');
                const hidden = Array.from(items).filter(i => i.style.display === 'none');
                if (hidden.length > 0) {
                    hidden.forEach(item => item.style.display = 'block');
                    moreBtn.textContent = '收起 ▲';
                } else {
                    items.forEach((item, i) => {
                        item.style.display = i === 0 ? 'block' : 'none';
                    });
                    moreBtn.textContent = `查看更多知识（${task.knowledge.length - 1}）▼`;
                }
            });
        }

        wrapper.querySelector('.verify-confirm').addEventListener('click', () => {
            callbacks.onVerified();
        });
    }
};
