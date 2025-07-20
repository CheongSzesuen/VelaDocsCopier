// ==================== 精确路径映射函数 ====================
const getGitHubDocUrl = (path) => {
  const baseUrl = 'https://cdn.jsdelivr.net/gh/CheongSzesuen/VelaDocs@refs/heads/main/docs';
  
  // 处理首页
  if (path === '/vela/quickapp/' || path === '/vela/quickapp') {
    return `${baseUrl}/index.md`;
  }
  
  // 处理/zh/guide/start.html → guide/start.md
  if (path === '/vela/quickapp/zh/guide/start.html') {
    return `${baseUrl}/guide/start.md`;
  }
  
  // 处理/zh/guide/ → guide/index.md
  if (path === '/vela/quickapp/zh/guide/') {
    return `${baseUrl}/guide/index.md`;
  }
  
  // 处理/zh/guide/framework/template/ → guide/framework/template/index.md
  if (path === '/vela/quickapp/zh/guide/framework/template/') {
    return `${baseUrl}/guide/framework/template/index.md`;
  }
  
  // 处理/zh/guide/framework/template/Props.html → guide/framework/template/Props.md
  if (path === '/vela/quickapp/zh/guide/framework/template/Props.html') {
    return `${baseUrl}/guide/framework/template/Props.md`;
  }
  
  // 通用规则：处理其他.html结尾的页面
  if (path.endsWith('.html')) {
    const relativePath = path
      .replace('/vela/quickapp/zh/', '')
      .replace('.html', '.md');
    return `${baseUrl}/${relativePath}`;
  }
  
  // 通用规则：处理目录路径（以/结尾）
  if (path.endsWith('/')) {
    const relativePath = path
      .replace('/vela/quickapp/zh/', '')
      .replace(/\/$/, '');
    return `${baseUrl}/${relativePath}/index.md`;
  }
  
  // 默认情况下添加.md后缀
  const relativePath = path
    .replace('/vela/quickapp/zh/', '');
  return `${baseUrl}/${relativePath}.md`;
};

// ==================== 按钮创建与样式 ====================
const createCopyButton = () => {
  const button = document.createElement('div');
  button.className = 'vela-docs-copy-btn-container';
  button.innerHTML = `
    <button id="vela-docs-copy-btn" title="把当前页面复制为Markdown">
      <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
      <span class="copy-text">复制</span>
    </button>
  `;
  return button;
};

// ==================== 按钮操作逻辑 ====================
const setupCopyButton = (buttonContainer) => {
  const button = buttonContainer.querySelector('#vela-docs-copy-btn');
  const icon = button.querySelector('.copy-icon');
  const text = button.querySelector('.copy-text');
  
  button.addEventListener('click', async () => {
    try {
      // 更新按钮状态
      icon.innerHTML = '<path d="M12 2v4M12 18v4M4 12H2M22 12h-2"></path>';
      text.textContent = '获取中...';
      button.disabled = true;
      button.classList.add('loading');
      
      // 获取并复制文档
      const docUrl = getGitHubDocUrl(window.location.pathname);
      const response = await fetch(docUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      await navigator.clipboard.writeText(content);
      
      // 成功状态
      icon.innerHTML = '<path d="M20 6L9 17l-5-5"></path>';
      text.textContent = '已复制';
      
    } catch (error) {
      console.error('复制失败:', error);
      icon.innerHTML = '<path d="M18 6L6 18M6 6l12 12"></path>';
      text.textContent = '失败';
      
      // 在控制台显示详细信息以便调试
      console.log('当前路径:', window.location.pathname);
      console.log('尝试访问的URL:', getGitHubDocUrl(window.location.pathname));
      
    } finally {
      // 1.5秒后恢复
      setTimeout(() => {
        icon.innerHTML = '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>';
        text.textContent = '复制';
        button.disabled = false;
        button.classList.remove('loading');
      }, 1200);
    }
  });
};

// ==================== DOM操作 ====================
const insertCopyButton = () => {
  // 检查是否已存在按钮
  if (document.getElementById('vela-docs-copy-btn')) return;
  
  // 尝试在h1标题附近插入按钮
  const h1 = document.querySelector('h1');
  if (h1) {
    const buttonContainer = createCopyButton();
    
    // 创建flex容器包裹h1和按钮
    const flexContainer = document.createElement('div');
    flexContainer.className = 'vela-docs-title-container';
    
    // 替换原有h1的父元素结构
    h1.parentNode.insertBefore(flexContainer, h1);
    flexContainer.appendChild(h1);
    flexContainer.appendChild(buttonContainer);
    
    setupCopyButton(buttonContainer);
    return;
  }
  
  // 如果没有h1，回退到导航栏
  const navLinks = document.querySelector('.navbar .nav-links') || 
                 document.querySelector('.navbar .links');
  
  if (navLinks) {
    const buttonContainer = createCopyButton();
    buttonContainer.className = 'nav-item vela-docs-copy-item';
    navLinks.appendChild(buttonContainer);
    setupCopyButton(buttonContainer);
  }
};

// ==================== 初始化 ====================
const init = () => {
  insertCopyButton();
  
  // 监听DOM变化（适用于单页应用）
  const observer = new MutationObserver((mutations) => {
    // 检查页面主要内容区域的变化
    const mainContent = document.querySelector('.page, .theme-default-content, main');
    if (mainContent) {
      const hasContentChange = mutations.some(mutation => 
        mutation.target === mainContent || 
        mutation.target.contains(mainContent) ||
        mutation.target.classList.contains('navbar') ||
        mutation.target.classList.contains('nav-links') ||
        mutation.target.tagName === 'H1'
      );
      
      if (hasContentChange) {
        insertCopyButton();
      }
    }
  });
  
  // 监听整个文档和URL变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
  
  // 添加路由变化监听（针对单页应用）
  window.addEventListener('popstate', insertCopyButton);
};

// 启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}