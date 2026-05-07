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

interface UserStats {
    nickname: string;
    realName: string;
    totalPoints: number;
    storyCount: number;
    attendeeCount: number;
    referralCount: number;
    lastActive: string;
}

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'detail'>('users');
    const [loading, setLoading] = useState(true);

    const ADMIN_PASSWORD = 'TAAR765';

    useEffect(() => {
        const savedAuth = localStorage.getItem('sparkParkAdminAuth');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
            const interval = setInterval(fetchData, 10000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        const GIST_ID = 'c7ca64e4072d38f6ce31ecb2b16e4088';
        const STORAGE_URL = `https://api.github.com/gists/${GIST_ID}`;

        try {
            const response = await fetch(STORAGE_URL);
            if (response.ok) {
                const data = await response.json();
                if (data && data.files && data.files['gistfile1.txt']) {
                    const content = data.files['gistfile1.txt'].content;
                    if (content) {
                        const parsedMessages: Message[] = JSON.parse(content);
                        setMessages(parsedMessages);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            const savedMessages = localStorage.getItem('sparkParkMessages');
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
            localStorage.setItem('sparkParkAdminAuth', 'true');
        } else {
            setError('密码错误，请重试');
        }
    };

    const getUserStats = (): UserStats[] => {
        const userMap: { [nickname: string]: UserStats } = {};

        messages.forEach((msg) => {
            if (!userMap[msg.nickname]) {
                userMap[msg.nickname] = {
                    nickname: msg.nickname,
                    realName: msg.realName || '未设置',
                    totalPoints: 0,
                    storyCount: 0,
                    attendeeCount: 0,
                    referralCount: 0,
                    lastActive: msg.timestamp,
                };
            }

            userMap[msg.nickname].totalPoints += msg.points;
            userMap[msg.nickname].lastActive = msg.timestamp;

            if (msg.type === 'story') userMap[msg.nickname].storyCount++;
            if (msg.type === 'attendee') userMap[msg.nickname].attendeeCount++;
            if (msg.type === 'referral') userMap[msg.nickname].referralCount++;
        });

        return Object.values(userMap).sort((a, b) => b.totalPoints - a.totalPoints);
    };

    const getWeekRange = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        let startOfWeek: Date;

        if (dayOfWeek === 6) {
            startOfWeek = today;
        } else {
            const diff = dayOfWeek - 6;
            startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - diff);
        }

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    };

    const isInCurrentWeek = (timestamp: string) => {
        const messageDate = new Date(timestamp.replace(/-/g, '/'));
        const { startOfWeek, endOfWeek } = getWeekRange();
        return messageDate >= startOfWeek && messageDate <= endOfWeek;
    };

    const getWeeklyStats = (): UserStats[] => {
        const weeklyMessages = messages.filter((msg) => isInCurrentWeek(msg.timestamp));
        const userMap: { [nickname: string]: UserStats } = {};

        weeklyMessages.forEach((msg) => {
            if (!userMap[msg.nickname]) {
                userMap[msg.nickname] = {
                    nickname: msg.nickname,
                    realName: msg.realName || '未设置',
                    totalPoints: 0,
                    storyCount: 0,
                    attendeeCount: 0,
                    referralCount: 0,
                    lastActive: msg.timestamp,
                };
            }

            userMap[msg.nickname].totalPoints += msg.points;
            userMap[msg.nickname].lastActive = msg.timestamp;

            if (msg.type === 'story') userMap[msg.nickname].storyCount++;
            if (msg.type === 'attendee') userMap[msg.nickname].attendeeCount++;
            if (msg.type === 'referral') userMap[msg.nickname].referralCount++;
        });

        return Object.values(userMap).sort((a, b) => b.totalPoints - a.totalPoints);
    };

    const getTotalStats = () => {
        return {
            totalMessages: messages.length,
            totalPoints: messages.reduce((sum, msg) => sum + msg.points, 0),
            totalUsers: new Set(messages.map((msg) => msg.nickname)).size,
            weeklyPoints: messages
                .filter((msg) => isInCurrentWeek(msg.timestamp))
                .reduce((sum, msg) => sum + msg.points, 0),
        };
    };

    if (!isAuthenticated) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '40px',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                        <h1
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#fff',
                                margin: '0 0 8px',
                            }}
                        >
                            管理员登录
                        </h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                            请输入管理员密码以访问后台
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="password"
                            placeholder="请输入管理员密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '16px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                        {error && (
                            <p style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '8px' }}>
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        登录
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <a
                            href="#/messageboard"
                            style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}
                        >
                            ← 返回留言板
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const userStats = getUserStats();
    const weeklyStats = getWeeklyStats();
    const totalStats = getTotalStats();

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                padding: '20px',
                fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', sans-serif",
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '16px',
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: '0 0 4px' }}>
                            📊 管理员后台
                        </h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                            实时查看所有用户数据和积分信息
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={() => {
                                localStorage.removeItem('sparkParkAdminAuth');
                                setIsAuthenticated(false);
                                setPassword('');
                            }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                background: 'transparent',
                                color: '#fff',
                                fontSize: '14px',
                                cursor: 'pointer',
                            }}
                        >
                            退出登录
                        </button>
                        <a
                            href="#/messageboard"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                fontSize: '14px',
                                textDecoration: 'none',
                            }}
                        >
                            ← 返回留言板
                        </a>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            padding: '20px',
                            color: '#fff',
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalStats.totalUsers}</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>总用户数</div>
                    </div>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '16px',
                            padding: '20px',
                            color: '#fff',
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalStats.totalMessages}</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>总留言数</div>
                    </div>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            borderRadius: '16px',
                            padding: '20px',
                            color: '#fff',
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>☀️</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalStats.totalPoints}</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>总积分</div>
                    </div>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            borderRadius: '16px',
                            padding: '20px',
                            color: '#fff',
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalStats.weeklyPoints}</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>本周积分</div>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '4px',
                            borderRadius: '10px',
                            width: 'fit-content',
                        }}
                    >
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                background: activeTab === 'users' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                color: '#fff',
                            }}
                        >
                            👥 用户排行榜
                        </button>
                        <button
                            onClick={() => setActiveTab('detail')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                background: activeTab === 'detail' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                color: '#fff',
                            }}
                        >
                            📋 积分明细
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#fff' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <div>加载中...</div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'users' && (
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    overflowX: 'auto',
                                }}
                            >
                                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '16px' }}>
                                    🏆 总排行榜
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>排名</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>昵称</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>真实姓名</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>总积分</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>故事</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Attendee</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>推荐</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userStats.map((user, index) => (
                                            <tr
                                                key={user.nickname}
                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                <td style={{ padding: '12px 8px', color: '#fff' }}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                                </td>
                                                <td style={{ padding: '12px 8px', color: '#fff', fontWeight: 'bold' }}>{user.nickname}</td>
                                                <td style={{ padding: '12px 8px', color: '#f5576c' }}>{user.realName}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#4facfe', fontWeight: 'bold' }}>{user.totalPoints} ☀️</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#fff' }}>{user.storyCount}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#fff' }}>{user.attendeeCount}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#fff' }}>{user.referralCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <h3 style={{ color: '#fff', marginTop: '32px', marginBottom: '16px' }}>
                                    📅 本周排行榜
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>排名</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>昵称</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>真实姓名</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>本周积分</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>故事</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Attendee</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>推荐</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weeklyStats.map((user, index) => (
                                            <tr
                                                key={user.nickname}
                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                <td style={{ padding: '12px 8px', color: '#fff' }}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                                </td>
                                                <td style={{ padding: '12px 8px', color: '#fff', fontWeight: 'bold' }}>{user.nickname}</td>
                                                <td style={{ padding: '12px 8px', color: '#f5576c' }}>{user.realName}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#4facfe', fontWeight: 'bold' }}>{user.totalPoints} ☀️</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#fff' }}>{user.storyCount}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#fff' }}>{user.attendeeCount}</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#fff' }}>{user.referralCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'detail' && (
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    overflowX: 'auto',
                                }}
                            >
                                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '16px' }}>
                                    📋 所有留言明细
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>时间</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>昵称</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>真实姓名</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>类型</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>内容</th>
                                            <th style={{ padding: '12px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>积分</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messages.slice(0, 100).map((msg) => (
                                            <tr
                                                key={msg.id}
                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                <td style={{ padding: '12px 8px', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{msg.timestamp}</td>
                                                <td style={{ padding: '12px 8px', color: '#fff', fontWeight: 'bold' }}>{msg.nickname}</td>
                                                <td style={{ padding: '12px 8px', color: '#f5576c' }}>{msg.realName}</td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <span
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            background:
                                                                msg.type === 'story' ? '#ff9800' :
                                                                msg.type === 'referral' ? '#4caf50' : '#2196f3',
                                                            color: '#fff',
                                                        }}
                                                    >
                                                        {msg.type === 'story' ? '☀️ 故事' :
                                                         msg.type === 'referral' ? '⭐ 推荐' : '👤 Attendee'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 8px', color: '#fff', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {msg.content}
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#4facfe', fontWeight: 'bold' }}>+{msg.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {messages.length > 100 && (
                                    <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: '16px' }}>
                                        显示前 100 条记录，共 {messages.length} 条
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPage;