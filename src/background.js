// 监听插件安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Vela Docs Copier 已安装');
});

// 提供跨页面通信支持（示例）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentUrl') {
    sendResponse({ url: sender.tab.url });
  }
});