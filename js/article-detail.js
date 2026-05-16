/**
 * 南宁KTV - 文章详情页脚本
 *
 * 功能：
 * 1. 根据 URL 参数 id 加载文章详情
 * 2. 渲染标题、作者、发布时间、封面大图、正文（富文本）
 * 3. 动态更新 SEO meta（title / description / keywords / OG / JSON-LD）
 *
 * 内联工具函数：escapeHtml / getQueryParam / 汉堡菜单
 */

// --- 内联工具函数（原 common.js，已还原为各文件独立副本）---
document.documentElement.classList.remove('no-js');

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

function getQueryParam(key) {
    var params = new URLSearchParams(window.location.search);
    return params.get(key);
}

// 汉堡菜单（已由底部导航栏替代，保留无障碍兜底）
(function() {
    var hamburger = document.getElementById('hamburger');
    var navMobile = document.getElementById('navMobile');
    if (hamburger && navMobile) {
        hamburger.addEventListener('click', function() {
            var isOpen = navMobile.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        navMobile.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navMobile.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }
})();

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
// 数据模拟（TODO: 接入真实 API，替换下方静态数据）
// ==========================================

function fetchArticleDetail(id) {
    var mockData = {
        id: id || 1,
        title: '南宁游戏KTV新开业优惠活动',
        seo_keywords: '南宁KTV,游戏KTV,优惠活动,南宁唱歌',
        content: '<p>南宁游戏KTV近日新开业了一家高端KTV娱乐场所，为市民带来了全新的唱歌体验。该KTV位于南宁核心商圈，交通便利，设施齐全。</p>' +
            '<p>开业期间推出多项优惠活动，包括包厢折扣、欢唱套餐、会员充值返现等。广大市民可拨打预订热线咨询详情。</p>' +
            '<p>南宁KTV信息平台将持续更新南宁四大分区的KTV行业动态，为您提供最全面的KTV资讯服务。</p>' +
            '<p>更多南宁KTV信息，请访问我们的网站或关注微信公众号"南宁KTV"。</p>',
        author: '南宁KTV',
        create_time: '2026-05-10 14:30:00',
        update_time: '2026-05-11 09:00:00',
        site_id: 1,
        region_id: 1,
        thumbnail: '',
        status: 1
    };

    return Promise.resolve(mockData);
}

// ==========================================
// 渲染函数
// ==========================================

function renderArticle(data) {
    var titleEl = document.getElementById('articleTitle');
    if (titleEl) titleEl.textContent = data.title || '文章详情';

    var authorEl = document.getElementById('articleAuthor');
    if (authorEl) authorEl.textContent = data.author || '南宁KTV';

    var timeEl = document.getElementById('articleCreateTime');
    if (timeEl) {
        timeEl.textContent = data.create_time || '';
        if (data.create_time) timeEl.setAttribute('datetime', data.create_time);
    }

    var coverEl = document.getElementById('articleCover');
    if (coverEl) {
        if (data.thumbnail && data.thumbnail.indexOf('http') !== -1 && data.thumbnail.indexOf('url') === -1) {
            coverEl.innerHTML = '<img src="' + escapeHtml(data.thumbnail) + '" alt="' + escapeHtml(data.title) + '" loading="lazy">';
        } else {
            coverEl.innerHTML = '<div class="img-placeholder" style="height:360px;"></div>';
        }
    }

    var contentEl = document.getElementById('articleContent');
    if (contentEl) {
        contentEl.innerHTML = data.content || '<p>暂无内容</p>';
    }

    var updateWrap = document.getElementById('articleUpdateTime');
    var updateTimeVal = document.getElementById('updateTimeValue');
    if (updateWrap && updateTimeVal && data.update_time && data.update_time !== data.create_time) {
        updateTimeVal.textContent = data.update_time;
        updateTimeVal.setAttribute('datetime', data.update_time);
        updateWrap.style.display = 'block';
    }

    var breadcrumbTitle = document.getElementById('breadcrumbTitle');
    if (breadcrumbTitle) breadcrumbTitle.textContent = data.title || '文章详情';

    updateSEOMeta(data);
}

function updateSEOMeta(data) {
    var title = (data.title || '文章详情') + ' — 南宁KTV资讯_南宁KTV动态';
    var desc = (data.content || '').replace(/<[^>]+>/g, '').substring(0, 150) + '... —— 南宁KTV资讯。看最新优惠，找靠谱包厢，电话：19968122123。';
    var keywords = data.seo_keywords || '南宁KTV资讯';
    var canonical = 'https://www.nanningktv.com/article-detail.html?id=' + (data.id || 1);

    document.title = title;

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    var metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', keywords);

    var linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.setAttribute('href', canonical);

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonical);

    if (data.thumbnail) {
        var ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', data.thumbnail);
    }

    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);

    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', desc);

    var ldScript = document.getElementById('jsonld-article');
    if (ldScript) {
        var ldData = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': data.title || '文章详情',
            'image': data.thumbnail || 'https://www.nanningktv.com/og-image.jpg',
            'author': { '@type': 'Person', 'name': data.author || '南宁KTV' },
            'datePublished': data.create_time || '',
            'dateModified': data.update_time || '',
            'publisher': {
                '@type': 'Organization',
                'name': '南宁KTV',
                'url': 'https://www.nanningktv.com',
                'logo': {
                    '@type': 'ImageObject',
                    'url': 'https://www.nanningktv.com/og-image.jpg'
                }
            },
            'url': canonical
        };
        ldScript.textContent = JSON.stringify(ldData);
    }

    var breadcrumbScripts = document.querySelectorAll('script[type="application/ld+json"]');
    if (breadcrumbScripts.length >= 2) {
        try {
            var bd = JSON.parse(breadcrumbScripts[1].textContent);
            if (bd.itemListElement && bd.itemListElement[2]) {
                bd.itemListElement[2].name = data.title || '文章详情';
                bd.itemListElement[2].item = canonical;
                breadcrumbScripts[1].textContent = JSON.stringify(bd);
            }
        } catch(e) {}
    }
}

// ==========================================
// 初始化
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    var articleId = getQueryParam('id') || '1';

    fetchArticleDetail(articleId).then(function(data) {
        if (data) renderArticle(data);
    }).catch(function(err) {
        console.warn('加载文章详情失败:', err);
    });

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
