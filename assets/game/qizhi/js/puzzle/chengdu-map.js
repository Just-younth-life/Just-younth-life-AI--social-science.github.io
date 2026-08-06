/* ============================================
   启知 · 知识碎片拼图 — 成都地图数据
   - 手绘绘本风格 SVG 地图（锦江、区域、地标点）
   - 地标 = 拼图旅游点，含科普知识
   - 模块化：地标数据可扩展，不影响引擎
   ============================================ */

/* === 成都地标（拼图点位）===
 * x,y 为地图 viewBox(0 0 400 560) 坐标
 * 每个地标对应一片知识碎片
 */
const CHENGDU_LANDMARKS = [
    {
        id: 'tianfu_sq',
        name: '天府广场',
        en: 'Tianfu Square',
        x: 200, y: 280,
        district: '青羊区',
        icon: '🏛️',
        color: '#FF8A65',
        knowledge: {
            title: '城市心脏·天府广场',
            content: '天府广场是成都的地理与交通中心，太极云纹造型的雕塑寓意「天圆地方」。广场地下连通地铁1号线与2号线换乘枢纽，是西南最大的城市广场之一。'
        }
    },
    {
        id: 'chunxi_road',
        name: '春熙路',
        en: 'Chunxi Road',
        x: 238, y: 258,
        district: '锦江区',
        icon: '🛍️',
        color: '#E91E63',
        knowledge: {
            title: '百年商街·春熙路',
            content: '春熙路始建于1924年，得名于《道德经》「众人熙熙，如享太牢」。如今是西南最繁华的商业步行街，IFS 爬墙熊猫已成为城市新地标。'
        }
    },
    {
        id: 'kuanzhai',
        name: '宽窄巷子',
        en: 'Kuanzhai Alley',
        x: 152, y: 240,
        district: '青羊区',
        icon: '🏮',
        color: '#FFD54F',
        knowledge: {
            title: '少城遗韵·宽窄巷子',
            content: '宽窄巷子由宽巷子、窄巷子、井巷子三条平行老街组成，是清代「少城」格局的遗存。宽巷子闲生活、窄巷子慢生活、井巷子新生活，是成都院落文化的活化石。'
        }
    },
    {
        id: 'du_fu',
        name: '杜甫草堂',
        en: 'Du Fu Cottage',
        x: 108, y: 300,
        district: '青羊区',
        icon: '📜',
        color: '#81C784',
        knowledge: {
            title: '诗圣故居·杜甫草堂',
            content: '唐乾元二年（759年），杜甫流寓成都，于浣花溪畔结庐而居，写下《茅屋为秋风所破歌》等240余首诗作。草堂是中国文学史上的圣地，现为中国重点文物保护单位。'
        }
    },
    {
        id: 'wuhou',
        name: '武侯祠·锦里',
        en: 'Wuhou Shrine',
        x: 158, y: 350,
        district: '武侯区',
        icon: '⚔️',
        color: '#8D6E63',
        knowledge: {
            title: '三国圣地·武侯祠',
            content: '武侯祠始建于公元223年，是中国唯一的君臣合祀祠庙，纪念诸葛亮与刘备。毗邻的锦里古街复原明清川西民居风貌，是体验三国文化与市井生活的窗口。'
        }
    },
    {
        id: 'panda_base',
        name: '大熊猫基地',
        en: 'Panda Base',
        x: 264, y: 110,
        district: '成华区',
        icon: '🐼',
        color: '#4E342E',
        knowledge: {
            title: '国宝家园·熊猫基地',
            content: '成都大熊猫繁育研究基地位于斧头山，是世界最大的大熊猫圈养种群基地。大熊猫在地球上生存了至少800万年，被誉为「活化石」，属中国国家一级保护动物。'
        }
    },
    {
        id: 'jinsha',
        name: '金沙遗址',
        en: 'Jinsha Site',
        x: 118, y: 175,
        district: '青羊区',
        icon: '☀️',
        color: '#FFB300',
        knowledge: {
            title: '古蜀文明·金沙遗址',
            content: '金沙遗址距今约3000年，是继三星堆之后古蜀文明的又一高峰。「太阳神鸟」金饰为镇馆之宝，其图案被定为中国文化遗产标志，四鸟绕日寓意光明与团结。'
        }
    },
    {
        id: 'wangjiang',
        name: '望江楼',
        en: 'Wangjiang Tower',
        x: 278, y: 320,
        district: '武侯区',
        icon: '🎋',
        color: '#66BB6A',
        knowledge: {
            title: '锦江凤影·望江楼',
            content: '望江楼公园为纪念唐代女诗人薛涛而建，园内崇丽阁高39米，是成都标志性古建筑。薛涛制「薛涛笺」风行一时，园中遍植各类竹子逾200种，为竹类专类园。'
        }
    },
    {
        id: 'dujiangyan',
        name: '都江堰',
        en: 'Dujiangyan',
        x: 56, y: 88,
        district: '都江堰市',
        icon: '💧',
        color: '#4FC3F7',
        knowledge: {
            title: '千年水利·都江堰',
            content: '都江堰由战国李冰父子于公元前256年主持修建，是世界现存最古老的无坝引水工程。鱼嘴分水、飞沙堰排沙、宝瓶口引水，三大工程使成都平原「水旱从人」，号称天府。'
        }
    },
    {
        id: 'east_memory',
        name: '东郊记忆',
        en: 'East Memory',
        x: 320, y: 250,
        district: '成华区',
        icon: '🎸',
        color: '#BA68C8',
        knowledge: {
            title: '工业新生·东郊记忆',
            content: '东郊记忆前身为红光电子管厂，改造后保留工业遗存，融入音乐、戏剧、动漫等文创产业。它是成都城市更新与文化创意产业融合的代表，被誉为「中国的伦敦西区」。'
        }
    }
];

/* === 地图 SVG 生成 ===
 * 绘本手绘风：有机色块 + 锦江水系 + 区域底纹
 */
function renderChengduMapSVG() {
    return `
<svg id="puzzleMapSVG" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;touch-action:none;">
    <defs>
        <!-- 纸张纹理 -->
        <pattern id="paperTex" patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill="#FFFBF0"/>
            <circle cx="8" cy="12" r="0.6" fill="#D7CCC8" opacity="0.4"/>
            <circle cx="28" cy="30" r="0.5" fill="#D7CCC8" opacity="0.3"/>
        </pattern>
        <!-- 水波渐变 -->
        <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#81D4FA"/>
            <stop offset="100%" stop-color="#4FC3F7"/>
        </linearGradient>
        <!-- 区域底纹 -->
        <pattern id="dotTex" patternUnits="userSpaceOnUse" width="14" height="14">
            <rect width="14" height="14" fill="none"/>
            <circle cx="7" cy="7" r="1.1" fill="#BCAAA4" opacity="0.25"/>
        </pattern>
    </defs>

    <!-- 纸张底 -->
    <rect x="0" y="0" width="400" height="560" fill="url(#paperTex)" rx="20"/>

    <!-- 标题 -->
    <text x="200" y="32" text-anchor="middle" font-family="'LXGW WenKai','KaiTi',serif" font-size="20" font-weight="700" fill="#4E342E">成都 · 知识碎片地图</text>
    <path d="M120 42 Q200 36 280 42" stroke="#FF8A65" stroke-width="2.5" stroke-linecap="round" fill="none"/>

    <!-- 区域色块（有机手绘感）-->
    <g stroke="#4E342E" stroke-width="2.5" stroke-linejoin="round" fill-opacity="0.55">
        <!-- 西北 上风 -->
        <path d="M40 60 Q90 50 140 70 Q180 90 160 140 Q120 160 70 150 Q30 130 40 60Z" fill="#C8E6C9"/>
        <!-- 东北 -->
        <path d="M180 60 Q260 50 340 70 Q360 120 320 170 Q250 180 200 150 Q170 110 180 60Z" fill="#FFF9C4"/>
        <!-- 中部 -->
        <path d="M120 160 Q200 150 280 170 Q300 230 250 280 Q180 290 120 260 Q90 210 120 160Z" fill="#FFE0B2"/>
        <!-- 西南 -->
        <path d="M60 200 Q110 190 140 240 Q130 320 80 360 Q40 330 50 270 Q40 230 60 200Z" fill="#FFCCBC"/>
        <!-- 东南 -->
        <path d="M250 200 Q330 190 360 250 Q370 340 320 400 Q250 410 220 340 Q210 270 250 200Z" fill="#E1BEE7"/>
        <!-- 南部 -->
        <path d="M120 320 Q220 310 300 350 Q310 430 220 470 Q120 460 90 400 Q80 350 120 320Z" fill="#B2DFDB"/>
    </g>

    <!-- 点纹底纹叠加 -->
    <rect x="0" y="60" width="400" height="480" fill="url(#dotTex)" rx="18" pointer-events="none"/>

    <!-- 锦江水系（手绘蜿蜒）-->
    <path d="M30 100 Q80 140 120 180 Q160 230 180 280 Q200 340 230 380 Q280 430 340 460"
          stroke="url(#riverGrad)" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M30 100 Q80 140 120 180 Q160 230 180 280 Q200 340 230 380 Q280 430 340 460"
          stroke="#4FC3F7" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- 水波纹 -->
    <g stroke="#0288D1" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round">
        <path d="M70 130 q6 -4 12 0 t12 0"/>
        <path d="M150 210 q6 -4 12 0 t12 0"/>
        <path d="M210 330 q6 -4 12 0 t12 0"/>
        <path d="M290 420 q6 -4 12 0 t12 0"/>
    </g>

    <!-- 装饰：山丘（西北都江堰方向）-->
    <path d="M20 70 Q40 50 60 70 Q80 50 100 70" stroke="#81C784" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M30 80 Q50 64 70 80" stroke="#81C784" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- 装饰：小树 -->
    <g stroke="#4E342E" stroke-width="2" stroke-linejoin="round">
        <path d="M340 90 L345 78 L350 90Z" fill="#66BB6A"/>
        <line x1="345" y1="90" x2="345" y2="98" stroke="#8D6E63" stroke-width="2"/>
        <path d="M30 470 L35 458 L40 470Z" fill="#66BB6A"/>
        <line x1="35" y1="470" x2="35" y2="478" stroke="#8D6E63" stroke-width="2"/>
    </g>

    <!-- 指南针 -->
    <g transform="translate(360,40)">
        <circle cx="0" cy="0" r="14" fill="#FFFBF0" stroke="#4E342E" stroke-width="2"/>
        <path d="M0 -10 L4 4 L0 0 L-4 4Z" fill="#E57373" stroke="#4E342E" stroke-width="1.5" stroke-linejoin="round"/>
        <text x="0" y="-16" text-anchor="middle" font-size="8" fill="#4E342E" font-weight="700">N</text>
    </g>

    <!-- 拼图目标点位（虚线圆，待放置）-->
    <g id="mapTargets"></g>

    <!-- 已放置碎片层 -->
    <g id="placedFragments"></g>

    <!-- 吉祥物旅行轨迹层 -->
    <g id="trajectoryLayer"></g>

    <!-- 碎片总数标识 -->
    <g transform="translate(20,540)">
        <rect x="0" y="-14" width="120" height="22" rx="11" fill="#FFFBF0" stroke="#4E342E" stroke-width="2"/>
        <text id="fragmentCountText" x="60" y="1" text-anchor="middle" font-size="11" font-weight="700" fill="#4E342E">已收集 0 / 10</text>
    </g>
</svg>`;
}

/* === 生成单个碎片的目标占位（虚线圆 + 图标轮廓）=== */
function renderMapTarget(landmark) {
    return `
    <g class="map-target" data-id="${landmark.id}" transform="translate(${landmark.x},${landmark.y})">
        <circle cx="0" cy="0" r="22" fill="rgba(255,251,240,0.6)" stroke="#BCAAA4" stroke-width="2" stroke-dasharray="5 4"/>
        <text x="0" y="5" text-anchor="middle" font-size="18" opacity="0.35">${landmark.icon}</text>
        <text x="0" y="38" text-anchor="middle" font-size="10" fill="#8D6E63" font-weight="600">${landmark.name}</text>
    </g>`;
}

/* === 生成已放置的碎片（彩色贴纸）=== */
function renderPlacedFragment(landmark) {
    return `
    <g class="placed-fragment" data-id="${landmark.id}" transform="translate(${landmark.x},${landmark.y})">
        <circle cx="0" cy="0" r="24" fill="${landmark.color}" stroke="#4E342E" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="24" fill="none" stroke="#FFFBF0" stroke-width="1.5" stroke-dasharray="2 3" opacity="0.7"/>
        <text x="0" y="6" text-anchor="middle" font-size="20">${landmark.icon}</text>
        <text x="0" y="40" text-anchor="middle" font-size="10" fill="#4E342E" font-weight="700">${landmark.name}</text>
    </g>`;
}
