import React, { useState } from 'react';
import { Card, Divider, Button, Switch, Collapse, Typewriter } from '../src';
import { useIsMobile } from './tools';

// ============================================
// Syntax highlighting
// ============================================
const HL_TOKENS: { pattern: RegExp; style: React.CSSProperties }[] = [
    {
        pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        style: { color: '#6b5e50', fontStyle: 'italic', fontWeight: 400 },
    },
    {
        pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
        style: { color: '#a8d4a0' },
    },
    { pattern: /(<\/?[\w.]+|\/?>)/g, style: { color: '#f0a870' } },
    {
        pattern:
            /\b(import|from|const|let|var|function|return|export|default|true|false|null|undefined)\b/g,
        style: { color: '#d4a0e0' },
    },
    { pattern: /\b(npm|yarn|pnpm)\b/g, style: { color: '#f0a870' } },
    {
        pattern: /(install|uninstall|run|add|remove)\b/g,
        style: { color: '#a8d4a0' },
    },
    { pattern: /(\{|\})/g, style: { color: '#d4b896' } },
    { pattern: /(=>)/g, style: { color: '#d4a0e0' } },
    { pattern: /(--[\w-]+)(?=\s*:)/g, style: { color: '#e8c87a' } },
    { pattern: /(:root)/g, style: { color: '#f0a870' } },
    { pattern: /(#[0-9a-fA-F]{3,8})\b/g, style: { color: '#8ab8e0' } },
];

const highlightCode = (code: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const lines = code.split('\n');
    lines.forEach((line, li) => {
        type Seg = { start: number; end: number; style: React.CSSProperties };
        const segs: Seg[] = [];
        for (const t of HL_TOKENS) {
            const re = new RegExp(t.pattern.source, t.pattern.flags);
            let m: RegExpExecArray | null;
            while ((m = re.exec(line)) !== null) {
                const s =
                    m.index + (m[0] !== m[1] && m[1] ? m[0].indexOf(m[1]) : 0);
                const text = m[1] || m[0];
                segs.push({ start: s, end: s + text.length, style: t.style });
            }
        }
        segs.sort((a, b) => a.start - b.start);
        const merged: Seg[] = [];
        for (const seg of segs) {
            if (
                merged.length === 0 ||
                seg.start >= merged[merged.length - 1].end
            )
                merged.push(seg);
        }
        let idx = 0;
        for (const seg of merged) {
            if (seg.start > idx) parts.push(line.slice(idx, seg.start));
            parts.push(
                <span key={`${li}-${seg.start}`} style={seg.style}>
                    {line.slice(seg.start, seg.end)}
                </span>
            );
            idx = seg.end;
        }
        if (idx < line.length) parts.push(line.slice(idx));
        if (li < lines.length - 1) parts.push('\n');
    });
    return parts;
};

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
    <pre style={S.codeBox}>{highlightCode(code)}</pre>
);

const FeatureCard: React.FC<{ feature: typeof features[0] }> = ({ feature }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <Card
            style={{
                ...S.featureCard,
                transform: hovered ? 'translateY(-4px)' : 'none',
                boxShadow: hovered
                    ? '0 8px 24px rgba(114, 93, 66, 0.15)'
                    : 'none',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <img
                src={
                    new URL(
                        `./img/nook-phone/${feature.icon}`,
                        import.meta.url
                    ).href
                }
                style={{
                    width: 42,
                    height: 42,
                    transform: hovered
                        ? 'scale(1.1) rotate(-4deg)'
                        : 'scale(1) rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    animation: hovered ? 'iconBounce 0.4s ease forwards' : 'none',
                }}
                alt={feature.title}
            />
            <style>
                {`
                    @keyframes iconBounce {
                        0% { transform: scale(1) rotate(0deg); }
                        50% { transform: scale(1.2) rotate(-5deg); }
                        100% { transform: scale(1.1) rotate(-4deg); }
                    }
                `}
            </style>
            <div style={S.featureTitle}>{feature.title}</div>
            <div style={S.featureDesc}>{feature.desc}</div>
        </Card>
    );
};

// ============================================
// Styles
// ============================================
const S = {
    page: {
        width: '100%',
        minHeight: '100vh',
        overflowY: 'auto' as const,
    } as React.CSSProperties,

    // Hero
    hero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '60px 40px 40px',
    } as React.CSSProperties,
    heroContent: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 150,
        alignItems: 'center',
        maxWidth: 880,
        width: '100%',
    } as React.CSSProperties,
    heroContentMobile: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 32,
        alignItems: 'center',
        maxWidth: 880,
        width: '100%',
    } as React.CSSProperties,
    heroText: {
        textAlign: 'left' as const,
    } as React.CSSProperties,
    heroLogo: {
        fontSize: 72,
        lineHeight: 1,
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    } as React.CSSProperties,
    heroTitle: {
        fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        fontSize: 55,
        fontWeight: 800,
        lineHeight: 1.1,
        color: '#FFF9E6',
        textShadow: '0px 4px 1px rgba(0, 0, 0, 0.4)',
        margin: '0 0 12px',
    } as React.CSSProperties,
    heroVersion: {
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: 10,
        background: '#e6f9f6',
        color: '#19c8b9',
        marginLeft: 8,
        verticalAlign: 'middle',
        textShadow: 'none',
    } as React.CSSProperties,
    heroSubtitle: {
        fontSize: 17,
        color: '#7c5734',
        lineHeight: 1.7,
        margin: '0 0 28px',
        maxWidth: 520,
    } as React.CSSProperties,
    heroActions: {
        display: 'flex',
        gap: 16,
        alignItems: 'center',
    } as React.CSSProperties,

    // Sections
    section: {
        padding: '48px 40px',
        maxWidth: 960,
        margin: '0 auto',
    } as React.CSSProperties,
    sectionTitle: {
        fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        fontSize: 24,
        fontWeight: 700,
        color: '#725d42',
        margin: '0 0 8px',
        textAlign: 'center' as const,
    } as React.CSSProperties,
    sectionDesc: {
        fontSize: 14,
        color: '#7c5734',
        textAlign: 'center' as const,
        marginBottom: 32,
    } as React.CSSProperties,

    // Features
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
    } as React.CSSProperties,
    featureCard: {
        padding: '24px 20px',
        textAlign: 'center' as const,
    } as React.CSSProperties,
    featureIcon: { fontSize: 32, marginBottom: 12 } as React.CSSProperties,
    featureTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: '#725d42',
        marginBottom: 6,
    } as React.CSSProperties,
    featureDesc: {
        fontSize: 13,
        color: '#7c5734',
        lineHeight: 1.6,
        display: '-webkit-box' as const,
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis' as const,
    } as React.CSSProperties,

    // Component grid
    compGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
    } as React.CSSProperties,
    compCard: {
        padding: '16px 20px',
        cursor: 'pointer',
    } as React.CSSProperties,
    compName: {
        fontSize: 15,
        fontWeight: 700,
        color: '#725d42',
        marginBottom: 4,
    } as React.CSSProperties,
    compDesc: {
        fontSize: 12,
        color: '#7c5734',
        lineHeight: 1.5,
    } as React.CSSProperties,

    // Code block
    codeBox: {
        maxWidth: 600,
        margin: '0 auto',
        padding: '20px 28px',
        background: '#2b2118',
        border: '1px solid #3d3028',
        borderRadius: 20,
        fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
        fontSize: 13,
        fontWeight: 600,
        color: '#e8d5bc',
        textAlign: 'left' as const,
        lineHeight: 1.8,
        whiteSpace: 'pre' as const,
        overflow: 'auto' as const,
        tabSize: 4,
    } as React.CSSProperties,

    // Footer
    footer: {
        padding: '32px 40px',
        textAlign: 'center' as const,
        fontSize: 12,
        color: '#7c5734',
        marginTop: 32,
    } as React.CSSProperties,
    footerLinks: {
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 12,
    } as React.CSSProperties,
    footerLink: {
        fontSize: 13,
        color: '#7c5734',
        cursor: 'pointer',
    } as React.CSSProperties,
};

// ============================================
// Data
// ============================================
const features = [
    {
        icon: 'nook1.svg',
        title: 'Believe',
        desc: '像 Ted Lasso 一样，用信念和善意感染每一个人，阳光总在乌云之上',
    },
    {
        icon: 'Property-Shopping.svg',
        title: '13 个组件',
        desc: 'Button / Input / Switch / Modal / Typewriter / Card / Collapse / Cursor / Divider / Time / Phone / Footer / Icon',
    },
    {
        icon: 'Property-Camera.svg',
        title: '主题定制',
        desc: '40+ CSS 自定义属性，运行时换肤无需重新构建',
    },
    {
        icon: 'Property-Recipes.svg',
        title: '开箱即用',
        desc: 'ESM + CJS 双格式输出，TypeScript 类型声明完整',
    },
    {
        icon: 'Property-Helicopter.svg',
        title: 'Goldfish 哲学',
        desc: '金鱼只有 7 秒记忆，不为过去烦恼，活在当下，保持乐观',
    },
];

const components = [
    {
        key: 'button',
        name: 'Button',
        desc: '5 种类型、3 种尺寸、加载/危险/幽灵模式',
    },
    { key: 'input', name: 'Input', desc: '前后缀、一键清空、校验状态' },
    {
        key: 'switch',
        name: 'Switch',
        desc: '受控/非受控、自定义文案、加载状态',
    },
    { key: 'modal', name: 'Modal', desc: 'SVG 有机形状弹窗、ESC 关闭' },
    {
        key: 'typewriter',
        name: 'Typewriter',
        desc: '逐字打字机效果，支持多行与富内容',
    },
    { key: 'card', name: 'Card', desc: '默认/标题两种卡片风格' },
    { key: 'collapse', name: 'Collapse', desc: 'FAQ 折叠面板、平滑展开动画' },
    { key: 'cursor', name: 'Cursor', desc: '自定义手指光标' },
    { key: 'divider-comp', name: 'Divider', desc: '装饰性水平分割线' },
    { key: 'icon', name: 'Icon', desc: 'SVG 图标库' },
    { key: 'select', name: 'Select', desc: '下拉选择器，支持搜索' },
    { key: 'footer', name: 'Footer', desc: '页脚组件' },
    { key: 'time', name: 'Time', desc: '可爱风格时间显示' },
    { key: 'phone', name: 'Phone', desc: 'Phone 模拟器' },
];

// ============================================
// HomePage
// ============================================
interface HomePageProps {
    onNavigate?: (path: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const isMobile = useIsMobile();
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [showSun, setShowSun] = React.useState(false);
    
    const handleClick = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setShowSun(false);
        
        setTimeout(() => {
            setShowSun(true);
        }, 800);
        
        setTimeout(() => {
            onNavigate?.('/messageboard');
        }, 1500);
    };
    
    return (
    <div style={S.page}>
        {/* Hero */}
        <div style={{ ...S.hero }}>
            {/* 球门背景装饰 */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: 0.15,
            }}>
                <img
                    src={new URL('./img/icons/goal.svg', import.meta.url).href}
                    style={{ width: 600, height: 350 }}
                    alt="goal"
                />
            </div>
            
            {/* BELIEVE Banner - Ted Lasso Style */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 40,
                position: 'relative',
                zIndex: 1,
            }}>
                <div style={{
                    background: '#f5c518',
                    padding: '30px 60px',
                    border: '4px solid #1a2b4d',
                    boxShadow: '8px 8px 0 #1a2b4d, 12px 12px 0 rgba(26, 43, 77, 0.3)',
                    position: 'relative',
                }}>
                    {/* 胶带效果 */}
                    <div style={{
                        position: 'absolute',
                        top: -15,
                        left: 30,
                        width: 60,
                        height: 20,
                        background: 'linear-gradient(135deg, #d4a574 0%, #c49464 100%)',
                        transform: 'rotate(-15deg)',
                        borderRadius: 2,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        top: -15,
                        right: 30,
                        width: 60,
                        height: 20,
                        background: 'linear-gradient(135deg, #d4a574 0%, #c49464 100%)',
                        transform: 'rotate(15deg)',
                        borderRadius: 2,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: -15,
                        left: 30,
                        width: 60,
                        height: 20,
                        background: 'linear-gradient(135deg, #8b9dc3 0%, #7a8db3 100%)',
                        transform: 'rotate(15deg)',
                        borderRadius: 2,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: -15,
                        right: 30,
                        width: 60,
                        height: 20,
                        background: 'linear-gradient(135deg, #8b9dc3 0%, #7a8db3 100%)',
                        transform: 'rotate(-15deg)',
                        borderRadius: 2,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                    }}></div>
                    {/* 主文字 */}
                    <div style={{
                        fontFamily: "'Comic Sans MS', 'Chalkboard', 'Comic Neue', cursive, sans-serif",
                        fontWeight: 700,
                        fontSize: isMobile ? 36 : 56,
                        color: '#2b4d8f',
                        letterSpacing: 4,
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        textShadow: '2px 2px 0 rgba(255,255,255,0.5)',
                        transform: 'rotate(-1deg)',
                    }}>
                        BELIEVE
                    </div>
                    {/* 小装饰文字 */}
                    <div style={{
                        fontFamily: "'Comic Sans MS', cursive, sans-serif",
                        fontSize: isMobile ? 12 : 16,
                        color: '#5a6b8d',
                        textAlign: 'center',
                        marginTop: 8,
                        letterSpacing: 2,
                    }}>
                        ARE YOU READY TO COLLECT SUNS?
                    </div>
                </div>
            </div>
            <div style={{ ...(isMobile ? S.heroContentMobile : S.heroContent), position: 'relative', zIndex: 1 }}>
                <div style={isMobile ? { textAlign: 'center' as const } : S.heroText}>
                    <h1 style={{ ...S.heroTitle, fontSize: isMobile ? 37 : 60, color: '#f5c518' }}>
                        {isMobile ? 'Spark Park' : <>Spark <br /> Park</>}
                        <span style={{ ...S.heroVersion, color: '#d8e2f0' }}>v1.0.0</span>
                    </h1>
                    <Typewriter speed={60}>
                        <p style={{ ...S.heroSubtitle, fontSize: isMobile ? 14 : 17, color: '#d8e2f0' }}>
                            只有种下的太阳越多，这个公园才会汇聚更多的光源
                        </p>
                    </Typewriter>
                    <div style={{ 
                        ...S.heroActions, 
                        justifyContent: isMobile ? 'center' : 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 12 : 16,
                        flexWrap: 'wrap',
                    }}>
                        {/* 足球变太阳按钮 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? 10 : 14,
                            position: 'relative',
                        }}>
                            {/* 足球图标 */}
                            <div
                                onClick={handleClick}
                                style={{
                                    width: isMobile ? 50 : 60,
                                    height: isMobile ? 50 : 60,
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '3px solid #2b4d8f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '4px 4px 0 #1a2b4d',
                                    transition: 'all 0.3s ease',
                                    transform: isAnimating ? 'translateX(120px) rotate(720deg)' : 'translateX(0) rotate(0deg)',
                                    opacity: showSun ? 0 : 1,
                                    zIndex: 2,
                                }}
                            >
                                <img
                                    src={new URL('./img/icons/soccer-btn.svg', import.meta.url).href}
                                    style={{ width: '85%', height: '85%' }}
                                    alt="Soccer"
                                />
                            </div>
                            
                            {/* 太阳图标 - 动画后显示 */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: isMobile ? 50 : 60,
                                    width: isMobile ? 50 : 60,
                                    height: isMobile ? 50 : 60,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: showSun ? 1 : 0,
                                    transform: showSun ? 'translateX(80px) scale(1.2)' : 'translateX(0) scale(0.8)',
                                    transition: 'all 0.4s ease',
                                    zIndex: 3,
                                }}
                            >
                                <img
                                    src={new URL('./img/icons/sun.svg', import.meta.url).href}
                                    style={{ width: '100%', height: '100%' }}
                                    alt="Sun"
                                />
                            </div>
                            
                            {/* 文字 */}
                            <span style={{
                                fontSize: isMobile ? 14 : 18,
                                fontWeight: 600,
                                color: '#f5c518',
                                textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                                whiteSpace: 'nowrap',
                            }}>
                                种一颗太阳吧！
                            </span>
                        </div>
                        
                        {/* 积分排行榜按钮 */}
                        <button
                            onClick={() => onNavigate?.('/leaderboard')}
                            style={{
                                background: 'linear-gradient(135deg, #ffd700, #ffb700)',
                                border: 'none',
                                borderRadius: '20px',
                                padding: isMobile ? '8px 16px' : '10px 20px',
                                fontSize: isMobile ? 12 : 14,
                                fontWeight: 'bold',
                                color: '#333',
                                cursor: 'pointer',
                                boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translate(0, 0)';
                                e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.2)';
                            }}
                        >
                            <span>🏆</span>
                            <span>积分排行榜</span>
                        </button>
                        <a
                            href="#/admin"
                            style={{
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.5)',
                                textDecoration: 'none',
                                padding: '8px',
                            }}
                        >
                            🔐 管理员
                        </a>
                    </div>
                </div>
                {/* 浮动的足球和太阳装饰 */}
                {!isMobile && (
                    <>
                        <div style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            animation: 'float1 4s ease-in-out infinite',
                        }}>
                            <img src={new URL('./img/icons/soccer.svg', import.meta.url).href} style={{ width: 50, height: 50 }} alt="" />
                        </div>
                        <div style={{
                            position: 'absolute',
                            top: 100,
                            right: 80,
                            animation: 'float2 5s ease-in-out infinite',
                        }}>
                            <img src={new URL('./img/icons/sun.svg', import.meta.url).href} style={{ width: 40, height: 40 }} alt="" />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: 50,
                            right: 50,
                            animation: 'float3 3.5s ease-in-out infinite',
                        }}>
                            <img src={new URL('./img/icons/sun.svg', import.meta.url).href} style={{ width: 32, height: 32 }} alt="" />
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Activity Announcement */}
        <div style={{
            ...S.section,
            padding: isMobile ? '32px 16px' : '48px 40px',
            background: 'linear-gradient(135deg, #fff5e6 0%, #fff9f0 100%)',
            borderBottom: '3px solid #ffd93d',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                justifyContent: 'center',
            }}>
                <span style={{ fontSize: '24px' }}>📢</span>
                <div style={{
                    ...S.sectionTitle,
                    fontSize: isMobile ? 20 : 24,
                    color: '#c45c1e',
                    margin: 0,
                }}>
                    活动公告
                </div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '16px',
                maxWidth: 800,
                margin: '0 auto',
            }}>
                <Card
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #fff 0%, #fffaf0 100%)',
                        border: '2px dashed #ffd93d',
                        borderRadius: '16px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                        }}>
                            🌞
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#c45c1e',
                                marginBottom: '4px',
                            }}>
                                阳光故事征集
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: '#666',
                                lineHeight: 1.5,
                            }}>
                                分享你的成长故事，赢取双倍积分！活动截止：5月31日
                            </div>
                        </div>
                    </div>
                </Card>
                <Card
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #fff 0%, #f0f8ff 100%)',
                        border: '2px dashed #64b5f6',
                        borderRadius: '16px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #4fc3f7, #2196f3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0,
                        }}>
                            🎁
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#1976d2',
                                marginBottom: '4px',
                            }}>
                                推荐有礼
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: '#666',
                                lineHeight: 1.5,
                            }}>
                                邀请同事注册，双方各得10积分！
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>

        {/* Light Up */}
        <div style={{ ...S.section, padding: isMobile ? '32px 16px' : '48px 40px' }}>
            <div style={S.sectionTitle}>点亮你</div>
            <div style={S.features}>
                <a
                    href="https://www.apple.com.cn/today/calendar/mixchefei/?sn=R765"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                >
                    <Card
                        style={{
                            ...S.featureCard,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px',
                        }}
                    >
                        <img
                            src={new URL('./img/taa_icon.PNG', import.meta.url).href}
                            alt="TAA"
                            style={{ width: '48px', height: '48px' }}
                        />
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a2b4d', marginBottom: '4px' }}>
                                TAA @ Hefei
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                点击了解更多精彩活动 →
                            </div>
                        </div>
                    </Card>
                </a>
            </div>
        </div>

        <Divider style={{ width: isMobile ? '90%' : 800, margin: '0 auto' }} />

        {/* Ted Lasso Quotes */}
        <div style={{
            ...S.section,
            padding: isMobile ? '40px 20px' : '60px 40px',
            background: 'linear-gradient(180deg, #f0f4fa 0%, #fafbfd 100%)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: 32,
            }}>
                <img
                    src={new URL('./img/signpost_new.PNG', import.meta.url).href}
                    alt="Signpost"
                    style={{ width: '40px', height: '40px' }}
                />
                <div style={{
                    ...S.sectionTitle,
                    fontSize: isMobile ? 20 : 28,
                }}>
                    经典语录
                </div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: 20,
                maxWidth: 960,
                margin: '0 auto',
            }}>
                <div style={{
                    background: '#fff',
                    padding: '24px 20px',
                    borderRadius: 16,
                    borderLeft: '4px solid #2b4d8f',
                    boxShadow: '0 4px 12px rgba(43, 77, 143, 0.1)',
                    color: '#1a2b4d',
                    lineHeight: 1.6,
                }}>
                    <div style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '12px', color: '#333' }}>
                        "Stay hungry, stay foolish."
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        "求知若渴，虚怀若愚。"
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', textAlign: 'right', fontWeight: 'bold' }}>
                        — Steve Jobs
                    </div>
                </div>
                <div style={{
                    background: '#fff',
                    padding: '24px 20px',
                    borderRadius: 16,
                    borderLeft: '4px solid #f5c518',
                    boxShadow: '0 4px 12px rgba(245, 197, 24, 0.15)',
                    color: '#1a2b4d',
                    lineHeight: 1.6,
                }}>
                    <div style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '12px', color: '#333' }}>
                        "I skate to where the puck is going to be, not where it has been."
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        "我滑向冰球将要到达的地方，而不是它已经去过的地方。"
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', textAlign: 'right', fontWeight: 'bold' }}>
                        — Steve Jobs (引用 Wayne Gretzky)
                    </div>
                </div>
                <div style={{
                    background: '#fff',
                    padding: '24px 20px',
                    borderRadius: 16,
                    borderLeft: '4px solid #2b4d8f',
                    boxShadow: '0 4px 12px rgba(43, 77, 143, 0.1)',
                    color: '#1a2b4d',
                    lineHeight: 1.6,
                }}>
                    <div style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '12px', color: '#333' }}>
                        "Our goal is to make technology so invisible you forget it's there."
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        "我们的目标是让技术无形到让你忘记它的存在。"
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', textAlign: 'right', fontWeight: 'bold' }}>
                        — Tim Cook
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div style={{
            ...S.footer,
            padding: isMobile ? '24px 16px' : '40px 40px',
            background: 'linear-gradient(135deg, #2b4d8f 0%, #1a2b4d 100%)',
            color: '#f5c518',
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: 20,
            }}>
                <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: isMobile ? 24 : 32,
                    letterSpacing: 4,
                    marginBottom: 8,
                }}>
                    🌟 BELIEVE 🌟
                </div>
                <div style={{
                    fontSize: 14,
                    color: '#d8e2f0',
                }}>
                    Inspired by Ted Lasso · Blue & Gold Forever
                </div>
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                marginBottom: 16,
            }}>
                <span
                    style={{ ...S.footerLink, color: '#f5c518' }}
                    onClick={() => onNavigate?.('/button')}
                >
                    组件文档
                </span>
                <span
                    style={{ ...S.footerLink, color: '#f5c518' }}
                    onClick={() =>
                        window.open(
                            'https://github.com/guokaigdg/spark-park',
                            '_blank'
                        )
                    }
                >
                    GitHub
                </span>
            </div>
            <div style={{
                textAlign: 'center',
                fontSize: 13,
                color: '#d8e2f0',
            }}>
                Designed with 💛 by <span style={{ color: '#f5c518', fontWeight: 600 }}>Keyi Wang</span>
            </div>
            <div style={{
                textAlign: 'center',
                fontSize: 12,
                marginTop: 8,
                color: '#8b9dc3',
            }}>
                MIT License · React + TypeScript + Vite
            </div>
        </div>
    </div>
);
}

export default HomePage;
