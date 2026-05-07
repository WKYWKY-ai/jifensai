import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    nickname: string;
    realName: string;
    createdAt: string;
}

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

const MessageBoardPage: React.FC = () => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [registeredNickname, setRegisteredNickname] = useState('');
    const [registeredRealName, setRegisteredRealName] = useState('');
    const [registerNickname, setRegisterNickname] = useState('');
    const [registerRealName, setRegisterRealName] = useState('');
    const [content, setContent] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        const savedUser = localStorage.getItem('sparkParkUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setRegisteredNickname(user.nickname);
            setRegisteredRealName(user.realName);
            setIsRegistered(true);
        }
        
        fetchMessages();
        
        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    const GIST_ID = 'c7ca64e4072d38f6ce31ecb2b16e4088';
    const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
    const STORAGE_URL = `https://api.github.com/gists/${GIST_ID}`;

    const fetchMessages = async () => {
        try {
            const response = await fetch(STORAGE_URL);
            if (response.ok) {
                const data = await response.json();
                if (data && data.files && data.files['gistfile1.txt']) {
                    const content = data.files['gistfile1.txt'].content;
                    if (content) {
                        const parsedContent = JSON.parse(content);
                        if (Array.isArray(parsedContent)) {
                            const sortedData = parsedContent.sort((a: Message, b: Message) => b.id - a.id);
                            setMessages(sortedData.map((item: Message) => ({
                                ...item,
                                rotate: (Math.random() - 0.5) * 5
                            })));
                            
                            const totalPoints = parsedContent.reduce((sum: number, msg: Message) => sum + msg.points, 0);
                            setUserPoints(totalPoints);
                            
                            localStorage.setItem('sparkParkMessages', content);
                            localStorage.setItem('sparkParkPoints', totalPoints.toString());
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch from GitHub Gist:', error);
        }
        
        const savedMessages = localStorage.getItem('sparkParkMessages');
        if (savedMessages) {
            const parsedMessages = JSON.parse(savedMessages);
            const totalPoints = parsedMessages.reduce((sum: number, msg: Message) => sum + msg.points, 0);
            setUserPoints(totalPoints);
            localStorage.setItem('sparkParkPoints', totalPoints.toString());
            
            setMessages(parsedMessages.map((item: Message) => ({
                ...item,
                rotate: (Math.random() - 0.5) * 5
            })));
        }
    };

    const handleRegister = () => {
        if (!registerNickname.trim() || !registerRealName.trim()) {
            alert('请填写昵称和真实英文名！');
            return;
        }
        
        const user: User = {
            id: Date.now().toString(),
            nickname: registerNickname.trim(),
            realName: registerRealName.trim(),
            createdAt: new Date().toLocaleString('zh-CN'),
        };
        
        localStorage.setItem('sparkParkUser', JSON.stringify(user));
        setRegisteredNickname(user.nickname);
        setRegisteredRealName(user.realName);
        setIsRegistered(true);
        setRegisterNickname('');
        setRegisterRealName('');
    };

    const handleLogout = () => {
        localStorage.removeItem('sparkParkUser');
        setIsRegistered(false);
        setRegisteredNickname('');
        setRegisteredRealName('');
    };

    const saveMessage = async (message: Message) => {
        try {
            const getResponse = await fetch(STORAGE_URL);
            let currentMessages: Message[] = [];
            
            if (getResponse.ok) {
                const data = await getResponse.json();
                if (data && data.files && data.files['gistfile1.txt']) {
                    const content = data.files['gistfile1.txt'].content;
                    if (content) {
                        try {
                            currentMessages = JSON.parse(content);
                        } catch (parseError) {
                            console.error('Failed to parse messages:', parseError);
                            currentMessages = [];
                        }
                    }
                }
            } else {
                const localData = localStorage.getItem('sparkParkMessages');
                currentMessages = localData ? JSON.parse(localData) : [];
            }
            
            const updatedMessages = [message, ...currentMessages];
            const fileContent = JSON.stringify(updatedMessages, null, 2);
            
            const saveResponse = await fetch(STORAGE_URL, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${GITHUB_TOKEN}`
                },
                body: JSON.stringify({
                    files: {
                        'gistfile1.txt': {
                            content: fileContent
                        }
                    }
                }),
            });
            
            if (saveResponse.ok) {
                localStorage.setItem('sparkParkMessages', fileContent);
                setTimeout(() => fetchMessages(), 1500);
            } else {
                throw new Error('Failed to save to GitHub');
            }
        } catch (error) {
            console.error('Failed to save to GitHub Gist:', error);
            const updatedMessages = [message, ...messages];
            setMessages(updatedMessages);
            localStorage.setItem('sparkParkMessages', JSON.stringify(updatedMessages));
        }
    };

    const createMessage = (type: 'story' | 'attendee' | 'referral', customContent?: string) => {
        const randomRotate = (Math.random() - 0.5) * 5;
        let messageContent = customContent;
        if (!messageContent) {
            if (type === 'story') {
                messageContent = content.trim();
            } else if (type === 'referral') {
                messageContent = '推荐 attendee';
            } else {
                messageContent = '帮助 support 添加 attendee';
            }
        }
        const points = type === 'story' ? 20 : type === 'referral' ? 10 : 1;

        const newMessage: Message = {
            id: Date.now(),
            nickname: registeredNickname,
            realName: registeredRealName,
            content: messageContent || '',
            timestamp: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }),
            points: points,
            rotate: randomRotate,
            type: type,
        };

        saveMessage(newMessage);

        const newPoints = userPoints + points;
        setUserPoints(newPoints);
        localStorage.setItem('sparkParkPoints', newPoints.toString());

        if (type === 'story') {
            setContent('');
        }
    };

    const handleStorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            alert('请填写阳光故事内容！');
            return;
        }

        createMessage('story');
    };

    const handleAttendeeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMessage('attendee');
    };

    const handleReferralSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createMessage('referral');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#1e4a8c',
            backgroundImage: `
                repeating-linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0.03) 0px,
                    rgba(255, 255, 255, 0.03) 1px,
                    transparent 1px,
                    transparent 60px
                ),
                repeating-linear-gradient(
                    0deg,
                    rgba(255, 255, 255, 0.03) 0px,
                    rgba(255, 255, 255, 0.03) 1px,
                    transparent 1px,
                    transparent 60px
                )
            `,
            padding: '20px',
            fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        }}>
            {/* Header */}
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

                {/* Points display */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                }}>
                    <a href="#/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🩵</span>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#fff',
                            letterSpacing: '2px',
                        }}>
                            SPARK PARK
                        </div>
                    </a>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        {isRegistered && (
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <span style={{ fontSize: '14px' }}>👤</span>
                                <span style={{ fontSize: '14px', color: '#fff' }}>{registeredNickname}</span>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: 'none',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        padding: '2px 6px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    退出
                                </button>
                            </div>
                        )}
                        <div style={{
                            background: 'linear-gradient(135deg, #f5c518, #ffd700)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}>
                            <span style={{ fontSize: '18px' }}>☀️</span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e4a8c' }}>
                                {userPoints}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Believe sticky note */}
                <div style={{
                    background: '#fef08a',
                    padding: '30px 20px',
                    marginBottom: '10px',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '4px 6px 15px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.1)',
                    minHeight: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {/* Black tape corners */}
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        width: '35px',
                        height: '35px',
                        background: '#2a2a2a',
                        borderRadius: '3px',
                        transform: 'rotate(-15deg)',
                        opacity: 0.9,
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '35px',
                        height: '35px',
                        background: '#2a2a2a',
                        borderRadius: '3px',
                        transform: 'rotate(15deg)',
                        opacity: 0.9,
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        width: '35px',
                        height: '35px',
                        background: '#2a2a2a',
                        borderRadius: '3px',
                        transform: 'rotate(15deg)',
                        opacity: 0.9,
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        width: '35px',
                        height: '35px',
                        background: '#2a2a2a',
                        borderRadius: '3px',
                        transform: 'rotate(-15deg)',
                        opacity: 0.9,
                    }} />

                    {/* Torn paper effect */}
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        left: '28%',
                        width: '3px',
                        height: '60%',
                        background: '#1e4a8c',
                        opacity: 0.3,
                        transform: 'rotate(2deg)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '25%',
                        left: '45%',
                        width: '4px',
                        height: '50%',
                        background: '#1e4a8c',
                        opacity: 0.25,
                        transform: 'rotate(-3deg)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '30%',
                        left: '62%',
                        width: '3px',
                        height: '45%',
                        background: '#1e4a8c',
                        opacity: 0.3,
                        transform: 'rotate(1deg)',
                    }} />

                    <span style={{
                        fontSize: '52px',
                        fontWeight: 'bold',
                        color: '#1e4a8c',
                        letterSpacing: '8px',
                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        BELIEVE
                    </span>
                </div>
            </div>

            {/* Forms Section */}
            <div style={{
                background: '#f5e6d3',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '3px 5px 12px rgba(0,0,0,0.25)',
                borderTop: '30px solid #8b7355',
                position: 'relative',
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
                        <div key={i} style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#8b7355',
                            border: '2px solid #6b5344',
                        }} />
                    ))}
                </div>

                {/* Register Form */}
                {!isRegistered ? (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '16px',
                            fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                        }}>
                            👋 欢迎来到 Spark Park！请先注册
                        </div>
                        <div style={{
                            background: '#fffef0',
                            padding: '16px',
                            borderRadius: '6px',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    🎭 昵称（显示在排行榜上）
                                </div>
                                <input
                                    type="text"
                                    placeholder="请输入你想显示的昵称..."
                                    value={registerNickname}
                                    onChange={(e) => setRegisterNickname(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: 'none',
                                        borderRadius: '2px',
                                        fontSize: '14px',
                                        background: '#fff',
                                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    👤 真实英文名（仅管理员可见）
                                </div>
                                <input
                                    type="text"
                                    placeholder="请输入你的真实英文名..."
                                    value={registerRealName}
                                    onChange={(e) => setRegisterRealName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: 'none',
                                        borderRadius: '2px',
                                        fontSize: '14px',
                                        background: '#fff',
                                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleRegister}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #2b4d8f, #1a2b4d)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '12px 20px',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    boxShadow: '3px 3px 0 rgba(0,0,0,0.25)',
                                    fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                    e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.25)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translate(0, 0)';
                                    e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.25)';
                                }}
                            >
                                ✨ 注册
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Story Form */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#333',
                                marginBottom: '8px',
                                fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                            }}>
                                📝 阳光故事 (+20积分)
                            </div>
                            <div style={{
                                background: '#fffef0',
                                padding: '12px',
                                borderRadius: '2px',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                                minHeight: '100px',
                                marginBottom: '10px',
                                position: 'relative',
                            }}>
                                {/* Lines */}
                                <div style={{
                                    position: 'absolute',
                                    inset: '12px',
                                    backgroundImage: `
                                        repeating-linear-gradient(
                                            0deg,
                                            transparent 0px,
                                            transparent 26px,
                                            #e8d4b8 26px,
                                            #e8d4b8 27px
                                        )
                                    `,
                                    pointerEvents: 'none',
                                }} />
                                <textarea
                                    placeholder="今天你是如何种太阳、点亮他人的呢？..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        padding: 0,
                                        border: 'none',
                                        borderRadius: '2px',
                                        fontSize: '15px',
                                        resize: 'none',
                                        background: 'transparent',
                                        fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                        lineHeight: '28px',
                                        color: '#333',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleStorySubmit}
                                style={{
                                    background: 'linear-gradient(135deg, #2b4d8f, #1a2b4d)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    boxShadow: '3px 3px 0 rgba(0,0,0,0.25)',
                                    fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                    e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.25)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translate(0, 0)';
                                    e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.25)';
                                }}
                            >
                                🌞 种下太阳
                            </button>
                        </div>

                        {/* Divider */}
                        <div style={{
                            borderBottom: '1px dashed #ccc',
                            margin: '20px 0',
                        }} />

                        {/* Quick Actions */}
                        <div style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '12px',
                            fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                        }}>
                            ⚡ 快速积分
                        </div>

                        {/* Attendee Form */}
                        <div style={{
                            background: 'rgba(255,255,255,0.5)',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '12px',
                            border: '1px solid rgba(0,0,0,0.1)',
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: '#666',
                                marginBottom: '8px',
                                fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                            }}>
                                👤 帮助 support 添加 attendee (+1积分)
                            </div>
                            <button
                                type="button"
                                onClick={handleAttendeeSubmit}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                +1 积分
                            </button>
                        </div>

                        {/* Referral Form */}
                        <div style={{
                            background: 'rgba(255,255,255,0.5)',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0,0,0,0.1)',
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: '#666',
                                marginBottom: '8px',
                                fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                            }}>
                                ⭐ 推荐 attendee (+10积分)
                            </div>
                            <button
                                type="button"
                                onClick={handleReferralSubmit}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #f5c518, #ffa000)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                +10 积分
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Messages Grid */}
            <div style={{
                background: 'rgba(30, 74, 140, 0.8)',
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
            }}>
                <h2 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    margin: '0 0 16px',
                    fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                }}>
                    🌻 阳光留言墙 ({messages.length})
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '16px',
                }}>
                    {messages.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '40px',
                            color: '#fff',
                        }}>
                            <span style={{ fontSize: '48px' }}>🌱</span>
                            <p style={{ marginTop: '12px', fontSize: '14px' }}>还没有阳光故事，快来种下第一颗太阳吧！</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                style={{
                                    background: message.type === 'story' ? '#fef08a' :
                                               message.type === 'referral' ? '#ffe0b0' : '#e3f2fd',
                                    borderRadius: '2px',
                                    padding: '16px',
                                    boxShadow: '4px 4px 10px rgba(0,0,0,0.3)',
                                    transform: `rotate(${message.rotate}deg)`,
                                    position: 'relative',
                                    minHeight: '120px',
                                }}
                            >
                                {/* Tape */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60px',
                                    height: '16px',
                                    background: 'linear-gradient(90deg, #d4c4a8, #e8dcc4, #d4c4a8)',
                                    borderRadius: '2px',
                                    opacity: 0.6,
                                }} />

                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '14px' }}>
                                            {message.type === 'story' ? '☀️' : message.type === 'referral' ? '⭐' : '👤'}
                                        </span>
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                                            {message.nickname}
                                        </span>
                                    </div>
                                    <span style={{
                                        background: message.type === 'story' ? '#ff9800' :
                                                   message.type === 'referral' ? '#ffa000' : '#4caf50',
                                        padding: '2px 8px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                    }}>
                                        +{message.points}
                                    </span>
                                </div>

                                {/* Content */}
                                <p style={{
                                    fontSize: '13px',
                                    color: '#333',
                                    margin: 0,
                                    lineHeight: '1.5',
                                    fontFamily: "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                                }}>
                                    {message.content}
                                </p>

                                {/* Timestamp */}
                                <div style={{ fontSize: '10px', color: '#888', textAlign: 'right', marginTop: '8px' }}>
                                    {message.timestamp}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBoardPage;