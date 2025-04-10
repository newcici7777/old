// function mobilePageScrollToAnchor(element) {
//     $(element).closest('li.chapter').find('ul>li').removeClass('active');
//     $(element).parent().addClass('active');
//     if ($(document).width() <= 1240) {
//         $('div.body-inner').animate({scrollTop: $($(element).attr('href')).get(0).offsetTop});
//     }
//     return false;
// }
// Function to expand the parent directory based on the current URL
function expandCurrentDirectory() {
    const currentPath = window.location.pathname; // 獲取當前頁面的路徑
    const chapters = document.querySelectorAll('li.chapter'); // 獲取所有帶有 class="chapter" 的 li 元素

    chapters.forEach(chapter => {
        const links = chapter.querySelectorAll('a'); // 獲取該章節下的所有連結
        let shouldExpand = false;

        links.forEach(link => {
            const linkPath = link.getAttribute('href'); // 獲取連結的路徑
            if(linkPath != "/") {
              if (currentPath.includes(linkPath)) {
                  shouldExpand = true; // 如果當前路徑包含連結路徑，則標記為需要展開
              }
            }
        });

        if (shouldExpand) {
            chapter.classList.add('active'); // 添加 active class
            const sublist = chapter.querySelector('ul');
            if (sublist) {
                sublist.style.display = 'block'; // 顯示子目錄
            }
        } else {
            chapter.classList.remove('active'); // 移除 active class
            const sublist = chapter.querySelector('ul');
            if (sublist) {
                sublist.style.display = 'none'; // 隱藏子目錄
            }
        }
    });
}

// 初始化函數 - 只執行一次
function initSidebarByURL() {
    const currentPath = window.location.pathname;
    
    // 1. 收合所有章節
    document.querySelectorAll('[data-nav-item].chapter').forEach(item => {
        item.classList.remove('expanded', 'active');
        const sublist = item.querySelector('ul');
        if (sublist) sublist.style.display = 'none';
    });

    // 2. 找到當前頁面對應的鏈接
    const currentLink = document.querySelector(`[data-nav-link][href="${currentPath}"]`);
    if (!currentLink) return;
    
    // 3. 標記當前頁面
    currentLink.classList.add('current-link');
    const currentLi = currentLink.closest('[data-nav-item]');
    currentLi.classList.add('current-page');
    
    // 4. 展開目錄鏈 (父級 -> 當前 -> 子級)
    const expandPath = [];
    let parent = currentLi;
    
    // 向上收集所有父級
    while ((parent = parent.parentElement.closest('[data-nav-item]'))) {
        expandPath.push(parent);
    }
    
    // 從頂層開始展開
    expandPath.reverse().forEach(chapter => {
        chapter.classList.add('expanded', 'active');
        const sublist = chapter.querySelector('ul');
        if (sublist) sublist.style.display = 'block';
    });
    
    // 展開當前項的子級
    const expandChildren = (element) => {
        const sublist = element.querySelector('ul');
        if (sublist) {
            sublist.style.display = 'block';
            element.classList.add('expanded', 'active');
            sublist.querySelectorAll('[data-nav-item]').forEach(expandChildren);
        }
    };
    expandChildren(currentLi);
}

// 點擊處理函數 - 獨立運作
function setupSidebarClickHandlers() {
    document.querySelector('.book-summary').addEventListener('click', function(e) {
        const link = e.target.closest('[data-nav-link]');
        if (!link || link.hasAttribute('data-ignore-click')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // 獲取基礎URL和錨點（自動解碼）
        const [baseUrl, encodedHash] = link.href.split('#');
        const currentUrl = window.location.href.split('#')[0];
        
        // 處理相同頁面的錨點跳轉
        if (currentUrl === baseUrl && encodedHash) {
            const decodedHash = decodeURIComponent(encodedHash);
            
            // 方法1：使用原生JS跳轉
            const targetElement = document.getElementById(decodedHash);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                return;
            }
            
            // // 方法2：使用jQuery備用方案
            // try {
            //     const $target = $(`#${decodedHash.replace(/\./g, '\\.')}`);
            //     if ($target.length) {
            //         $('div.body-inner').animate({
            //             scrollTop: $target.offset().top - 20
            //         }, 400);
            //         return;
            //     }
            // } catch (e) {
            //     console.warn('錨點跳轉失敗:', e);
            // }
            
            // // 方法3：最終回退方案
            // window.location.hash = encodedHash;
            return;
        }

        const chapter = link.closest('[data-nav-item]');
        const sublist = chapter.querySelector('ul');
        
        // 只處理有子目錄的章節
        if (sublist) {
            const isExpanding = sublist.style.display === 'none' || !sublist.style.display;
            
            // 收合同層級其他章節
            const parentList = chapter.closest('ul');
            if (parentList) {
                parentList.querySelectorAll('[data-nav-item]').forEach(item => {
                    if (item !== chapter) {
                        item.classList.remove('expanded', 'active');
                        const otherSublist = item.querySelector('ul');
                        if (otherSublist) otherSublist.style.display = 'none';
                    }
                });
            }
            
            // 切換當前章節
            sublist.style.display = isExpanding ? 'block' : 'none';
            chapter.classList.toggle('expanded', isExpanding);
            chapter.classList.toggle('active', isExpanding);
        }
        
        // 實際頁面導航
        if (link.href && link.href !== '#') {
            window.location.href = link.href;
        }
    }, true);
}

// 初始化執行
document.addEventListener('DOMContentLoaded', function() {
    initSidebarByURL();   // 只執行一次的URL初始化
    setupSidebarClickHandlers();  // 持續監聽點擊事件
});