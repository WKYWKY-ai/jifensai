# 🌞 Spark Park

<div align="center">
    <img src="docs/img/readme-home.png" alt="spark-park" style="border-radius: 12px; width: 40%; display: block; margin: 0 auto;" />
</div>
<div align="center">
只有种下的太阳越多，这个公园才会汇聚更多的光源
</div>
<br/>
<div align="center">
    <a href="https://github.com/guokaigdg/spark-park/stargazers"><img src="https://img.shields.io/github/stars/guokaigdg/spark-park?style=flat-square" alt="Stars"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License"></a>
</div>

## 介绍

本项目是基于 React + TypeScript 实现的轻量 UI 组件库，设计灵感来源于自然与光的意象——种下太阳，汇聚光源。

## 安装

```bash
npm install spark-park
```

## 快速上手

> ⚠️ **重要**: 请务必导入样式文件 `import 'spark-park/style'`，否则组件将没有样式与字体!

```tsx
import { Button, Card } from 'spark-park';
import 'spark-park/style';

function App() {
    return (
        <div>
            <Button type="primary">开始探索</Button>
            <Card color="app-blue">
                种下太阳，汇聚光源！
            </Card>
        </div>
    );
}
```

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/guokaigdg/spark-park.git
cd spark-park

# 安装依赖
npm install

# 启动 Demo 开发服务器
npm run dev

# 构建组件库
npm run build

# 构建 Demo 站点
npm run build:demo
```

## License

MIT
