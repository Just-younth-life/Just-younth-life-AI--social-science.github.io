/* ============================================
   启知吉祥物 图片资源映射
   严格使用 assets 目录中授权的两张透明背景 PNG 图片：
   - blue_thing.png  （蓝色版，2048×2048，1:1，透明背景）
   - orange_thing.png（橙色版，2048×2048，1:1，透明背景）
   不得自行创建、修改或替换任何吉祥物视觉素材。
   ============================================ */

const MASCOT_IMAGES = {
    blue: 'assets/blue_thing.png',
    orange: 'assets/orange_thing.png'
};

function getMascotSrc(colorVariant = 'blue') {
    return MASCOT_IMAGES[colorVariant] || MASCOT_IMAGES.blue;
}

function getMascotImgHTML(colorVariant = 'blue', size = 64) {
    const src = getMascotSrc(colorVariant);
    // 授权图片为 2048×2048 正方形（1:1），按原比例渲染，不做任何拉伸
    return `<img src="${src}" alt="启知吉祥物" width="${size}" height="${size}" style="display:block;pointer-events:none;"/>`;
}

function getMascotColorForAudience(audience) {
    // 仅使用授权的两张图片：elderly→橙色，其余受众→蓝色
    const map = {
        general: 'blue',
        elderly: 'orange',
        middle: 'blue',
        youth: 'blue'
    };
    return map[audience] || 'blue';
}
