// 监听浏览器扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
 chrome.tabs.create({ url: "https://iot.mi.com/vela/quickapp/" });
});