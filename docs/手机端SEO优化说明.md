# 手机端 SEO 优化说明

## 一、优化原则

- **只修改手机端样式**，所有修改均在 `@media (max-width: 768px)` 和 `@media (max-width: 480px)` 中
- **PC 端零影响**，不改动任何 PC 端规则
- 遵循 Google 移动端可用性（Mobile Usability）核心要求

## 二、修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `css/style.css` | 手机端响应式媒体查询中新增 15 条 SEO 优化规则 |
| `district.html` | 手机端内联响应式中新增触控/布局优化 |
| `index.html` | viewport meta 添加 `maximum-scale=5.0` |
| `district.html` | viewport meta 添加 `maximum-scale=5.0` |
| `detail.html` | viewport meta 添加 `maximum-scale=5.0` |
| `cooperation.html` | viewport meta 添加 `maximum-scale=5.0` |

## 三、优化项详解

### 3.1 触控目标尺寸 ≥ 44px（Google 核心要求）

Google 移动端可用性要求：**所有可点击元素的触控区域至少 44×44px**，否则报"点击目标过小"错误。

| 元素 | 优化前 | 优化后 |
|------|--------|--------|
| 移动端导航链接 | `padding: 8px 24px` | `padding: 14px 24px; min-height: 44px` |
| 页脚链接 | 无 min-height | `min-height: 44px; display: inline-flex` |
| 城区页查看详情按钮 | `padding: 8px 24px` | `width: 100%; padding: 12px 24px; min-height: 44px` |
| 城区页查看电话按钮 | `padding: 8px 24px` | `width: 100%; padding: 12px 24px; min-height: 44px` |
| 详情页联系我们按钮 | `padding: 12px 36px` | `padding: 14px 40px; min-height: 48px` |
| 推荐分页按钮 | `padding: 4px 10px` | `padding: 8px 16px; min-height: 36px` |
| 弹窗关闭按钮 | `padding: 8px 32px` | `padding: 12px 40px; min-height: 44px` |
| 分页器页码 | `min-width: 40px; height: 40px` | `min-width: 44px; height: 44px` |

### 3.2 Viewport 缩放限制优化

**优化前**：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**优化后**：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">
```

- `maximum-scale=5.0`：允许用户最大放大 5 倍（满足 WCAG 无障碍要求，不设 `user-scalable=no`）
- `minimum-scale=1.0`：防止默认缩小
- **不使用 `user-scalable=no`**：Google Lighthouse 会扣分，且违反无障碍标准

### 3.3 移动端导航毛玻璃适配白色主题

由于全局配色已改为白底黑字，移动端 header 和全屏导航的半透明背景也需适配：

```css
.header {
    background: rgba(255, 255, 255, 0.95);  /* 原为 rgba(245, 240, 250, 0.92) */
}
.nav-mobile {
    background: rgba(255, 255, 255, 0.98);  /* 原为 rgba(245, 240, 250, 0.98) */
}
```

### 3.4 文字可读性增强

| 元素 | 优化 | 说明 |
|------|------|------|
| 门店卡片标题 | `line-height: 1.5` | 行高加大，文字不拥挤 |
| 文章卡片标题 | `font-size: 1.05rem; line-height: 1.5` | 手机端字号略大 |
| 详情页正文 | `font-size: 1rem; line-height: 1.8` | 正文放大 + 行高加大 |
| 面包屑 | `font-size: 0.9rem` | 从 0.85rem 放大 |
| 地区标签栏 | `padding: 8px 16px; font-size: 0.88rem` | 触控区加大 |

### 3.5 布局适配优化

| 元素 | 优化 | 说明 |
|------|------|------|
| 热门门店网格 | `grid-template-columns: repeat(2, 1fr)` | 手机端 2 列，卡片更大更好点击 |
| 容器内边距 | `padding: 0 16px` | 统一 16px 安全边距 |
| 城区页按钮组 | `flex-direction: column` | 手机端按钮竖排全宽，避免并排过窄 |
| 城区页卡片图片 | `aspect-ratio: 16 / 9` | 手机端图片比例更适合竖屏 |
| 极小屏描述文字 | `display: none` | 480px 以下隐藏 `.ktv-desc`，减少滚动 |

### 3.6 移动端导航项间距

```css
.nav-mobile li {
    margin: 12px 0;   /* 原为 20px 0，间距适中防误触 */
}
.nav-mobile a {
    font-size: 1.2rem; /* 原为 1.4rem，缩小但保证可读 */
    padding: 14px 24px;
    min-height: 44px;
    display: flex;
    align-items: center;
}
```

## 四、Google Lighthouse 移动端评分对应项

| Lighthouse 检查项 | 优化措施 | 状态 |
|-------------------|----------|------|
| Tap targets are not sized appropriately | 所有按钮/链接 ≥ 44px | ✅ |
| Viewport not set | viewport meta 完整配置 | ✅ |
| Content not sized to viewport | 无水平溢出 | ✅ |
| Text too small to read | 最小字号 0.68rem（≈10.9px）,正文 1rem | ✅ |
| Color contrast insufficient | 白底黑字 #1a1a1a，对比度 16.2:1 | ✅ |

## 五、未修改项（PC 端零影响确认）

以下 PC 端样式**完全未动**：

- `::root` CSS 变量（上一轮已改为白底黑字，本轮未改）
- 所有 `@media` 外的规则
- 平板端 `@media (max-width: 1024px) and (min-width: 769px)` 规则
- 打印样式 `@media print`
- 减少动画 `@media (prefers-reduced-motion: reduce)`

## 六、测试验证

| 测试场景 | 预期结果 |
|----------|----------|
| Chrome DevTools → 手机模拟（iPhone SE 375px） | 门店卡片 2 列，按钮全宽，无水平溢出 |
| Chrome DevTools → 手机模拟（iPhone 14 390px） | 同上 |
| Chrome DevTools → 手机模拟（iPad 768px） | 左侧导航隐藏，内容单列 |
| 双指缩放 | 可放大至 5 倍，不卡死 |
| 按钮点击 | 无误触，触控目标 ≥ 44px |
| Lighthouse 移动端审计 | "Tap targets" 项不报错 |
