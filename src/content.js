// content.js

// ==================== 精确路径映射函数 ====================
const getGitHubDocUrl = (path) => {
  const baseUrl = 'https://raw.githubusercontent.com/CheongSzesuen/VelaDocs/refs/heads/main/docs';
  
  // 处理首页.
  if (path === '/vela/quickapp/' || path === '/vela/quickapp') {
    return `${baseUrl}/index.md`;
  }
  
  // 移除基础路径
  let relativePath = path.replace('/vela/quickapp', '');
  
  // 处理特殊路径映射
  if (relativePath.startsWith('/zh/guide/')) {
    const guidePath = relativePath.replace('/zh/guide/', '');
    
    // 处理带.html的路径（如use-ide.html → use-ide.md）
    if (guidePath.endsWith('.html')) {
      return `${baseUrl}/guide/${guidePath.replace('.html', '.md')}`;
    }
    
    // 处理目录路径（如/zh/guide/ → /guide/start/index.md）
    if (guidePath.endsWith('/') || guidePath === '') {
      if (guidePath.includes('framework/template/')) {
        return `${baseUrl}/guide/framework/template/index.md`;
      }
      return `${baseUrl}/guide/start/index.md`;
    }
    
    // 默认处理其他guide路径
    return `${baseUrl}/guide/${guidePath.replace(/\/$/, '')}.md`;
  }
  
  // 处理其他路径（如/zh/components/...）
  if (relativePath.endsWith('/')) {
    return `${baseUrl}${relativePath}index.md`;
  }
  
  if (relativePath.endsWith('.html')) {
    return `${baseUrl}${relativePath.replace('.html', '.md')}`;
  }
  
  // 默认添加.md后缀
  return `${baseUrl}${relativePath}.md`;
};

// ==================== 按钮操作逻辑 ====================
const createCopyButton = () => {
  const button = document.createElement('div');
  button.className = 'nav-item vela-docs-copy-item';
  button.innerHTML = `
    <a id="vela-docs-copy-btn" class="nav-link">
      <span class="copy-icon">📄</span>
      <span class="copy-text">复制文档</span>
    </a>
  `;
  return button;
};

const setupCopyButton = (button) => {
  const link = button.querySelector('a');
  
  link.addEventListener('click', async () => {
    const icon = link.querySelector('.copy-icon');
    const text = link.querySelector('.copy-text');
    
    try {
      // 更新按钮状态
      icon.textContent = '⏳';
      text.textContent = '获取中...';
      link.style.pointerEvents = 'none';
      link.classList.add('loading');
      
      // 获取并复制文档
      const docUrl = getGitHubDocUrl(window.location.pathname);
      const response = await fetch(docUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      await navigator.clipboard.writeText(content);
      
      // 成功状态
      icon.textContent = '✓';
      text.textContent = '已复制';
      
    } catch (error) {
      console.error('复制失败:', error);
      icon.textContent = '❌';
      text.textContent = '失败';
      
    } finally {
      // 3秒后恢复
      setTimeout(() => {
        icon.textContent = '📄';
        text.textContent = '复制文档';
        link.style.pointerEvents = '';
        link.classList.remove('loading');
      }, 2000);
    }
  });
};

// ==================== DOM操作 ====================
const insertCopyButton = () => {
  // 检查是否已存在按钮
  if (document.getElementById('vela-docs-copy-btn')) return;
  
  // 寻找最佳插入位置
  const navLinks = document.querySelector('.navbar .nav-links') || 
                 document.querySelector('.navbar .links');
  
  if (navLinks) {
    const button = createCopyButton();
    navLinks.appendChild(button);
    setupCopyButton(button);
  }
};

// ==================== 初始化 ====================
const init = () => {
  insertCopyButton();
  
  // 监听DOM变化（适用于单页应用）
  const observer = new MutationObserver((mutations) => {
    const hasNavbarChange = mutations.some(mutation => 
      mutation.target.classList.contains('navbar') ||
      mutation.target.classList.contains('nav-links')
    );
    
    if (hasNavbarChange) {
      insertCopyButton();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
};

// 启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}