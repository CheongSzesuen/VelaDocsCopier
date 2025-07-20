# Vela Docs Copier

## ✨ 功能特性

- **一键复制**：将小米Vela JS文档页面转换为Markdown格式并复制到剪贴板
- **智能路径映射**：自动匹配GitHub仓库中的对应Markdown文件
- **优雅UI**：美观的按钮设计和状态反馈
- **响应式设计**：适配不同屏幕尺寸
- **单页应用支持**：监听路由变化，自动重新插入按钮

## 🚀 使用方法

1. 安装Chrome扩展
2. 访问小米Vela JS文档页面（如：https://iot.mi.com/vela/quickapp/zh/guide/）
3. 点击页面右上角的"复制"按钮
4. 等待获取成功提示后，Markdown内容已复制到剪贴板
5. 粘贴到任何Markdown编辑器中使用

## 🔧 工作原理

1. **路径映射**：插件将当前页面URL转换为GitHub仓库中的对应Markdown文件路径
   - 例如：`/vela/quickapp/zh/guide/start.html` → `docs/guide/start.md`
   - 映射规则见：#路径映射函数

2. **内容获取**：从https://github.com/CheongSzesuen/VelaDocs获取对应的Markdown文件

3. **UI集成**：
   - 在页面标题旁插入复制按钮
   - 提供加载、成功和错误状态反馈
   - 自动适配不同页面布局

## 📁 相关项目

本插件依赖的Markdown文档仓库：
https://github.com/CheongSzesuen/VelaDocs

## 🛠️ 开发

### 项目结构
```
.
├── icons/                   # 扩展图标
│   ├── logo.png             # 主图标
│   └── logo.svg             # SVG源文件
├── src/
│   ├── main.js              # 核心逻辑
│   └── style.css            # 按钮样式
└── manifest.json            # 扩展清单
```

### 构建与测试
1. 克隆仓库
   ```bash
   git clone https://github.com/CheongSzesuen/VelaDocsCopier.git
   ```
2. 在Chrome中加载扩展：
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"，选择项目目录

## 🤝 贡献

欢迎提交Issue和PR！请确保：
- 代码风格一致
- 包含必要的测试
- 更新相关文档

## 📜 许可证

GPL © https://github.com/CheongSzesuen