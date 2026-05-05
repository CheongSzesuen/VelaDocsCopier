const DOC_BASE_URLS = [
  'https://cdn.jsdelivr.net/gh/CheongSzesuen/VelaDocs@main/docs/zh',
  'https://fastly.jsdelivr.net/gh/CheongSzesuen/VelaDocs@main/docs/zh',
  'https://gcore.jsdelivr.net/gh/CheongSzesuen/VelaDocs@main/docs/zh',
  'https://raw.githubusercontent.com/CheongSzesuen/VelaDocs/main/docs/zh'
];

const COPY_ICON = '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>';
const LOADING_ICON = '<path d="M12 2v4M12 18v4M4 12H2M22 12h-2"></path>';
const SUCCESS_ICON = '<path d="M20 6L9 17l-5-5"></path>';
const ERROR_ICON = '<path d="M18 6L6 18M6 6l12 12"></path>';

// ==================== 精确路径映射函数 ====================
const getDocRelativePath = (path) => {
  // 定义需要移除的前缀
  const prefixToRemove = '/vela/quickapp/zh';

  // 检查路径是否以指定前缀开头
  if (path.startsWith(prefixToRemove)) {
    // 移除前缀
    let relativePath = path.substring(prefixToRemove.length);

    // 如果移除前缀后路径为空或仅为根路径 '/', 则映射到 docs/zh/index.md
    if (relativePath === '' || relativePath === '/') {
      return '/index.md';
    }

    // 处理目录路径（以/结尾）
    if (relativePath.endsWith('/')) {
      relativePath = relativePath.slice(0, -1); // 移除结尾的 /
      // 如果移除后为空，说明原路径是 /vela/quickapp/zh/，已处理过
      // 否则，映射到该目录下的 index.md
      return `${relativePath}/index.md`;
    }

    // 处理 .html 文件
    if (relativePath.endsWith('.html')) {
      relativePath = relativePath.replace(/\.html$/, '.md');
      return relativePath;
    }

    // 默认情况：假设是 .md 文件路径，但通常网页路径不会直接是 .md，所以这可能用于处理特殊情况
    // 如果路径不以 / 结尾且不以 .html 结尾，直接拼接 .md
    if (!relativePath.endsWith('.md')) {
      relativePath += '.md';
    }
    return relativePath;
  } else {
    // 如果路径不包含预期的前缀，可以处理为根目录或其他逻辑
    // 根据您的需求，这里可以选择返回根 index.md 或抛出错误
    // 当前处理为根目录 index.md
    console.warn(`Path does not start with expected prefix '${prefixToRemove}': ${path}`);
    return '/index.md'; // 或者根据实际需求处理
  }
};

const getDocUrls = (path) => {
  const relativePath = getDocRelativePath(path);
  return DOC_BASE_URLS.map((baseUrl) => `${baseUrl}${relativePath}`);
};

const fetchMarkdownContent = async (urls) => {
  const fetchFromUrl = async (url) => {
    try {
      console.log('尝试访问的URL:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const content = await response.text();

      if (contentType.includes('text/html') || /^\s*<!doctype html/i.test(content) || /^\s*<html/i.test(content)) {
        throw new Error('响应内容是 HTML，不是 Markdown');
      }

      return {
        content,
        url
      };
    } catch (error) {
      console.warn('文档源访问失败:', url, error);
      throw new Error(`${url} -> ${error.message}`);
    }
  };

  try {
    return await Promise.any(urls.map(fetchFromUrl));
  } catch (error) {
    const errors = error.errors?.map((item) => item.message) || [error.message];
    throw new Error(`所有文档源访问失败：${errors.join('；')}`);
  }
};

// ==================== 按钮创建与样式 ====================
const createCopyButton = () => {
  const button = document.createElement('div');
  button.className = 'vela-docs-copy-btn-container';
  button.innerHTML = `
    <button id="vela-docs-copy-btn" title="把当前页面复制为Markdown">
      <svg xmlns="http://www.w3.org/2000/svg" class="copy-icon lucide lucide-copy-icon lucide-copy" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${COPY_ICON}
      </svg>
      <span class="copy-text">复制本页</span>
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
      icon.innerHTML = LOADING_ICON;
      text.textContent = '获取中...';
      button.disabled = true;
      button.classList.add('loading');

      // 获取并复制文档
      const docUrls = getDocUrls(window.location.pathname);
      const { content, url } = await fetchMarkdownContent(docUrls);
      await navigator.clipboard.writeText(content);
      console.log('已复制文档来源:', url);

      // 成功状态
      icon.innerHTML = SUCCESS_ICON;
      text.textContent = '已复制';

    } catch (error) {
      console.error('复制失败:', error);
      icon.innerHTML = ERROR_ICON;
      text.textContent = '失败';

      // 在控制台显示详细信息以便调试
      console.log('当前路径:', window.location.pathname);
      console.log('尝试访问的URL列表:', getDocUrls(window.location.pathname));

    } finally {
      // 1.5秒后恢复
      setTimeout(() => {
        icon.innerHTML = COPY_ICON;
        text.textContent = '复制本页';
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
};
