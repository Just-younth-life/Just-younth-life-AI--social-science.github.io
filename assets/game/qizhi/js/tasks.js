/* ============================================
   启知·任务数据库
   每个任务配 3-5 条 rotating 科普知识片段
   验证类型：quiz(小测验) / confirm(自确认) / timed(计时阅读)
   ============================================ */

const TASK_DATABASE = {
    elderly: {
        easy: [
            { id: 'e_e_1', icon: '🧯', title: '看一眼家里灭火器的位置', desc: '知道它在哪里，危险时才能第一时间取用', duration: '约 10 秒', tag: '轻松', source: '应急管理部消防救援局', sourceUrl: 'https://www.119.gov.cn/', verifyType: 'confirm',
              knowledge: [{title:'🔍 灭火器检查要点',content:'干粉灭火器有效期5年，压力表指针在绿区为正常。建议每3个月检查一次。'},{title:'📍 家庭必备灭火器位置',content:'厨房门口、卧室门口、阳台各放一个最安全，切勿放在灶台旁或高温区域。'},{title:'💡 使用口诀：提、拔、握、压',content:'提起灭火器，拔掉保险销，握住喷管，对准火焰根部压下手把。'}]},
            { id: 'e_e_2', icon: '🔌', title: '检查一下家里插座有没有松动', desc: '松动的插座可能引发火灾隐患', duration: '约 15 秒', tag: '轻松', source: '全国安全用电科普', sourceUrl: 'https://www.kepu.cn/', verifyType: 'confirm',
              knowledge: [{title:'⚠️ 插座松动的危害',content:'接触不良会导致电阻增大、温度升高，长时间可能引发火灾。'},{title:'🔧 简易检查方法',content:'关闭电源后，检查插座是否有烧焦痕迹、黄渍或塑料变形。发现异常及时更换。'},{title:'📅 插座使用寿命',content:'普通插座使用寿命约8-10年，大功率插座（如空调）建议5年更换。'}]},
            { id: 'e_e_4', icon: '🚶', title: '散步时看 1 张小区反诈科普海报', desc: '留意海报上的常见诈骗手法', duration: '约 30 秒', tag: '轻松', source: '国家反诈中心', sourceUrl: 'https://www.gjfzzx.cn/', verifyType: 'quiz',
              knowledge: [{title:'🎯 常见诈骗类型',content:'冒充公检法诈骗、保健品诈骗、电信欠费诈骗是针对老年人的三大高发骗术。'},{title:'🛡️ 防诈骗三原则',content:'陌生来电不要轻信、不要透露个人信息、不要转账汇款。挂断后拨打110核实。'},{title:'📱 国家反诈中心APP',content:'下载国家反诈中心APP，开启来电预警功能，可以自动识别诈骗电话。'}]},
            { id: 'e_e_6', icon: '💊', title: '确认一下常备药品的有效期', desc: '过期药品不能服用哦', duration: '约 20 秒', tag: '轻松', source: '国家药品监督管理局', sourceUrl: 'https://www.nmpa.gov.cn/', verifyType: 'confirm',
              knowledge: [{title:'📅 药品有效期怎么看',content:'药品包装上的"有效期至"指最后可用日期，超过此日期药品效价会下降。'},{title:'🗑️ 过期药品危害',content:'过期药品可能分解产生有害物质，轻则无效延误治疗，重则引起过敏或中毒。'},{title:'💊 家庭常备药清单',content:'建议常备：降压药、降糖药、感冒药、止痛药、创可贴、体温计。'}]},
            { id: 'e_e_10', icon: '🧴', title: '涂抹防晒霜再出门', desc: '紫外线对皮肤的伤害不容忽视', duration: '约 15 秒', tag: '轻松', source: '中国健康教育中心', sourceUrl: 'https://www.chinahealth.cn/', verifyType: 'confirm',
              knowledge: [{title:'☀️ 紫外线的危害',content:'长期紫外线照射会导致皮肤老化、色斑形成，增加皮肤癌风险。'},{title:'📊 SPF值怎么选',content:'日常选SPF30+，户外活动选SPF50+。每2小时补涂一次。'},{title:'🌤️ 阴天也要防晒',content:'阴天紫外线仍有晴天的40%，即使多云天气也需要防晒。'}]}
        ],
        normal: [
            { id: 'e_n_1', icon: '🔍', title: '查一下 AI 换脸诈骗的常见套路', desc: '了解诈骗手法，才能有效防范', duration: '约 2 分钟', tag: '普通', source: '公安部网络安全保卫局', sourceUrl: 'https://www.mps.gov.cn/', verifyType: 'quiz',
              knowledge: [{title:'🎭 什么是AI换脸诈骗',content:'犯罪分子用AI技术伪造亲友视频，通过社交软件发送"视频通话"实施诈骗。'},{title:'🛑 如何识别换脸视频',content:'注意观察：面部边缘是否有闪烁、眨眼是否同步、光影是否自然。可疑时挂断重拨。'},{title:'✅ 防范要点',content:'接到"亲友视频求助"一律提高警惕，通过其他方式核实身份后再决定是否转账。'}]},
            { id: 'e_n_3', icon: '🏥', title: '了解社区附近的医院和诊所位置', desc: '紧急情况下能快速找到就医地点', duration: '约 2 分钟', tag: '普通', source: '国家卫生健康委员会', sourceUrl: 'https://www.nhc.gov.cn/', verifyType: 'quiz',
              knowledge: [{title:'🏥 社区医院能做什么',content:'常见病诊疗、慢病管理、疫苗接种、健康体检，大部分问题可在社区医院解决。'},{title:'🚑 急救电话：120',content:'遇到紧急医疗情况，第一时间拨打120急救电话，说明地址、病情、人数。'},{title:'📋 就医前准备',content:'准备好身份证、医保卡、既往病历、在服药物清单，节省就诊时间。'}]},
            { id: 'e_n_7', icon: '💨', title: '检查家中燃气管道是否漏气', desc: '用肥皂水检测，安全用气', duration: '约 2 分钟', tag: '普通', source: '住房和城乡建设部', sourceUrl: 'https://www.mohurd.gov.cn/', verifyType: 'quiz',
              knowledge: [{title:'🧪 肥皂水检测法',content:'用洗洁精加水涂在管道连接处，开燃气后观察30秒，冒泡的地方就是漏气点。'},{title:'🚨 漏气应急处理',content:'立即关闭燃气总阀、开窗通风、切勿开关任何电器、到室外安全处打电话报修。'},{title:'🔧 定期检查周期',content:'燃气软管建议18个月更换，金属波纹管可用8-10年。'}]}
        ],
        advanced: [
            { id: 'e_a_1', icon: '🎓', title: '给家里人讲 1 个反诈小技巧', desc: '把你学到的知识分享给家人', duration: '约 3 分钟', tag: '进阶', verifyType: 'confirm',
              knowledge: [{title:'💬 分享话术示例',content:'爸妈，如果有人打电话说让你们转账，千万别信！先挂电话打110问问。'},{title:'📖 推荐学习材料',content:'可以一起看央视《今日说法》、社区宣传栏的反诈海报，或者下载国家反诈中心APP。'}]}
        ]
    },

    youth: {
        easy: [
            { id: 'y_e_1', icon: '🎨', title: '分辨 1 张 AI 生成的图片', desc: '看看你能不能识别出 AI 的杰作', duration: '约 30 秒', tag: '轻松', source: '中国人工智能学会', sourceUrl: 'http://www.caai.cn/', verifyType: 'quiz',
              knowledge: [{title:'🤖 AI图常见特征',content:'手指畸形、眼睛不对称、背景纹理模糊、文字乱码是AI生成图片的常见破绽。'},{title:'🔍 快速检测工具',content:'可以用Google反向图片搜索、或使用AI图片检测工具如"AI or Not"进行识别。'},{title:'⚖️ 为什么重要',content:'识别AI图片能避免被虚假信息误导，在社交媒体上尤其重要。'}]},
            { id: 'y_e_2', icon: '📱', title: '清理 1 次手机里的陌生 App', desc: '删掉不认识的应用，释放空间', duration: '约 1 分钟', tag: '轻松', source: '国家互联网应急中心', sourceUrl: 'https://www.cert.org.cn/', verifyType: 'confirm',
              knowledge: [{title:'⚠️ 陌生APP的风险',content:'来路不明的APP可能窃取个人信息、恶意扣费、甚至远程控制手机。'},{title:'📱 卸载前检查',content:'先查看APP获取了哪些权限（位置、通讯录、相册等），记录重要数据后再卸载。'},{title:'🔒 权限管理',content:'定期检查手机权限管理，关闭不必要的APP权限，如位置、麦克风等。'}]},
            { id: 'y_e_3', icon: '🔒', title: '检查一下社交账号的隐私设置', desc: '保护你的个人信息安全', duration: '约 1 分钟', tag: '轻松', verifyType: 'confirm',
              knowledge: [{title:'🛡️ 隐私设置要点',content:'将个人资料设为仅好友可见，关闭陌生人搜索，限制位置信息分享。'},{title:'📝 重要原则',content:'你在网上发布的任何内容都可能被截图保存，不要发布隐私信息。'},{title:'🔐 双重验证',content:'开启登录双重验证（短信/验证器），大幅提升账号安全性。'}]},
            { id: 'y_e_4', icon: '🌐', title: '了解一个你感兴趣的 AI 工具', desc: 'AI 可以做很多有趣的事情', duration: '约 1 分钟', tag: '轻松', verifyType: 'timed',
              knowledge: [{title:'🎨 AI创意工具',content:'Midjourney生成艺术图片、Runway制作视频、Suno创作音乐，都是AI创意利器。'},{title:'📚 AI学习工具',content:'Khanmigo AI家教、Photomath数学助手、Duolingo AI语言学习助手。'},{title:'💡 AI编程工具',content:'GitHub Copilot、Codeium可以辅助编程，让学习更高效。'}]}
        ],
        normal: [
            { id: 'y_n_2', icon: '💡', title: '了解 AI 语音合成的基本原理', desc: '知道 AI 是怎么"说话"的', duration: '约 3 分钟', tag: '普通', verifyType: 'timed',
              knowledge: [{title:'🔊 TTS技术',content:'Text To Speech技术通过深度学习模型，将文字转换为自然流畅的语音。'},{title:'⚠️ 语音合成风险',content:'AI语音可以克隆任何人的声音，接到"亲友语音"求助电话务必核实身份。'},{title:'🛡️ 保护自己的声音',content:'不要在社交媒体发布清晰的个人语音，以免被恶意克隆。'}]},
            { id: 'y_n_5', icon: '🔬', title: '了解一个最新的科技前沿', desc: '比如量子计算或脑机接口', duration: '约 3 分钟', tag: '普通', verifyType: 'quiz',
              knowledge: [{title:'🧠 脑机接口（BCI）',content:'脑机接口技术可以直接读取大脑信号，帮助瘫痪患者用意念控制设备。'},{title:'⚛️ 量子计算',content:'量子计算机利用量子比特进行运算，在某些问题上比经典计算机快亿万倍。'},{title:'🌱 AI大模型最新进展',content:'2024年最火的是多模态大模型，能同时理解文字、图片、视频，甚至生成3D内容。'}]}
        ]
    },

    middle: {
        easy: [
            { id: 'm_e_1', icon: '🔐', title: '检查 1 个办公 App 的隐私权限', desc: '看看哪些权限是不必要的', duration: '约 1 分钟', tag: '轻松', source: '全国信息安全标准化技术委员会', sourceUrl: 'https://www.cesi.cn/', verifyType: 'confirm',
              knowledge: [{title:'🔍 如何检查权限',content:'设置→隐私→权限管理，逐个APP检查已授权的权限项。'},{title:'⚠️ 常见过度权限',content:'日历、通讯录、位置、相册访问是最常被滥用的权限。'},{title:'✅ 最小权限原则',content:'只授予APP完成其功能所必需的权限，定期审查并撤销不必要的授权。'}]},
            { id: 'm_e_5', icon: '🏠', title: '记一下家里燃气的检查周期', desc: '定期检查，安全用气', duration: '约 30 秒', tag: '轻松', verifyType: 'confirm',
              knowledge: [{title:'📅 家用燃气检查周期',content:'胶管每18个月更换，金属波纹管8-10年，燃气报警器每5年。'},{title:'🗓️ 月度自查清单',content:'1. 闻味检测 2. 检查胶管 3. 查看灶具 4. 清洁灶具。'},{title:'🔧 专业检测',content:'建议每年请燃气公司进行一次专业安全检查。'}]},
            { id: 'm_e_6', icon: '☕', title: '喝口水，站起来活动 5 分钟', desc: '久坐伤身，劳逸结合', duration: '约 5 分钟', tag: '轻松', verifyType: 'confirm',
              knowledge: [{title:'⚠️ 久坐的危害',content:'每天久坐8小时以上，心血管疾病风险增加35%，糖尿病风险增加20%。'},{title:'💪 微运动建议',content:'每45分钟起身，做5分钟拉伸、走动或站立，就能显著降低健康风险。'},{title:'🏃 通勤小技巧',content:'提前一站下车步行，或骑自行车通勤，不知不觉增加运动量。'}]}
        ],
        normal: [
            { id: 'm_n_1', icon: '🤖', title: '用 AI 工具优化 1 条工作消息', desc: '让沟通更高效专业', duration: '约 2 分钟', tag: '普通', verifyType: 'quiz',
              knowledge: [{title:'✍️ AI改写技巧',content:'把原消息粘贴给AI，明确要求：语气、长度、目标受众，效果更佳。'},{title:'💡 实用提示词',content:'"帮我把这段话改写得更专业、简洁，适合发给客户"——这样的prompt最有效。'},{title:'🔍 常见AI工具',content:'Grammarly做英文润色、文心一言做中文优化、Notion AI做内容整理。'}]},
            { id: 'm_n_3', icon: '💊', title: '了解一种常见职业病的预防方法', desc: '颈椎、腰椎、视力都需要关注', duration: '约 3 分钟', tag: '普通', verifyType: 'timed',
              knowledge: [{title:'🦵 腰椎间盘突出',content:'久坐族高发，每45分钟起身活动，保持正确坐姿，核心肌群锻炼很重要。'},{title:'👀 干眼症',content:'长时间盯屏幕眨眼减少，遵循20-20-20法则：每20分钟看20英尺外20秒。'},{title:'🌀 颈椎病',content:'头部每小时做"米"字操，配合颈部热敷和专业理疗可有效预防。'}]}
        ]
    },

    general: {
        easy: [
            { id: 'g_e_1', icon: '🎯', title: '知道 1 个 AI 语音诈骗的特征', desc: '陌生来电让你转账就是诈骗', duration: '约 10 秒', tag: '轻松', source: '国家反诈中心', sourceUrl: 'https://www.gjfzzx.cn/', verifyType: 'quiz',
              knowledge: [{title:'⚠️ AI语音诈骗特征',content:'陌生来电+紧迫语气+要求转账=100%是诈骗！'},{title:'🛡️ 识别方法',content:'听声音是否有机械感、断句异常；提到"安全账户""资金冻结"立即挂断。'},{title:'📞 正确做法',content:'挂断后拨打96110反诈专线或110核实，切勿按对方要求操作。'}]},
            { id: 'g_e_2', icon: '📦', title: '确认一下家里急救包的位置', desc: '紧急情况能第一时间找到', duration: '约 15 秒', tag: '轻松', source: '国家应急广播', sourceUrl: 'https://www.cneb.gov.cn/', verifyType: 'confirm',
              knowledge: [{title:'📋 急救包必备物品',content:'创可贴、碘伏棉签、退烧药、止血带、绷带、体温计、应急药品。'},{title:'📦 放置位置',content:'放在全家人都知道、随手可拿的地方，如玄关柜、客厅抽屉。'},{title:'🔄 定期检查',content:'每3个月检查一次，补充消耗品，更换过期药品。'}]},
            { id: 'g_e_4', icon: '🔥', title: '检查一下厨房电器的使用安全', desc: '人走断电，安全用气', duration: '约 20 秒', tag: '轻松', verifyType: 'confirm',
              knowledge: [{title:'⚠️ 厨房安全守则',content:'使用燃气时不离人，饭后立即关闭燃气总阀。'},{title:'🔌 电器安全',content:'电水壶、电饭煲等用完拔插头，清理周围的纸屑等易燃物。'},{title:'🧯 厨房必备',content:'厨房应配备一个小型灭火器和灭火毯，放在易取位置。'}]},
            { id: 'g_e_5', icon: '📱', title: '给手机设置一个复杂密码', desc: '更好地保护个人信息', duration: '约 1 分钟', tag: '轻松', verifyType: 'confirm',
              knowledge: [{title:'🔐 密码强度建议',content:'至少12位，包含大小写字母、数字和符号，不要用生日、手机号做密码。'},{title:'👆 生物识别',content:'指纹和面容ID比数字密码更便捷安全，建议开启。'},{title:'📱 锁屏安全',content:'设置自动锁屏时间不超过5分钟，开启SIM卡锁。'}]},
            { id: 'g_e_9', icon: '🌈', title: '抬头看看今天的天空', desc: '发现身边的美好', duration: '约 5 秒', tag: '轻松', verifyType: 'confirm',
              knowledge: [{title:'☁️ 云的科学',content:'云由水蒸气凝结而成，高云族(卷云)、中云族(高积云)、低云族(层积云)预示不同天气。'},{title:'🌅 天空的颜色',content:'瑞利散射让天空呈蓝色，日出日落的红色来自光穿过更厚的大气。'},{title:'🌫️ 空气质量',content:'抬头看天，如果看不到蓝天，可能是PM2.5超标，建议减少户外活动。'}]}
        ],
        normal: [
            { id: 'g_n_2', icon: '🤖', title: '了解 AI 深度学习的基本概念', desc: 'AI 时代的必备常识', duration: '约 3 分钟', tag: '普通', verifyType: 'timed',
              knowledge: [{title:'🧠 什么是深度学习',content:'模拟人脑神经元连接方式的机器学习方法，通过大量数据自动学习规律。'},{title:'📚 与传统编程的区别',content:'传统编程：人写规则给机器。深度学习：机器从数据中学规则。'},{title:'🚀 应用领域',content:'图像识别、语音助手、自动驾驶、自然语言处理都基于深度学习。'}]},
            { id: 'g_n_3', icon: '🛡️', title: '检查手机是否开启双重验证', desc: '为账户加一道安全防线', duration: '约 2 分钟', tag: '普通', verifyType: 'quiz',
              knowledge: [{title:'🔐 双重验证是什么',content:'登录时除了密码，还需要输入手机短信或验证器生成的6位验证码。'},{title:'📱 推荐验证器',content:'Google Authenticator、Microsoft Authenticator、1Password都支持TOTP验证。'},{title:'✅ 必须开启的账号',content:'邮箱、银行、社交、云服务账号务必开启双重验证。'}]},
            { id: 'g_n_4', icon: '🌡️', title: '了解一种常见传染病的预防方法', desc: '健康是最大的财富', duration: '约 3 分钟', tag: '普通', verifyType: 'timed',
              knowledge: [{title:'🤧 流感预防',content:'勤洗手、戴口罩、保持通风、避免聚集，每年接种流感疫苗。'},{title:'🦠 诺如病毒',content:'注意饮食卫生，生熟分开，勤洗手，出现症状及时就医。'},{title:'📊 疫苗接种',content:'遵循国家免疫规划，按时接种各类疫苗是预防传染病最有效方法。'}]}
        ],
        advanced: [
            { id: 'g_a_1', icon: '🧠', title: '分享一个你今天学到的科普知识', desc: '知识分享让世界更美好', duration: '约 5 分钟', tag: '进阶', verifyType: 'confirm',
              knowledge: [{title:'💬 分享的好处',content:'分享知识能加深自己的理解，还能帮助他人，形成良性的知识循环。'},{title:'👥 分享渠道',content:'可以在家庭群、朋友圈、同事间分享，也可以用短视频形式传播。'}]}
        ]
    }
};

// 社区温暖彩蛋任务（每日 1 条）
const EGG_TASKS = [
    { id: 'egg_1', icon: '👋', title: '和楼下网格员打个招呼', desc: '社区工作者每天都在默默守护我们', duration: '约 10 秒', tag: '彩蛋', verifyType: 'confirm',
      knowledge: [{title:'❤️ 感谢社区工作者',content:'网格员负责政策宣传、民生服务、矛盾调解，是社区治理的"最后一公里"。'}]},
    { id: 'egg_2', icon: '🏛️', title: '到科普梦工坊打卡 1 次', desc: '线下阵地等你来探索', duration: '约 5 分钟', tag: '彩蛋', verifyType: 'confirm',
      knowledge: [{title:'🏛️ 科普梦工坊是什么',content:'社区科普线下体验空间，提供AI体验、科学实验、健康检测等互动活动。'}]},
    { id: 'egg_3', icon: '🤝', title: '给邻居一个微笑或问候', desc: '远亲不如近邻', duration: '约 5 秒', tag: '彩蛋', verifyType: 'confirm',
      knowledge: [{title:'🌿 邻里关系的重要性',content:'良好的邻里关系能提升安全感、互助意识和社区归属感。'}]},
    { id: 'egg_4', icon: '🌺', title: '给家里或办公室添一盆绿植', desc: '小投入，大快乐', duration: '约 10 分钟', tag: '彩蛋', verifyType: 'confirm',
      knowledge: [{title:'🪴 植物的健康益处',content:'室内植物能净化空气、缓解压力、提升工作效率，是天然的"绿色疗愈"。'}]},
    { id: 'egg_5', icon: '❤️', title: '给家人一个大大的拥抱', desc: '爱要及时表达', duration: '约 10 秒', tag: '彩蛋', verifyType: 'confirm',
      knowledge: [{title:'🤗 拥抱的科学',content:'拥抱能促进催产素分泌，降低血压、减轻压力、增强亲密感。'}]}
];

// 福利兑换体系
const WELFARE_LIST = [
    { id: 'w_1', icon: '🅿️', name: '停车 1 小时抵扣券', cost: 50 },
    { id: 'w_2', icon: '🛒', name: '超市满 50 减 5 券', cost: 80 },
    { id: 'w_3', icon: '📚', name: '图书兑换券', cost: 120 },
    { id: 'w_4', icon: '🎬', name: '社区影院免费票', cost: 200 },
    { id: 'w_5', icon: '🧺', name: '生活用品礼包', cost: 300 },
    { id: 'w_6', icon: '🎨', name: '线下活动优先报名权', cost: 150 }
];

// 鼓励语库
const ENCOURAGEMENT_MSGS = [
    '今天又解锁一个生活小技能！',
    '科普打卡，点点滴滴都是收获',
    '启知之星就是你 ⭐',
    '知识改变生活，从点滴开始',
    '又是充实的一天！继续加油',
    '你的坚持让社区更美好',
    '科普达人就是你！',
    '完成 +1，知识储备 +1',
    '小任务，大意义',
    '每天进步一点点 📈'
];

// 等级经验表
const LEVEL_EXP_TABLE = [
    { level: 1, exp: 0, title: '科普新手' },
    { level: 2, exp: 10, title: '初学探索' },
    { level: 3, exp: 25, title: '求知若渴' },
    { level: 4, exp: 50, title: '小有成就' },
    { level: 5, exp: 80, title: '科普达人' },
    { level: 6, exp: 120, title: '知识先锋' },
    { level: 7, exp: 170, title: '社区之星' },
    { level: 8, exp: 230, title: '科普导师' },
    { level: 9, exp: 300, title: '智慧之光' },
    { level: 10, exp: 400, title: '科普大师' }
];

// 验证类型说明
const VERIFY_TYPES = {
    confirm: 'self',
    quiz: 'quiz',
    timed: 'timed'
};
