/**
 * 南宁KTV - 最新资讯列表页脚本
 *
 * 功能：
 * 1. 加载文章列表（每行5个大卡片，缩略图背景）
 * 2. 分页
 *
 * 内联工具函数：escapeHtml / 汉堡菜单
 */

// ===== API 配置（后端对接：部署时只需修改此处，所有接口请求会自动拼接）=====
var API_BASE = '';  // 留空 = 相对路径；生产环境可设为 'https://api.nanningktv.com' 等

// --- 内联工具函数（原 common.js，已还原为各文件独立副本）---

// 5/14修复：页面切换90%显示bug
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}



// 底部导航栏高亮（移动端）
(function() {
    var items = document.querySelectorAll('.bottom-nav-item');
    items.forEach(function(item) {
        if (item.getAttribute('data-page') === 'articles') {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
})();

// ==========================================
// 数据模拟（TODO: 后端对接 — 取消注释并删除 mock 数据即可）
// ==========================================

function fetchArticles(page, pageSize) {
    // TODO: 后端对接 — 取消下行注释，删除下方 mock 数据
    // return fetchJSON(API_BASE + '/api/articles?type=news&page=' + page + '&pageSize=' + pageSize);

    var totalMock = 23;
    var list = [];
    var start = (page - 1) * pageSize;
    var end = Math.min(start + pageSize, totalMock);

    for (var i = start; i < end; i++) {
        list.push({
            id: i + 1,
            title: '南宁KTV行业资讯标题（第' + (i + 1) + '篇）',
            thumbnail: '',
            seo_keywords: '南宁KTV,资讯',
            author: '南宁KTV',
            create_time: '2026-05-' + String(Math.max(1, 13 - i)).padStart(2, '0') + ' 10:00:00',
            update_time: '2026-05-' + String(Math.max(1, 13 - i)).padStart(2, '0') + ' 10:00:00',
            status: 1
        });
    }

    return Promise.resolve({
        list: list,
        total: totalMock,
        page: page,
        pageSize: pageSize
    });
}

// ==========================================
// 渲染函数
// ==========================================

function renderArticles(list) {
    var grid = document.getElementById('articlesGrid');
    if (!grid) return;

    var html = '';
    list.forEach(function(item) {
        var bgStyle = '';
        if (item.thumbnail && item.thumbnail.indexOf('http') !== -1 && item.thumbnail.indexOf('url') === -1) {
            bgStyle = ' style="background-image:url(' + escapeHtml(item.thumbnail) + ')"';
        }
        var detailUrl = 'article-detail.html?id=' + encodeURIComponent(item.id);

        html += '<a href="' + detailUrl + '" class="articles-page-card"' + bgStyle + '>' +
            '<div class="articles-page-card-overlay"></div>' +
            '<div class="articles-page-card-body">' +
                '<h3>' + escapeHtml(item.title || 'xx') + '</h3>' +
            '</div>' +
        '</a>';
    });

    grid.innerHTML = html;
}

function renderPagination(currentPage, totalPages) {
    var pagination = document.getElementById('pagination');
    if (!pagination) return;

    var html = '';
    html += '<a href="?page=' + (currentPage - 1) + '" class="' + (currentPage === 1 ? 'disabled' : '') + '" data-page="' + (currentPage - 1) + '">上一页</a>';
    for (var i = 1; i <= totalPages; i++) {
        html += '<a href="?page=' + i + '" class="' + (i === currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</a>';
    }
    html += '<a href="?page=' + (currentPage + 1) + '" class="' + (currentPage === totalPages ? 'disabled' : '') + '" data-page="' + (currentPage + 1) + '">下一页</a>';
    pagination.innerHTML = html;

    pagination.querySelectorAll('a[data-page]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var p = parseInt(this.getAttribute('data-page'));
            if (p >= 1 && p <= totalPages && p !== currentPage) {
                loadPage(p);
            }
        });
    });
}

// ==========================================
// 页面加载
// ==========================================

var PAGE_SIZE = 15;

function loadPage(page) {
    fetchArticles(page, PAGE_SIZE).then(function(data) {
        if (!data || !data.list) return;
        renderArticles(data.list);
        var totalPages = Math.ceil(data.total / PAGE_SIZE);
        renderPagination(page, totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==========================================
// 初始化
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    var params = new URLSearchParams(window.location.search);
    var page = parseInt(params.get('page')) || 1;
    loadPage(page);

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
});
