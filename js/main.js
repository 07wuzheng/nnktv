/** ==========================================
 * 南宁KTV - 主脚本文件 (首页)
 *
 * 首页 KTV 区域已采用静态 HTML（SEO 友好），
 * 无需 JS 渲染。此脚本负责：
 * 1. 加载热门KTV门店（点击跳转详情页）
 * 2. 加载最新资讯（文章列表，文章可跳转详情页）
 * 3. 加载联系电话（从 API 更新）
 * 4. 加载网站标题
 * 5. 加载区域卡片封面图
 *
 * 内联工具函数：escapeHtml / fetchJSON / DISTRICT_MAP / 汉堡菜单
 * ========================================== */

// ===== API 配置（后端对接：部署时只需修改此处，所有接口请求会自动拼接）=====
var API_BASE = '';  // 留空 = 相对路径；生产环境可设为 'https://api.nanningktv.com' 等

// 四大分区：游戏场 / 商务场 / 高端量贩场 / 花场

// --- 内联工具函数（原 common.js，已还原为各文件独立副本）---

// --- 轮播图逻辑（API 动态加载 + 静态兜底） ---
(function() {
    var carousel = document.getElementById('bannerCarousel');
    if (!carousel) return;

    // TODO: 后端对接 — 将 'api/banners.json' 改为 API_BASE + '/api/banners'
    var BANNER_API = 'api/banners.json';

    /**
     * 从 API 加载轮播图数据
     * 接口返回格式：
     * {
     *   "code": 0,
     *   "message": "success",
     *   "data": [
     *     { "id": 1, "image": "xxx.jpg", "alt": "描述", "link": "", "sort": 1, "status": 1 }
     *   ]
     * }
     * - image: 图片地址（必填）
     * - alt: 图片alt文字（必填，SEO）
     * - link: 点击跳转链接（选填，空则不跳转）
     * - sort: 排序权重，越小越前
     * - status: 1=启用 0=禁用
     */
    function fetchBanners() {
        fetch(BANNER_API)
            .then(function(res) { return res.json(); })
            .then(function(json) {
                if (json.code === 0 && json.data && json.data.length > 0) {
                    var banners = json.data
                        .filter(function(b) { return b.status === 1; })
                        .sort(function(a, b) { return (a.sort || 0) - (b.sort || 0); });
                    if (banners.length > 0) {
                        renderCarousel(banners);
                    }
                }
            })
            .catch(function(err) {
                // API 请求失败，保留 HTML 中的静态轮播图作为兜底
                console.warn('[Banner] API加载失败，使用静态轮播图:', err.message);
                initCarousel();
            });
    }

    /**
     * 根据 API 数据动态渲染轮播图
     */
    function renderCarousel(banners) {
        var slidesContainer = carousel.querySelector('.carousel-slides');
        var dotsContainer = carousel.querySelector('.carousel-dots');

        // 清空现有幻灯片和指示点
        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

        banners.forEach(function(banner, index) {
            // 创建幻灯片
            var slide = document.createElement('div');
            slide.className = 'carousel-slide' + (index === 0 ? ' active' : '');

            var img = document.createElement('img');
            img.src = banner.image;
            img.alt = banner.alt || '轮播图';
            img.loading = index === 0 ? 'eager' : 'lazy';

            // 如果有链接，包裹 a 标签
            if (banner.link) {
                var a = document.createElement('a');
                a.href = banner.link;
                a.title = banner.alt || '';
                a.appendChild(img);
                slide.appendChild(a);
            } else {
                slide.appendChild(img);
            }

            slidesContainer.appendChild(slide);

            // 创建指示点
            var dot = document.createElement('span');
            dot.className = 'dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('data-index', index);
            dotsContainer.appendChild(dot);
        });

        // 初始化轮播交互
        initCarousel();
    }

    /**
     * 初始化轮播交互逻辑（绑定事件 + 自动播放）
     */
    function initCarousel() {
        var slides = carousel.querySelectorAll('.carousel-slide');
        var dots = carousel.querySelectorAll('.dot');
        var prevBtn = carousel.querySelector('.carousel-prev');
        var nextBtn = carousel.querySelector('.carousel-next');
        var current = 0;
        var total = slides.length;
        var timer = null;

        if (total === 0) return;

        function goTo(index) {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = (index + total) % total;
            slides[current].classList.add('active');
            dots[current].classList.add('active');
        }

        function nextSlide() { goTo(current + 1); }
        function prevSlide() { goTo(current - 1); }

        function startAuto() {
            stopAuto();
            timer = setInterval(nextSlide, 4000);
        }

        function stopAuto() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        // 移除旧事件（防止重复绑定）
        var newPrev = prevBtn.cloneNode(true);
        var newNext = nextBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);

        newPrev.addEventListener('click', function() { prevSlide(); startAuto(); });
        newNext.addEventListener('click', function() { nextSlide(); startAuto(); });

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                goTo(parseInt(this.getAttribute('data-index')));
                startAuto();
            });
        });

        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);

        // 触摸滑动支持
        var touchStartX = 0;
        carousel.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].clientX;
            stopAuto();
        }, { passive: true });

        carousel.addEventListener('touchend', function(e) {
            var diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? prevSlide() : nextSlide();
            }
            startAuto();
        }, { passive: true });

        startAuto();
    }

    // 启动：先尝试 API 加载，失败则使用静态 HTML
    fetchBanners();
})();

// 5/14修复：页面切换90%显示bug — 禁用浏览器滚动位置恢复，强制回到顶部
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
// 使用 pageshow 事件确保 bfcache 恢复页面时也能正确回到顶部
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        document.documentElement.style.transform = 'none';
        document.documentElement.style.zoom = '1';
        window.scrollTo(0, 0);
    }
});
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

var DISTRICT_MAP = {
    youxi:           { name: '游戏场' },
    shangwu:         { name: '商务场' },
    gaoduanliangfan: { name: '高端量贩场' },
    huachang:        { name: '花场' }
};

function fetchJSON(url) {
    return fetch(url).then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    });
}

function getQueryParam(key) {
    var params = new URLSearchParams(window.location.search);
    return params.get(key);
}



// 底部导航栏高亮（移动端）
(function() {
    // 根据当前页面路径和 hash 判断活跃项
    var path = window.location.pathname;
    var hash = window.location.hash;
    var page = 'index'; // 默认首页

    // 首页但 hash 指向热门KTV门店区域，高亮 KTV
    if (hash === '#featuredStores' || hash === '#section-title' || hash === '#ktv-list') {
        page = 'ktv';
    } else if (path.indexOf('articles') !== -1) {
        page = 'articles';
    } else if (path.indexOf('article-detail') !== -1) {
        page = 'articles';
    } else if (path.indexOf('district') !== -1) {
        page = 'ktv';
    } else if (path.indexOf('detail') !== -1) {
        page = 'ktv';
    } else if (path.indexOf('lianxiwomen') !== -1) {
        page = 'lianxiwomen';
    } else if (path.indexOf('partnership') !== -1 || path.indexOf('cooperation') !== -1) {
        page = 'partnership';
    }

    var items = document.querySelectorAll('.bottom-nav-item');
    items.forEach(function(item) {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
})();

// 5/13优化：底部导航栏 KTV 点击定位到首页热门KTV门店 section-title
(function() {
    var ktvNavItem = document.querySelector('.bottom-nav-item[data-page="ktv"]');
    if (ktvNavItem) {
        ktvNavItem.addEventListener('click', function(e) {
            // 判断是否在首页
            var path = window.location.pathname;
            var isIndex = path.indexOf('index') !== -1 || path === '/' || path.endsWith('/');
            if (isIndex) {
                e.preventDefault();
                var target = document.getElementById('section-title');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // 更新 URL hash
                    history.replaceState(null, '', '#section-title');
                    // 重新高亮底部导航
                    document.querySelectorAll('.bottom-nav-item').forEach(function(item) {
                        item.classList.remove('active');
                    });
                    ktvNavItem.classList.add('active');
                }
            }
        });
    }
})();

// 5/14优化：悬浮微信点击切换（移动端替代hover）
(function() {
    var wechatIcon = document.querySelector('.float-wechat-icon');
    if (wechatIcon) {
        wechatIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('wechat-active');
        });
        // 点击页面其他区域关闭
        document.addEventListener('click', function(e) {
            if (!wechatIcon.contains(e.target)) {
                wechatIcon.classList.remove('wechat-active');
            }
        });
    }
})();

// ==========================================
// DOM 元素引用
// ==========================================
const articleList = document.getElementById('articleList');
const storeGrid = document.getElementById('storeGrid');

// ==========================================
// 1. 获取网站标题
// ==========================================
async function loadSiteTitle() {
    const data = await fetchJSON('/api/site-title');
    if (data && data.title) {
        document.title = data.title;
    }
}

// ==========================================
// 2. 加载热门KTV门店（点击跳转详情页）
// ==========================================

/**
 * 获取热门KTV门店列表
 * TODO: 接入真实 API，替换下方静态数据
 * 真实接口：GET /api/ktv/featured?limit=8
 * 排序逻辑：按每个地区最新上传的门店优先展示（create_time DESC）
 * 返回格式：
 * {
 *   "code": 200,
 *   "data": {
 *     "list": [
 *       { "id": "1", "name": "xx", "district": "youxi", "address": "xx", "cover": "url", "create_time": "2026-05-14 10:00:00" }
 *     ]
 *   }
 * }
 *
 * 【图片逻辑】
 * cover 字段 = 门店详情页图片（同一张图，按卡片尺寸等比缩放，CSS background-size:cover）
 * 后端统一返回此字段，首页卡片、地区列表页卡片、详情页主图共用同一个 cover URL
 */
function fetchFeaturedStores() {
    // TODO: 后端对接 — 取消下行注释，删除下方 mock 数据
    // return fetchJSON(API_BASE + '/api/ktv/featured?limit=8');

    // 模拟数据：4 个分区各 1-2 家门店，共 8 家
    // 排序逻辑：按每个分区最新上传的门店优先展示（create_time DESC）
    var mockList = [
        { id: '1', name: 'xx', district: 'youxi',           address: '南宁市游戏场区xx路xx号', cover: '', create_time: '2026-05-14 10:00:00' },
        { id: '2', name: 'xx', district: 'youxi',           address: '南宁市游戏场区xx路xx号', cover: '', create_time: '2026-05-13 14:30:00' },
        { id: '3', name: 'xx', district: 'shangwu',         address: '南宁市商务场区xx路xx号', cover: '', create_time: '2026-05-13 09:00:00' },
        { id: '4', name: 'xx', district: 'gaoduanliangfan', address: '南宁市高端量贩场区xx路xx号', cover: '', create_time: '2026-05-12 16:00:00' },
        { id: '5', name: 'xx', district: 'gaoduanliangfan', address: '南宁市高端量贩场区xx路xx号', cover: '', create_time: '2026-05-12 10:00:00' },
        { id: '6', name: 'xx', district: 'huachang',        address: '南宁市花场区xx路xx号', cover: '', create_time: '2026-05-11 15:00:00' },
        { id: '7', name: 'xx', district: 'shangwu',         address: '南宁市商务场区xx路xx号', cover: '', create_time: '2026-05-11 09:00:00' },
        { id: '8', name: 'xx', district: 'huachang',        address: '南宁市花场区xx路xx号', cover: '', create_time: '2026-05-10 14:00:00' }
    ];
    return Promise.resolve({ code: 200, data: { list: mockList } });
}

/**
 * 渲染热门门店卡片到首页
 * @param {Array} list - 门店列表数据
 */
function renderStoreCards(list) {
    if (!storeGrid) return;

    var html = '';
    list.forEach(function(item) {
        var districtName = DISTRICT_MAP[item.district] ? DISTRICT_MAP[item.district].name : 'xx';
        // 封面图：有效 URL 用背景图，否则用灰色占位
        var bgStyle = '';
        if (item.cover && item.cover.indexOf('http') !== -1 && item.cover.indexOf('url') === -1) {
            bgStyle = 'background-image:url(' + escapeHtml(item.cover) + ')';
        }
        // 门店详情链接：detail.html?district=拼音&id=数字（URL 不含中文）
        var detailUrl = 'detail.html?district=' + (item.district || 'youxi') + '&id=' + (item.id || '1');

        html += '<a href="' + detailUrl + '" class="store-card" data-district="' + escapeHtml(item.district || '') + '" data-id="' + escapeHtml(item.id || '') + '">' +
            '<div class="store-card-cover" style="' + bgStyle + '">' +
                '<span class="store-card-district-tag">' + escapeHtml(districtName) + '</span>' +
            '</div>' +
            '<div class="store-card-body">' +
                '<h3>' + escapeHtml(item.name || 'xx') + '</h3>' +
                '<p class="store-card-addr">' + escapeHtml(item.address || 'xx') + '</p>' +
            '</div>' +
        '</a>';
    });
    storeGrid.innerHTML = html;
}

/**
 * 加载热门门店数据并渲染
 */
async function loadFeaturedStores() {
    var data = await fetchFeaturedStores();
    var loadingEl = document.getElementById('storeLoading');

    if (!data || !data.data || !data.data.list || data.data.list.length === 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (storeGrid) {
            storeGrid.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--color-text-muted)">暂无热门门店</div>';
        }
        return;
    }

    if (loadingEl) loadingEl.style.display = 'none';
    renderStoreCards(data.data.list);
}

// ==========================================
// 3. 加载最新资讯（首页3卡片 + 1个"查看更多"卡片）
//    图片逻辑：主页封面图 = 资讯列表页封面图 = 资讯详情页文章图（同一张 thumbnail）
//    缩放方式：background-size: cover + background-position: center
// ==========================================

/**
 * 获取最新资讯列表（首页，取3条）
 * TODO: 接入真实 API，替换下方静态数据
 * 真实接口：GET /api/articles?type=news&limit=3
 */
function fetchArticles() {
    // TODO: 后端对接 — 取消下行注释，删除下方 mock 数据
    // return fetchJSON(API_BASE + '/api/articles?type=news&limit=3');

    var mockList = [
        { id: 1, title: '南宁游戏场KTV新开业优惠活动', thumbnail: '', seo_keywords: '南宁KTV,游戏场KTV,优惠活动', author: '南宁KTV', create_time: '2026-05-10 14:30:00', update_time: '2026-05-10 14:30:00', status: 1 },
        { id: 2, title: '南宁KTV预订攻略：四大分区全覆盖', thumbnail: '', seo_keywords: '南宁KTV预订,KTV攻略', author: '南宁KTV', create_time: '2026-05-09 10:00:00', update_time: '2026-05-09 10:00:00', status: 1 },
        { id: 3, title: '南宁高端量贩场KTV排行榜发布', thumbnail: '', seo_keywords: '高端量贩场KTV,KTV排行', author: '南宁KTV', create_time: '2026-05-08 16:20:00', update_time: '2026-05-08 16:20:00', status: 1 }
    ];
    return Promise.resolve({ list: mockList });
}

/**
 * 渲染首页最新资讯：3篇资讯卡片 + 1个"查看更多"卡片
 * @param {Array} list - 文章列表数据（最多3条）
 *
 * 【后端数据对接说明】
 * thumbnail 字段：同一张图用于三处（主页封面 / 资讯列表封面 / 详情页文章图）
 * 主页卡片通过 background-image 渲染，CSS background-size:cover 自动等比缩放
 */
function renderNewsCards(list) {
    var grid = document.getElementById('newsGrid');
    if (!grid) return;

    var html = '';
    list.forEach(function(item) {
        // 封面图：有效 URL 设为 background-image（与资讯列表页、详情页共用同一张 thumbnail）
        var bgStyle = '';
        if (item.thumbnail && item.thumbnail.indexOf('http') !== -1 && item.thumbnail.indexOf('url') === -1) {
            bgStyle = ' style="background-image:url(' + escapeHtml(item.thumbnail) + ')"';
        }
        var detailUrl = 'article-detail.html?id=' + encodeURIComponent(item.id);

        html += '<a href="' + detailUrl + '" class="news-card"' + bgStyle + '>' +
            '<div class="news-card-overlay"></div>' +
            '<div class="news-card-body">' +
                '<h3>' + escapeHtml(item.title || 'xx') + '</h3>' +
            '</div>' +
        '</a>';
    });

    // 第4格：固定渲染"查看更多"卡片
    html += '<a href="articles.html" class="news-card-more">' +
        '<div class="news-card-more-inner">' +
            '<span class="news-card-more-icon">&rarr;</span>' +
            '<span class="news-card-more-text">查看更多</span>' +
        '</div>' +
    '</a>';

    grid.innerHTML = html;
}

/**
 * 加载最新资讯数据并渲染
 */
async function loadArticles() {
    var data = await fetchArticles();

    if (!data || !data.list || data.list.length === 0) {
        var grid = document.getElementById('newsGrid');
        if (grid) {
            grid.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--color-text-muted);grid-column:1/-1;">暂无最新资讯</div>' +
                '<a href="articles.html" class="news-card-more">' +
                    '<div class="news-card-more-inner">' +
                        '<span class="news-card-more-icon">&rarr;</span>' +
                        '<span class="news-card-more-text">查看更多</span>' +
                    '</div>' +
                '</a>';
        }
        return;
    }

    renderNewsCards(data.list);
}

// ==========================================
// 4. 加载联系电话
// ==========================================
async function loadContact() {
    // TODO: 后端对接 — 接口就绪后自动生效，无需改动；硬编码电话 19968122123 见 index.html
    const data = await fetchJSON(API_BASE + '/api/contact');

    if (data && data.phone) {
        const phoneLinks = document.querySelectorAll('.phone-number');
        phoneLinks.forEach(el => {
            el.textContent = data.phone;
            el.href = `tel:${data.phone.replace(/\D/g, '')}`;
        });
    }
}

// ==========================================
// 5. 加载区域卡片封面图（= 该区首家门店封面图）
// ==========================================

/**
 * 动态更新首页7个区域卡片的背景图
 * 【后端数据对接】
 * 接口：GET /api/ktv/first-store-covers
 * 返回格式：{ "youxi": { "cover": "url" }, "shangwu": { "cover": "url" }, ... }
 *
 * 【图片逻辑】
 * 每个区域卡片的背景图 = 该区第一家门店的封面图 = 门店详情页主图（同一张 cover）
 * 后端统一返回 cover 字段，首页区域卡片、地区列表页、详情页共用同一图片数据
 * 接通后端后，取消下方 fetchJSON 的注释即可
 */
async function loadDistrictCovers() {
    // TODO: 后端对接 — 取消下方注释，启用真实 API
    // const data = await fetchJSON(API_BASE + '/api/ktv/first-store-covers');
    // if (!data) return;
    //
    // document.querySelectorAll('.district-home-card[data-district-slug]').forEach(card => {
    //     const slug = card.getAttribute('data-district-slug');
    //     if (data[slug] && data[slug].cover) {
    //         card.style.setProperty('--district-bg', `url('${data[slug].cover}')`);
    //         card.setAttribute('data-cover', data[slug].cover);
    //     }
    // });

    // 当前逻辑：从已有的 data-cover 属性读取，确保背景图同步
    document.querySelectorAll('.district-home-card[data-cover]').forEach(card => {
        const coverUrl = card.getAttribute('data-cover');
        if (coverUrl && coverUrl.trim() !== '') {
            card.style.setProperty('--district-bg', `url('${coverUrl}')`);
        }
    });
}

// ==========================================
// 初始化 - DOM 就绪后运行
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadSiteTitle();
    loadFeaturedStores();
    loadArticles();
    loadContact();
    loadDistrictCovers();

    // 兜底：6秒后强制隐藏所有 loading 动画
    setTimeout(() => {
        document.querySelectorAll('.district-loading, .store-loading').forEach(el => {
            el.style.display = 'none';
        });
    }, 6000);
});
