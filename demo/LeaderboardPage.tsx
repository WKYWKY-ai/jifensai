import React, { useState, useEffect } from 'react';

interface Message {
    id: number;
    nickname: string;
    realName: string;
    content: string;
    timestamp: string;
    points: number;
    rotate: number;
    type: 'story' | 'attendee' | 'referral';
}

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<{ rank: number; name: string; realName: string; points: number }[]>([]);
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<{ rank: number; name: string; realName: string; points: number }[]>([]);
    const [activeTab, setActiveTab] = useState<'total' | 'weekly'>('total');
    const [isAdminMode, setIsAdminMode] = useState(false);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('zh-CN', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const GIST_ID = 'c7ca64e4072d38f6ce31ecb2b16e4088';
    const STORAGE_URL = `https://api.github.com/gists/${GIST_ID}`;

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const getWeekRange = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        let startOfWeek: Date;
        let endOfWeek: Date;
        
        if (dayOfWeek === 6) {
            startOfWeek = today;
        } else {
            const diff = dayOfWeek - 6;
            startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - diff);
        }
        
        endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return { startOfWeek, endOfWeek };
    };

    const isInCurrentWeek = (timestamp: string) => {
        const messageDate = new Date(timestamp.replace(/-/g, '/'));
        const { startOfWeek, endOfWeek } = getWeekRange();
        
        return messageDate >= startOfWeek && messageDate <= endOfWeek;
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(STORAGE_URL);
            if (response.ok) {
                const data = await response.json();
                if (data && data.files && data.files['gistfile1.txt']) {
                    const content = data.files['gistfile1.txt'].content;
                    if (content) {
                        const messages: Message[] = JSON.parse(content);
                        processMessages(messages);
                        processWeeklyMessages(messages);
                        localStorage.setItem('sparkParkMessages', content);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch from GitHub Gist:', error);
        }
        
        const savedMessages = localStorage.getItem('sparkParkMessages');
        if (savedMessages) {
            try {
                const messages: Message[] = JSON.parse(savedMessages);
                processMessages(messages);
                processWeeklyMessages(messages);
                return;
            } catch (error) {
                console.error('Failed to parse messages:', error);
            }
        }
        
        setLeaderboard([{ rank: 1, name: '暂无玩家', points: 0 }]);
        setWeeklyLeaderboard([{ rank: 1, name: '暂无玩家', points: 0 }]);
    };

    const processMessages = (messages: Message[]) => {
        const playerData: { [key: string]: { realName: string; points: number } } = {};
        messages.forEach(msg => {
            if (!playerData[msg.nickname]) {
                playerData[msg.nickname] = { realName: msg.realName || msg.nickname, points: 0 };
            }
            playerData[msg.nickname].points += msg.points;
        });

        const sortedPlayers = Object.entries(playerData)
            .map(([name, data]) => ({ name, realName: data.realName, points: data.points }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map((player, index) => ({
                rank: index + 1,
                ...player
            }));

        setLeaderboard(sortedPlayers.length > 0 ? sortedPlayers : [{ rank: 1, name: '暂无玩家', realName: '', points: 0 }]);
    };

    const processWeeklyMessages = (messages: Message[]) => {
        const weeklyMessages = messages.filter(msg => isInCurrentWeek(msg.timestamp));
        
        const playerData: { [key: string]: { realName: string; points: number } } = {};
        weeklyMessages.forEach(msg => {
            if (!playerData[msg.nickname]) {
                playerData[msg.nickname] = { realName: msg.realName || msg.nickname, points: 0 };
            }
            playerData[msg.nickname].points += msg.points;
        });

        const sortedPlayers = Object.entries(playerData)
            .map(([name, data]) => ({ name, realName: data.realName, points: data.points }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map((player, index) => ({
                rank: index + 1,
                ...player
            }));

        setWeeklyLeaderboard(sortedPlayers.length > 0 ? sortedPlayers : [{ rank: 1, name: '本周暂无玩家', realName: '', points: 0 }]);
    };

    const getWeekLabel = () => {
        const { startOfWeek, endOfWeek } = getWeekRange();
        const formatDate = (date: Date) => {
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        };
        return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    };

    const scoreRules = [
        { name: '帮助 support 添加 1 场 attendee', points: '+1积分' },
        { name: '推荐 1个 attendee', points: '+10积分' },
        { name: '有 1个 阳光故事', points: '+20积分' },
    ];

    const getTitle = (points: number) => {
        if (points >= 300) return '太阳王者';
        if (points >= 200) return '阳光使者';
        if (points >= 100) return '种太阳能手';
        if (points >= 50) return '阳光学徒';
        if (points > 10) return '阳光新手';
        return '种子选手';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🏆';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}`;
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return { background: 'linear-gradient(135deg, #ffd700, #ffb700)', color: '#fff', boxShadow: '0 4px 8px rgba(255,215,0,0.4)' };
        if (rank === 2) return { background: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', color: '#fff', boxShadow: '0 4px 8px rgba(192,192,192,0.4)' };
        if (rank === 3) return { background: 'linear-gradient(135deg, #cd7f32, #b87333)', color: '#fff', boxShadow: '0 4px 8px rgba(205,127,50,0.4)' };
        return { background: '#f5f5f5', color: '#666', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #1e4a8c 0%, #2b4d8f 50%, #1a2b4d 100%)',
            padding: '20px',
            fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        }}>
            {/* Header - Locker style */}
            <div style={{
                background: 'linear-gradient(180deg, #255a9c 0%, #1e4a8c 100%)',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                position: 'relative',
                border: '1px solid #163a6b',
            }}>
                {/* Metal frame corners */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '20px',
                    height: '20px',
                    borderTop: '3px solid #8fa8c8',
                    borderLeft: '3px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    borderTop: '3px solid #8fa8c8',
                    borderRight: '3px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    width: '20px',
                    height: '20px',
                    borderBottom: '3px solid #8fa8c8',
                    borderLeft: '3px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    borderBottom: '3px solid #8fa8c8',
                    borderRight: '3px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                
                {/* Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <a href="#/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🩵</span>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '4px', letterSpacing: '2px' }}>
                                SPARK PARK
                            </div>
                        </div>
                    </a>
                    
                    {/* Combination lock */}
                    <div style={{
                        background: 'linear-gradient(180deg, #c0c0c0 0%, #a0a0a0 100%)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                        border: '1px solid #888',
                    }}>
                        <div style={{
                            background: '#1a1a1a',
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                            }}>
                                <div style={{
                                    background: '#444',
                                    width: '24px',
                                    height: '4px',
                                    borderRadius: '2px',
                                }} />
                                <div style={{
                                    background: '#444',
                                    width: '24px',
                                    height: '4px',
                                    borderRadius: '2px',
                                }} />
                                <div style={{
                                    background: '#444',
                                    width: '24px',
                                    height: '4px',
                                    borderRadius: '2px',
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Believe sticky note */}
                <div style={{
                    background: '#fef08a',
                    padding: '12px 16px',
                    transform: 'rotate(-1.5deg)',
                    boxShadow: '3px 3px 8px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                    position: 'relative',
                    marginBottom: '16px',
                }}>
                    {/* Black tape corners */}
                    <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '8px',
                        width: '25px',
                        height: '25px',
                        background: '#1a1a1a',
                        borderRadius: '1px',
                        transform: 'rotate(-10deg)',
                        opacity: 0.9,
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '8px',
                        width: '25px',
                        height: '25px',
                        background: '#1a1a1a',
                        borderRadius: '1px',
                        transform: 'rotate(10deg)',
                        opacity: 0.9,
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '8px',
                        width: '25px',
                        height: '25px',
                        background: '#1a1a1a',
                        borderRadius: '1px',
                        transform: 'rotate(10deg)',
                        opacity: 0.9,
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '8px',
                        width: '25px',
                        height: '25px',
                        background: '#1a1a1a',
                        borderRadius: '1px',
                        transform: 'rotate(-10deg)',
                        opacity: 0.9,
                    }} />
                    
                    {/* Tear lines */}
                    <div style={{
                        position: 'absolute',
                        top: '30%',
                        left: '30%',
                        width: '2px',
                        height: '40%',
                        background: '#1e4a8c',
                        opacity: 0.25,
                        transform: 'rotate(2deg)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '35%',
                        left: '50%',
                        width: '2px',
                        height: '35%',
                        background: '#1e4a8c',
                        opacity: 0.2,
                        transform: 'rotate(-2deg)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '32%',
                        left: '68%',
                        width: '2px',
                        height: '38%',
                        background: '#1e4a8c',
                        opacity: 0.25,
                        transform: 'rotate(1deg)',
                    }} />
                    
                    <span style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: '#1e4a8c', 
                        letterSpacing: '3px',
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        BELIEVE
                    </span>
                </div>
                
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', textAlign: 'right' }}>
                    {formattedDate}
                </div>
            </div>

            {/* Score Rules - Sticky note style */}
            <div style={{
                background: '#fef08a',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '3px 5px 12px rgba(0,0,0,0.25)',
                transform: 'rotate(-0.5deg)',
                position: 'relative',
            }}>
                {/* Tape */}
                <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '16px',
                    background: 'linear-gradient(90deg, #d4c4a8, #e8dcc4, #d4c4a8)',
                    opacity: 0.7,
                    borderRadius: '2px',
                }} />
                
                <h2 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#333', 
                    margin: '0 0 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                }}>
                    📝 积分获取规则
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {scoreRules.map((rule, index) => (
                        <div 
                            key={index}
                            style={{
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: '4px',
                                padding: '10px 12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid rgba(0,0,0,0.1)',
                            }}
                        >
                            <span style={{ fontSize: '13px', color: '#333' }}>{rule.name}</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2e7d32' }}>{rule.points}</span>
                        </div>
                    ))}
                </div>
                <div style={{ 
                    marginTop: '14px', 
                    padding: '10px 12px', 
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '4px',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    border: '1px dashed rgba(0,0,0,0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#555' }}>🎁 200积分有惊喜</span>
                    </div>
                </div>
            </div>

            {/* Title System - Notebook paper style */}
            <div style={{
                background: '#f5e6d3',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '3px 5px 12px rgba(0,0,0,0.25)',
                transform: 'rotate(-0.3deg)',
                position: 'relative',
                borderTop: '30px solid #8b7355',
            }}>
                {/* Spiral binding */}
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: 0,
                    right: 0,
                    height: '30px',
                    background: '#f5e6d3',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '10px',
                }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div 
                            key={i} 
                            style={{
                                background: '#c0c0c0',
                                width: '10px',
                                height: '18px',
                                borderRadius: '50%',
                                marginRight: '12px',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                            }} 
                        />
                    ))}
                </div>
                
                <h2 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#333', 
                    margin: '0 0 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    borderBottom: '2px solid #8b4513',
                    paddingBottom: '8px',
                }}>
                    🏅 称号系统
                </h2>
                <div style={{ paddingLeft: '10px', lineHeight: '2.2' }}>
                    <div style={{ 
                        fontSize: '16px', 
                        color: '#f5c518', 
                        fontWeight: 'bold', 
                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                    }}>
                        1. 太阳王者 ............ 300积分以上
                    </div>
                    <div style={{ 
                        fontSize: '16px', 
                        color: '#f5c518', 
                        fontWeight: 'bold', 
                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                    }}>
                        2. 阳光使者 ............ 200积分以上
                    </div>
                    <div style={{ 
                        fontSize: '16px', 
                        color: '#f5c518', 
                        fontWeight: 'bold', 
                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                    }}>
                        3. 种太阳能手 ............ 100积分以上
                    </div>
                    <div style={{ 
                        fontSize: '16px', 
                        color: '#f5c518', 
                        fontWeight: 'bold', 
                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                    }}>
                        4. 阳光学徒 ............ 50积分以上
                    </div>
                    <div style={{ 
                        fontSize: '16px', 
                        color: '#f5c518', 
                        fontWeight: 'bold', 
                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                    }}>
                        5. 阳光新手 ............ 10积分以上
                    </div>
                    <div style={{ 
                        fontSize: '16px', 
                        color: '#f5c518', 
                        fontWeight: 'bold', 
                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                    }}>
                        6. 种子选手 ............ 10积分及以下
                    </div>
                </div>
            </div>

            {/* Leaderboard - Trophy case style */}
            <div style={{
                background: 'linear-gradient(180deg, #255a9c 0%, #1e4a8c 100%)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '1px solid #163a6b',
                position: 'relative',
            }}>
                {/* Metal frame corners */}
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    width: '16px',
                    height: '16px',
                    borderTop: '2px solid #8fa8c8',
                    borderLeft: '2px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '16px',
                    height: '16px',
                    borderTop: '2px solid #8fa8c8',
                    borderRight: '2px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '6px',
                    width: '16px',
                    height: '16px',
                    borderBottom: '2px solid #8fa8c8',
                    borderLeft: '2px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    width: '16px',
                    height: '16px',
                    borderBottom: '2px solid #8fa8c8',
                    borderRight: '2px solid #8fa8c8',
                    opacity: 0.8,
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <h2 style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#f5c518', 
                        margin: '0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                    }}>
                        🏆 排行榜
                    </h2>
                    
                    {/* Tab Switcher */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '4px',
                    }}>
                        <button
                            onClick={() => setActiveTab('total')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: activeTab === 'total' ? '#1e4a8c' : '#fff',
                                background: activeTab === 'total' ? '#f5c518' : 'transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            🏅 总排行榜
                        </button>
                        <button
                            onClick={() => setActiveTab('weekly')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: activeTab === 'weekly' ? '#1e4a8c' : '#fff',
                                background: activeTab === 'weekly' ? '#f5c518' : 'transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            📅 本周排行 ({getWeekLabel()})
                        </button>
                    </div>
                    
                    {/* Admin Mode Toggle */}
                    <button
                        onClick={() => setIsAdminMode(!isAdminMode)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: isAdminMode ? '#fff' : '#8fa8c8',
                            background: isAdminMode ? '#f44336' : 'transparent',
                            transition: 'all 0.2s',
                        }}
                    >
                        🔑 {isAdminMode ? '退出管理员模式' : '管理员模式'}
                    </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>排名</th>
                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>玩家昵称</th>
                                {isAdminMode && (
                                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#f44336' }}>真实姓名</th>
                                )}
                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                                    {activeTab === 'total' ? '总经验值' : '本周积分'}
                                </th>
                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>称号</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'total' ? leaderboard : weeklyLeaderboard).map((player, index) => (
                                <tr 
                                    key={index} 
                                    style={{ 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    <td style={{ padding: '10px' }}>
                                        <span 
                                            style={{
                                                ...getRankStyle(player.rank),
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {getRankIcon(player.rank)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ fontSize: '14px', color: '#fff' }}>{player.name}</span>
                                    </td>
                                    {isAdminMode && (
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ fontSize: '14px', color: '#f44336', fontStyle: 'italic' }}>{player.realName || '-'}</span>
                                        </td>
                                    )}
                                    <td style={{ padding: '10px', textAlign: 'right' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f5c518' }}>{player.points} 🌞</span>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'right' }}>
                                        <span style={{ 
                                            fontSize: '12px', 
                                            color: '#8fa8c8',
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                        }}>{getTitle(player.points)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center',
                marginTop: '20px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
            }}>
                <p>☀️ SPARK PARK - 每日阳光 ☀️</p>
            </div>
        </div>
    );
};

export default LeaderboardPage;
