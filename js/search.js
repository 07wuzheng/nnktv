/**
 * 南宁KTV - 全站搜索功能
 * 模糊搜索：KTV门店地址 > 资讯信息
 * 数据源：内嵌模拟数据（后期可替换为真实API）
 */
(function() {
    'use strict';

    // ===== API 配置（后端对接：部署时只需修改此处，所有接口请求会自动拼接）=====
    var API_BASE = '';  // 留空 = 相对路径；生产环境可设为 'https://api.nanningktv.com' 等

    // ==========================================
    // 搜索数据源（后期替换为真实API）
    // 优先级：KTV地址 > 资讯信息
    // ==========================================
    var DISTRICT_MAP = {
        youxi:           { name: '游戏场' },
        shangwu:         { name: '商务场' },
        gaoduanliangfan: { name: '高端量贩场' },
        huachang:        { name: '花场' }
    };

    // TODO: 后端对接 — 以下硬编码数据全部替换为 API 调用
    // 真实接口：GET /api/search?q=关键词
    // 返回格式：{ "code": 200, "data": [{ "type":"ktv"/"article", "typeName":"KTV门店"/"资讯", "title":"", "desc":"", "url":"", "keywords":"" }] }
    // 启用方式：将 search() 函数内的本地搜索替换为 fetchJSON(API_BASE + '/api/search?q=' + encodeURIComponent(query))

    // KTV门店数据（高优先级）
    var ktvData = [];
    var districts = ['youxi','shangwu','gaoduanliangfan','huachang'];
    districts.forEach(function(slug) {
        var name = DISTRICT_MAP[slug].name;
        for (var i = 1; i <= 12; i++) {
            ktvData.push({
                type: 'ktv',
                typeName: 'KTV门店',
                title: name + ' XX 娱乐场所（' + i + '号店）',
                desc: name + ' XX 路 XX 号 XX 大厦',
                url: 'detail.html?district=' + slug + '&id=' + i,
                keywords: name + 'KTV ' + name + '娱乐 南宁KTV 南宁' + name
            });
        }
    });

    // 资讯数据（低优先级）
    var articleData = [
        { type: 'article', typeName: '资讯', title: '南宁游戏场KTV新开业优惠活动', desc: '南宁游戏场KTV优惠活动，新开业大酬宾', url: 'article-detail.html?id=1', keywords: '南宁KTV 游戏场KTV 优惠活动' },
        { type: 'article', typeName: '资讯', title: '南宁KTV预订攻略：四大分区全覆盖', desc: '南宁KTV预订攻略，覆盖四大分区KTV', url: 'article-detail.html?id=2', keywords: '南宁KTV预订 KTV攻略' },
        { type: 'article', typeName: '资讯', title: '南宁高端量贩场KTV排行榜发布', desc: '南宁高端量贩场KTV排行榜，最新排名', url: 'article-detail.html?id=3', keywords: '高端量贩场KTV KTV排行' },
        { type: 'article', typeName: '资讯', title: '南宁KTV行业发展趋势分析', desc: '南宁KTV行业发展趋势分析报告', url: 'article-detail.html?id=4', keywords: '南宁KTV 行业趋势' },
        { type: 'article', typeName: '资讯', title: '南宁商务场KTV品质升级，体验再提升', desc: '南宁商务场KTV品质升级，全新体验', url: 'article-detail.html?id=5', keywords: '商务场KTV 品质升级' }
    ];

    // 合并数据：KTV在前（高优先级），资讯在后
    var allData = ktvData.concat(articleData);

    // ==========================================
    // 模糊搜索函数
    // ==========================================
    function fuzzyMatch(text, query) {
        if (!text || !query) return false;
        text = text.toLowerCase();
        query = query.toLowerCase();
        // 直接包含
        if (text.indexOf(query) !== -1) return true;
        // 模糊：query的每个字符按顺序出现在text中
        var ti = 0;
        for (var qi = 0; qi < query.length; qi++) {
            var found = false;
            while (ti < text.length) {
                if (text[ti] === query[qi]) {
                    found = true;
                    ti++;
                    break;
                }
                ti++;
            }
            if (!found) return false;
        }
        return true;
    }

    function search(query) {
        if (!query || query.trim().length === 0) return [];
        query = query.trim();

        var results = [];
        allData.forEach(function(item) {
            var score = 0;
            // 标题匹配（权重最高）
            if (item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1) score += 10;
            else if (fuzzyMatch(item.title, query)) score += 5;
            // 描述匹配
            if (item.desc.toLowerCase().indexOf(query.toLowerCase()) !== -1) score += 6;
            else if (fuzzyMatch(item.desc, query)) score += 3;
            // 关键词匹配
            if (item.keywords && item.keywords.toLowerCase().indexOf(query.toLowerCase()) !== -1) score += 4;
            // KTV类型优先
            if (item.type === 'ktv') score += 2;

            if (score > 0) {
                results.push({ item: item, score: score });
            }
        });

        // 按分数降序
        results.sort(function(a, b) { return b.score - a.score; });
        return results.slice(0, 10).map(function(r) { return r.item; });
    }

    // ==========================================
    // DOM 交互
    // ==========================================
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function initSearch() {
        var searchInput = document.querySelector('.header-search-input');
        var searchBtn = document.querySelector('.header-search-btn');
        var searchResults = document.querySelector('.header-search-results');
        if (!searchInput || !searchResults) return;

        var debounceTimer = null;

        function doSearch() {
            var query = searchInput.value.trim();
            if (query.length === 0) {
                searchResults.classList.remove('show');
                searchResults.innerHTML = '';
                return;
            }
            var results = search(query);
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-empty">未找到相关结果</div>';
            } else {
                var html = '';
                results.forEach(function(item) {
                    html += '<a href="' + escapeHtml(item.url) + '" class="search-result-item" rel="nofollow">';
                    html += '<div class="result-type">' + escapeHtml(item.typeName) + '</div>';
                    html += '<div class="result-title">' + escapeHtml(item.title) + '</div>';
                    html += '<div class="result-desc">' + escapeHtml(item.desc) + '</div>';
                    html += '</a>';
                });
                searchResults.innerHTML = html;
            }
            searchResults.classList.add('show');
        }

        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(doSearch, 300);
        });

        searchInput.addEventListener('focus', function() {
            if (searchInput.value.trim().length > 0) {
                doSearch();
            }
        });

        searchBtn.addEventListener('click', function() {
            doSearch();
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                doSearch();
            }
            if (e.key === 'Escape') {
                searchResults.classList.remove('show');
                searchInput.blur();
            }
        });

        // 点击外部关闭
        document.addEventListener('click', function(e) {
            var searchWrap = document.querySelector('.header-search');
            if (searchWrap && !searchWrap.contains(e.target)) {
                searchResults.classList.remove('show');
            }
        });
    }

    // ==========================================
    // 移动端搜索弹窗
    // ==========================================
    function initSearchPopup() {
        var overlay = document.getElementById('searchPopupOverlay');
        var openBtns = document.querySelectorAll('.bottom-nav-search-btn');
        var popupInput = document.querySelector('.search-popup-input');
        var popupBtn = document.querySelector('.search-popup-btn');
        var popupResults = document.querySelector('.search-popup-results');

        if (!overlay || !popupInput || !popupResults) return;

        var debounceTimer = null;

        function openPopup() {
            overlay.classList.add('show');
            setTimeout(function() {
                popupInput.focus();
            }, 100);
        }

        function closePopup() {
            overlay.classList.remove('show');
            popupInput.value = '';
            popupResults.classList.remove('show');
            popupResults.innerHTML = '';
        }

        function doPopupSearch() {
            var query = popupInput.value.trim();
            if (query.length === 0) {
                popupResults.classList.remove('show');
                popupResults.innerHTML = '';
                return;
            }
            var results = search(query);
            if (results.length === 0) {
                popupResults.innerHTML = '<div class="search-empty">未找到相关结果</div>';
            } else {
                var html = '';
                results.forEach(function(item) {
                    html += '<a href="' + escapeHtml(item.url) + '" class="search-result-item" rel="nofollow">';
                    html += '<div class="result-type">' + escapeHtml(item.typeName) + '</div>';
                    html += '<div class="result-title">' + escapeHtml(item.title) + '</div>';
                    html += '<div class="result-desc">' + escapeHtml(item.desc) + '</div>';
                    html += '</a>';
                });
                popupResults.innerHTML = html;
            }
            popupResults.classList.add('show');
        }

        // 底部导航搜索按钮打开弹窗
        openBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openPopup();
            });
        });

        // 点击搜索弹窗背景（.search-popup-wrap 外部）关闭弹窗
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closePopup();
            }
        });

        // 弹窗内搜索输入
        popupInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(doPopupSearch, 300);
        });

        popupInput.addEventListener('focus', function() {
            if (popupInput.value.trim().length > 0) {
                doPopupSearch();
            }
        });

        popupBtn.addEventListener('click', function() {
            doPopupSearch();
        });

        popupInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                doPopupSearch();
            }
            if (e.key === 'Escape') {
                closePopup();
            }
        });

        // 点击搜索结果链接后关闭弹窗
        popupResults.addEventListener('click', function(e) {
            var link = e.target.closest('a.search-result-item');
            if (link) {
                closePopup();
            }
        });
    }

    // DOM就绪后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initSearch();
            initSearchPopup();
        });
    } else {
        initSearch();
        initSearchPopup();
    }
})();

// ==========================================
// Header 滚动阴影效果（全局）
// ==========================================
(function() {
    var header = document.querySelector('.header');
    if (!header) return;

    var scrollThreshold = 10;

    function onScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
