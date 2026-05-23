/**
 * 南宁KTV - 详情页脚本
 *
 * 功能：
 * 1. URL 参数解析（id、district）
 * 2. 门店详情渲染
 * 3. 同区推荐门店（固定5条，无分页，标题+介绍+图片）
 * 4. 联系我们电话弹窗
 *
 * 内联工具函数：escapeHtml / getQueryParam / DISTRICT_MAP / 汉堡菜单
 */

// ===== API 配置（后端对接：部署时只需修改此处，所有接口请求会自动拼接）=====
var API_BASE = '';  // 留空 = 相对路径；生产环境可设为 'https://api.nanningktv.com' 等

// --- 内联工具函数（原 common.js，已还原为各文件独立副本）---

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
    var items = document.querySelectorAll('.bottom-nav-item');
    items.forEach(function(item) {
        if (item.getAttribute('data-page') === 'ktv') {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
})();

// ==========================================
// 状态变量
// ==========================================

var currentId = '';          // 当前门店 ID
var currentDistrict = '';    // 当前地区拼音 slug
var RECOMMEND_COUNT = 5;     // 推荐列表固定展示条数

// ==========================================
// API 模拟（TODO: 后端对接 — 取消注释并删除 mock 数据即可）
// ==========================================

function fetchDetail(id, district) {
    // TODO: 后端对接 — 取消下行注释，删除下方 mock 数据
    // return fetchJSON(API_BASE + '/api/ktv/detail?id=' + id + '&district=' + district);

    var districtName = DISTRICT_MAP[district] ? DISTRICT_MAP[district].name : '游戏场';
    return Promise.resolve({
        id: id || '1',
        title: districtName + ' XX 娱乐场所（' + (id || '1') + '号店）',
        time: '2026-05-' + ((Number(id) < 10 ? '0' : '') + (id || '1')),
        address: districtName + ' XX 路 XX 号 XX 大厦',
        package: 'XX 套餐：XX 小时欢唱 + XX 饮品',
        description: '环境 XX 优雅，音响品质 XX，XX 聚会首选场所。',
        phone: '19968122123',
        district: district || 'youxi',
        images: ['url1.jpg', 'url2.jpg', 'url3.jpg']
    });
}

function fetchRecommend(district, excludeId) {
    // TODO: 后端对接 — 取消下行注释，删除下方 mock 数据
    // return fetchJSON(API_BASE + '/api/ktv/recommend?district=' + district + '&exclude=' + excludeId);

    var districtName = DISTRICT_MAP[district] ? DISTRICT_MAP[district].name : '游戏场';
    var list = [];
    var count = 0;
    for (var i = 1; i <= 12 && count < RECOMMEND_COUNT; i++) {
        if (String(i) === String(excludeId)) continue;
        list.push({
            id: String(i),
            title: districtName + ' XX 娱乐场所（' + i + '号店）',
            time: '2026-05-' + (i < 10 ? '0' + i : i),
            address: districtName + ' XX 路 XX 号 XX 大厦',
            package: 'XX 套餐：XX 小时欢唱 + XX 饮品',
            description: '环境 XX 优雅，音响品质 XX，XX 聚会首选场所。',
            phone: '19968122123',
            cover: ''
        });
        count++;
    }
    return Promise.resolve(list);
}

// ==========================================
// 渲染函数
// ==========================================

function renderDetail(data) {
    var h1 = document.getElementById('detailTitle');
    if (h1) h1.textContent = data.title || 'xx';

    var timeEl = document.getElementById('detailDate');
    if (timeEl) {
        timeEl.setAttribute('datetime', data.time || '');
        timeEl.textContent = data.time || '2026-xx-xx';
    }

    var addrEl = document.getElementById('detailAddress');
    if (addrEl) addrEl.textContent = data.address || 'xx';

    var contentEl = document.getElementById('detailContent');
    if (contentEl) {
        var paragraphs = (data.description || 'xx').split('\n').filter(function(p) { return p.trim(); });
        contentEl.innerHTML = paragraphs.map(function(p) {
            return '<p>' + escapeHtml(p) + '</p>';
        }).join('');
    }

    var imagesEl = document.getElementById('detailImages');
    if (imagesEl) {
        var images = data.images || [];
        if (images.length === 0) images = ['url1.jpg', 'url2.jpg', 'url3.jpg'];
        imagesEl.innerHTML = images.map(function(url) {
            if (url && url.indexOf('http') !== -1 && url.indexOf('url') === -1) {
                return '<figure><img src="' + escapeHtml(url) + '" alt="" loading="lazy"></figure>';
            }
            return '<figure><div class="img-placeholder"></div></figure>';
        }).join('');
    }

    var districtName = DISTRICT_MAP[data.district] ? DISTRICT_MAP[data.district].name : 'xx';

    updateSEOMeta(data, districtName);
}

function updateSEOMeta(data, districtName) {
    var title = (data.title || 'xx') + ' - 南宁KTV推荐_包厢预订_南宁商务场KTV';
    var desc = (data.title || 'xx') + ' 南宁商务场KTV，包厢环境、套餐价格、用户评价与预订电话一目了然。查看详情并在线预约。电话：19968122123。';
    var canonical = 'https://www.nanningktv.com/detail.html?district=' + (data.district || 'youxi') + '&id=' + (data.id || '1');
    var keywords = districtName + 'KTV,' + (data.title || '南宁KTV') + ',南宁KTV推荐,南宁KTV预订,南宁商务场KTV,19968122123';

    document.title = title;

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    var metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', keywords);

    var linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.setAttribute('href', canonical);

    // hreflang 动态同步
    var hreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    hreflangs.forEach(function(link) {
        if (link.getAttribute('hreflang') === 'zh-CN' || link.getAttribute('hreflang') === 'x-default') {
            link.setAttribute('href', canonical);
        }
    });

    // Open Graph 动态同步
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonical);

    var ogImageAlt = document.querySelector('meta[property="og:image:alt"]');
    if (ogImageAlt) ogImageAlt.setAttribute('content', (data.title || '南宁KTV') + ' — 门店详情');

    // og:image 动态同步（门店封面图）
    if (data.images && data.images.length > 0 && data.images[0] && data.images[0].indexOf('http') !== -1) {
        var ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', data.images[0]);
        var ogImageSecure = document.querySelector('meta[property="og:image:secure_url"]');
        if (ogImageSecure) ogImageSecure.setAttribute('content', data.images[0]);
        var twImage = document.querySelector('meta[name="twitter:image"]');
        if (twImage) twImage.setAttribute('content', data.images[0]);
        // 更新 JSON-LD 中的 image 字段
        var ldScript = document.getElementById('jsonld-detail');
        if (ldScript) {
            try {
                var ldData = JSON.parse(ldScript.textContent);
                ldData.image = data.images[0];
                ldScript.textContent = JSON.stringify(ldData);
            } catch(e) {}
        }
    }

    // Twitter Card 动态同步
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);

    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', desc);

    // JSON-LD 结构化数据动态同步
    var ldScript = document.getElementById('jsonld-detail');
    if (ldScript) {
        var ldData = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': data.title || 'xx',
            'telephone': data.phone || '19968122123',  // TODO: 后端对接 — phone 字段需从 API 返回，硬编码仅作兜底
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': '南宁市',
                'addressRegion': '广西壮族自治区',
                'addressCountry': 'CN',
                'streetAddress': data.address || 'xx'
            },
            'image': 'https://www.nanningktv.com/img/lbt.jpg',
            'url': canonical,
            'priceRange': '¥¥-¥¥¥',
            'openingHours': 'Mo-Su 00:00-23:59',
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.5',
                'reviewCount': '10',
                'bestRating': '5'
            }
        };
        ldScript.textContent = JSON.stringify(ldData);
    }

    // 动态更新面包屑结构化数据
    var breadcrumbScripts = document.querySelectorAll('script[type="application/ld+json"]');
    breadcrumbScripts.forEach(function(script) {
        try {
            var bd = JSON.parse(script.textContent);
            if (bd['@type'] === 'BreadcrumbList' && bd.itemListElement) {
                bd.itemListElement[1].name = districtName + 'KTV';
                bd.itemListElement[1].item = 'https://www.nanningktv.com/district.html?name=' + (data.district || 'youxi');
                bd.itemListElement[2].name = data.title || 'xx';
                bd.itemListElement[2].item = canonical;
                script.textContent = JSON.stringify(bd);
            }
        } catch(e) {}
    });
}

function renderRecommend(list) {
    var listEl = document.getElementById('recommendList');
    if (!listEl) return;

    var html = '';
    list.forEach(function(item) {
        var isCurrent = String(item.id) === String(currentId);
        var cardClass = 'recommend-card' + (isCurrent ? ' current' : '');
        var bgStyle = '';
        if (item.cover && item.cover.indexOf('http') !== -1 && item.cover.indexOf('url') === -1) {
            bgStyle = ' style="background-image:url(' + escapeHtml(item.cover) + ')"';
        }

        html += '<a href="detail.html?district=' + currentDistrict + '&id=' + encodeURIComponent(item.id) + '" class="' + cardClass + '"' + bgStyle + '>' +
            '<div class="recommend-card-overlay"></div>' +
            '<div class="recommend-card-body">' +
                '<div class="recommend-card-title">' + escapeHtml(item.title || 'xx') + '</div>' +
                '<div class="recommend-card-desc">' + escapeHtml(item.description || 'xx') + '</div>' +
            '</div>' +
        '</a>';
    });
    listEl.innerHTML = html;
}

// ==========================================
// 数据加载
// ==========================================

function loadDetail(id, district) {
    fetchDetail(id, district).then(function(data) {
        renderDetail(data);
        currentId = data.id || id;
    }).catch(function(err) {
        console.warn('加载详情失败:', err);
    });
}

function loadRecommend(district, excludeId) {
    fetchRecommend(district, excludeId).then(function(list) {
        renderRecommend(list);
    }).catch(function(err) {
        console.warn('加载推荐失败:', err);
    });
}

function updateActiveDistrict() {
    document.querySelectorAll('.detail-sidebar-left a[data-district]').forEach(function(link) {
        if (link.getAttribute('data-district') === currentDistrict) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    document.querySelectorAll('.mobile-district-tabs a[data-district]').forEach(function(link) {
        if (link.getAttribute('data-district') === currentDistrict) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateRecommendTitle() {
    var titleEl = document.getElementById('recommendTitle');
    if (titleEl) {
        var districtName = DISTRICT_MAP[currentDistrict] ? DISTRICT_MAP[currentDistrict].name : 'xx';
        titleEl.textContent = districtName + ' 门店推荐';
    }
}

// ==========================================
// 电话弹窗
// ==========================================

function openPhoneModal() {
    var overlay = document.getElementById('phoneModal');
    if (overlay) {
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closePhoneModal() {
    var overlay = document.getElementById('phoneModal');
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// ==========================================
// 初始化
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    currentId = getQueryParam('id') || '1';
    currentDistrict = getQueryParam('district') || 'youxi';

    updateActiveDistrict();
    updateRecommendTitle();
    loadDetail(currentId, currentDistrict);
    loadRecommend(currentDistrict, currentId);

    var contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openPhoneModal();
        });
    }

    var modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closePhoneModal);
    }

    var modalOverlay = document.getElementById('phoneModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closePhoneModal();
            }
        });
    }

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
