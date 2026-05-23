/**
 * 南宁KTV - 分区列表页脚本
 *
 * 功能：
 * 1. 根据 URL 参数 name 加载对应分区的 KTV 门店列表
 * 2. 分页（每页6条）
 * 3. 电话弹窗
 * 4. 动态更新 SEO meta（title / description / keywords / canonical / OG / JSON-LD 面包屑）
 *
 * 从 district.html 内联脚本抽离，便于后端对接维护
 */

// ===== API 配置（后端对接：部署时只需修改此处，所有接口请求会自动拼接）=====
var API_BASE = '';  // 留空 = 相对路径；生产环境可设为 'https://api.nanningktv.com' 等

// 5/14修复：页面切换90%显示bug
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        document.documentElement.style.transform = 'none';
        document.documentElement.style.zoom = '1';
        window.scrollTo(0, 0);
    }
});
window.scrollTo(0, 0);

// --- 内联 escapeHtml（原 common.js）---
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// --- fetchJSON 工具函数 ---
function fetchJSON(url) {
    return fetch(url).then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    });
}

// ==========================================
// 1. 拼音-中文映射表（URL 使用拼音，显示使用中文）
// ==========================================
var pinyinMap = {
    'youxi':           { name: '游戏场', desc: '互动游戏场KTV，沉浸式娱乐', count: '10' },
    'shangwu':         { name: '商务场', desc: '商务场KTV，高端洽谈首选', count: '12' },
    'gaoduanliangfan': { name: '高端量贩场', desc: '高端量贩场KTV，品质欢唱', count: '11' },
    'huachang':        { name: '花场', desc: '花场KTV，璀璨夜生活', count: '8' }
};

// ==========================================
// 2. 获取当前分区拼音参数
// ==========================================
function getParam(key) {
    var match = location.search.match(new RegExp('[?&]' + key + '=([^&]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

var slug = getParam('name') || 'youxi';
var info = pinyinMap[slug] || pinyinMap['youxi'];
var district = info.name;

// ==========================================
// 3. 更新页面 SEO 元数据
// ==========================================
var seoTitle = district + 'KTV精选推荐_南宁' + district + '/游戏场/商务场等包厢预订';
var seoDesc = '南宁' + district + 'KTV推荐，精选该分区优质KTV门店。查看包厢实景、低消，在线预订或直接致电：19968122123。';
var seoKeywords = '南宁' + district + 'KTV,' + district + 'KTV推荐,' + district + 'KTV预订,南宁KTV,南宁KTV推荐,19968122123';

document.title = seoTitle;
document.querySelector('meta[name="description"]').content = seoDesc;
document.querySelector('meta[name="keywords"]').content = seoKeywords;
document.querySelector('link[rel="canonical"]').href = 'https://www.nanningktv.com/district.html?name=' + slug;

// 动态更新 OG 标签
var ogTitle = document.querySelector('meta[property="og:title"]');
var ogDesc = document.querySelector('meta[property="og:description"]');
var ogUrl = document.querySelector('meta[property="og:url"]');
if (ogTitle) ogTitle.content = seoTitle;
if (ogDesc) ogDesc.content = seoDesc;
if (ogUrl) ogUrl.content = 'https://www.nanningktv.com/district.html?name=' + slug;

// 动态更新结构化数据中的面包屑
var breadcrumbScript = document.querySelectorAll('script[type="application/ld+json"]')[0];
if (breadcrumbScript) {
    try {
        var bd = JSON.parse(breadcrumbScript.textContent);
        bd.itemListElement[1].name = district + 'KTV';
        breadcrumbScript.textContent = JSON.stringify(bd);
    } catch(e) {}
}

document.getElementById('pageH1').textContent = district + 'KTV推荐';
document.getElementById('pageSubtitle').textContent = district + 'KTV精选，' + info.count + ' 家优质KTV门店供您选择';

// 侧栏高亮
var activeNav = document.getElementById('nav-' + slug);
if (activeNav) activeNav.classList.add('active');

// 移动端分区标签栏高亮当前分区
document.querySelectorAll('.mobile-district-tabs a[data-district]').forEach(function(tab) {
    if (tab.getAttribute('data-district') === slug) {
        tab.classList.add('active');
    }
});

// ==========================================
// 4. 模拟数据 — 每个分区 12 家 KTV
// TODO: 后端对接 — 取消注释并删除下方 mock 数据即可
// ==========================================
var ktvData = [];

// TODO: 后端对接 — 以下 mock 数据需替换为真实 API 调用
// 真实接口：GET /api/ktv/list?district=拼音&page=1&pageSize=6
// 启用方式：将 renderPage() 和 renderPagination() 中的 ktvData 替换为 API 返回数据
// var ktvData = [];
// function loadKtvList(page) {
//     fetchJSON(API_BASE + '/api/ktv/list?district=' + slug + '&page=' + page + '&pageSize=6')
//         .then(function(res) { ... });
// }

for (var i = 1; i <= 12; i++) {
    ktvData.push({
        id: i,
        title: district + ' XX 娱乐场所（' + i + '号店）',
        time: '2026-05-' + (i < 10 ? '0' + i : i),
        address: district + ' XX 路 XX 号 XX 大厦',
        package: 'XX 套餐：XX 小时欢唱 + XX 饮品',
        description: '环境 XX 优雅，音响品质 XX，' + info.desc + '，XX 聚会首选场所。',
        phone: '19968122123',
        cover: ''  // TODO: 后端对接 — 门店封面图 URL，当前为空占位
    });
}

// ==========================================
// 5. 渲染函数
// ==========================================
var grid = document.getElementById('ktvGrid');
var pagination = document.getElementById('pagination');
var modal = document.getElementById('phoneModal');
var modalPhone = document.getElementById('modalPhone');
var modalClose = document.getElementById('modalClose');
var perPage = 6;
var currentPage = 1;

function renderPage(page) {
    var start = (page - 1) * perPage;
    var end = Math.min(start + perPage, ktvData.length);
    var items = ktvData.slice(start, end);
    var html = '';

    items.forEach(function(item) {
        // 门店详情链接：detail.html?district=拼音&id=数字（URL 不含中文）
        var detailUrl = 'detail.html?district=' + encodeURIComponent(slug) + '&id=' + encodeURIComponent(item.id);
        // 封面图：有效 URL 用背景图，否则用灰色占位文字
        var imgHtml = '图片占位';
        if (item.cover && item.cover.indexOf('http') !== -1 && item.cover.indexOf('url') === -1) {
            imgHtml = '';
        }
        var bgStyle = '';
        if (item.cover && item.cover.indexOf('http') !== -1 && item.cover.indexOf('url') === -1) {
            bgStyle = ' style="background-image:url(' + escapeHtml(item.cover) + ')"';
        }
        html += '<article class="ktv-card" data-district="' + escapeHtml(slug) + '" data-id="' + escapeHtml(String(item.id)) + '">';
        html += '  <a href="' + detailUrl + '" class="ktv-card-link" aria-label="查看' + escapeHtml(item.title) + '详情">';
        html += '    <div class="ktv-img"' + bgStyle + ' role="img" aria-label="' + district + ' KTV 图片示例">' + imgHtml + '</div>';
        html += '  </a>';
        html += '  <div class="ktv-body">';
        html += '    <h2><a href="' + detailUrl + '">' + escapeHtml(item.title) + ' · ' + district + 'KTV</a></h2>';
        html += '    <p class="ktv-meta">发布日期：' + escapeHtml(item.time) + '</p>';
        html += '    <div class="ktv-info">';
        html += '      <p><span class="label">地址：</span>' + escapeHtml(item.address) + '</p>';
        html += '      <p><span class="label">套餐：</span>' + escapeHtml(item.package) + '</p>';
        html += '    </div>';
        html += '    <p class="ktv-desc">' + escapeHtml(item.description) + '</p>';
        html += '    <div class="ktv-actions">';
        html += '      <a href="' + detailUrl + '" class="btn-detail">查看详情</a>';
        html += '      <button class="btn-phone" data-phone="' + escapeHtml(item.phone) + '">查看电话</button>';
        html += '    </div>';
        html += '  </div>';
        html += '</article>';
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.btn-phone').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showModal(this.getAttribute('data-phone'));
        });
    });
}

function renderPagination(page) {
    var totalPages = Math.ceil(ktvData.length / perPage);
    var html = '';
    html += '<a href="?name=' + slug + '&page=' + (page - 1) + '" class="' + (page === 1 ? 'disabled' : '') + '" data-page="' + (page - 1) + '">上一页</a>';
    for (var i = 1; i <= totalPages; i++) {
        html += '<a href="?name=' + slug + '&page=' + i + '" class="' + (i === page ? 'active' : '') + '" data-page="' + i + '">' + i + '</a>';
    }
    html += '<a href="?name=' + slug + '&page=' + (page + 1) + '" class="' + (page === totalPages ? 'disabled' : '') + '" data-page="' + (page + 1) + '">下一页</a>';
    pagination.innerHTML = html;

    pagination.querySelectorAll('a[data-page]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var p = parseInt(this.getAttribute('data-page'));
            if (p >= 1 && p <= totalPages && p !== currentPage) {
                currentPage = p;
                renderPage(currentPage);
                renderPagination(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// ==========================================
// 6. 弹窗控制
// ==========================================
function showModal(phone) {
    var tel = (phone || '19968122123').replace(/-/g, '');  // TODO: 后端对接 — 硬编码电话仅作兜底
    modalPhone.innerHTML = '<a href="tel:' + tel + '" class="header-call-btn" aria-label="立即拨打预订热线"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg><span class="call-btn-text">立即拨打</span></a>';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', hideModal);
modal.addEventListener('click', function(e) {
    if (e.target === modal) hideModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) hideModal();
});

// ==========================================
// 7. 初始化
// ==========================================
renderPage(currentPage);
renderPagination(currentPage);

// 5/14优化：悬浮微信点击切换（移动端替代hover）
var wechatIcon = document.querySelector('.float-wechat-icon');
if (wechatIcon) {
    wechatIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('wechat-active');
    });
    document.addEventListener('click', function(e) {
        if (!wechatIcon.contains(e.target)) {
            wechatIcon.classList.remove('wechat-active');
        }
    });
}
