# 贡献指南

感谢您对本项目感兴趣！我们欢迎各种形式的贡献，包括但不限于代码提交、文档改进、功能建议和问题报告。

## 📋 开发环境设置

### 克隆项目
```bash
git clone https://github.com/your-username/server-status.git
cd server-status
```

### 安装依赖
```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖（如需构建工具）
cd ../frontend
npm install  # 可选，如果未来添加构建工具
```

### 启动开发服务器
```bash
# 后端服务
cd backend
python main.py

# 前端服务
cd ../frontend
# 直接打开 index.html 或使用 HTTP 服务器
python -m http.server 8000
```

## 🔧 开发规范

### 代码风格

#### Python 代码规范
- 遵循 [PEP 8](https://pep8.org/) 规范
- 使用 Black 进行代码格式化
- 所有函数和类都要有文档字符串

#### JavaScript 代码规范
- 遵循 ES6+ 语法标准
- 使用 2 个空格缩进
- 变量命名采用 camelCase
- 函数命名采用 PascalCase

#### 提交信息规范
使用 [约定式提交](https://www.conventionalcommits.org/) 格式：

```bash
feat: 添加新的服务器监控功能
fix: 修复内存泄漏问题
docs: 更新 API 文档
style: 调整代码格式
refactor: 重构数据获取逻辑
test: 添加单元测试
chore: 更新依赖版本
```

### 分支管理

- `main`: 主分支，稳定版本
- `develop`: 开发分支，功能整合
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `docs/*`: 文档分支

### 开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **开发功能**
   - 编写代码
   - 添加测试
   - 更新文档

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新的监控功能"
   ```

4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 详细描述变更内容
   - 关联相关 issue

## 🐛 报告问题

### 问题模板

```markdown
## 问题描述

## 重现步骤
1. 
2. 
3. 

## 预期行为

## 实际行为

## 环境信息
- 操作系统：
- Python 版本：
- 浏览器：
- 其他信息：
```

## 🚀 功能开发

### 添加新的监控指标

1. 在后端添加数据获取逻辑
2. 在前端添加可视化组件
3. 更新配置文件
4. 添加单元测试

### 扩展 API 接口

1. 遵循 RESTful 设计原则
2. 使用 FastAPI 类型注解
3. 添加 API 文档
4. 考虑向后兼容性

## 📚 文档要求

- 所有公共函数和类都要有文档字符串
- 复杂的业务逻辑要有行内注释
- API 接口要有详细的请求/响应示例
- 配置项要有说明文档

## 🧪 测试要求

### 后端测试
- 单元测试覆盖核心业务逻辑
- 集成测试覆盖 API 接口
- 性能测试确保系统稳定性

### 前端测试
- 功能测试覆盖用户交互
- 兼容性测试覆盖主流浏览器
- 性能测试确保页面加载速度

## 📦 发布流程

### 版本号规范
使用 [语义化版本](https://semver.org/)：
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 发布清单
- [ ] 更新版本号
- [ ] 更新 CHANGELOG.md
- [ ] 运行完整测试套件
- [ ] 更新文档
- [ ] 创建发布标签
- [ ] 发布到 GitHub Release

## 🤝 行为准则

我们致力于营造一个开放、包容的环境。请遵守以下行为准则：

- 尊重所有贡献者
- 建设性讨论，避免人身攻击
- 欢迎不同经验水平的开发者
- 耐心帮助新手

## 📞 联系方式

- 项目维护者：wututua@qq.com
- 讨论区：[GitHub Discussions](链接)
- 问题反馈：[GitHub Issues](链接)

---

感谢您的贡献！🙏