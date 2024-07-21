import React, { useState, useEffect, useRef } from 'react';
import './community.css';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { format, isSameDay } from 'date-fns';
import LoadingScreen from '../components/loadingScreen';

function Community() {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [coursesCount, setCoursesCount] = useState(0);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    const userRef = doc(firestore, 'users', currentUser.email);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (typeof data.courses === 'string') {
                            data.courses = data.courses.split(',').map(course => course.trim());
                        }
                        setUserData(data);
                        setCoursesCount(data.courses.length); // Update courses count
                    } else {
                        setError('User data not found.');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError('Failed to fetch user data. Please try again.');
                }
            }
            setLoading(false)
        };

        fetchUserData();
    }, [currentUser]);

    // Fetch chat messages for selected course
    useEffect(() => {
        setLoading(true);
        if (selectedCourse) {
            const q = query(collection(firestore, 'messages', selectedCourse, 'courseMessages'), orderBy('timestamp', 'asc'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const messagesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
                setLoading(false);
                scrollToBottom();
            });

            return () => unsubscribe();

        }
    }, [selectedCourse]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || selectedCourse === '') return;
        try {
            const messageRef = await addDoc(collection(firestore, 'messages', selectedCourse, 'courseMessages'), {
                sender: currentUser.email,
                name: userData.SName,
                content: newMessage,
                timestamp: null
            });
            await updateDoc(messageRef, {
                timestamp: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');
        }
        setLoading(false)
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const createLinkMarkup = (content) => {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlPattern);

        return parts.map((part, index) => 
            urlPattern.test(part) ? (
                <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
            ) : (
                <span key={index}>{part}</span>
            )
        );
    };

    return (
        <div className="dashboard">
            {loading && <LoadingScreen />}
            <h1>Community</h1>
            <p>Message thread to chat with mentors and interact with other users.</p>
            <div className='solid-line'></div>

            {userData && (
                <div className="course-select">
                    <label>Select Course:</label>
                    <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                        <option value="" disabled>Select a course</option>
                        {userData.courses.map((course) => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedCourse && (
                <div className="chat-box">
                    <div className="messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.sender === currentUser.email ? 'sent' : 'received'}`}
                            >
                                <div className="message-time">
                                    <div>
                                        {message.timestamp ? (
                                            isSameDay(message.timestamp.toDate(), new Date()) ?
                                                format(message.timestamp.toDate(), 'p') :
                                                format(message.timestamp.toDate(), 'MMM d')
                                        ) : 'Sending...'}
                                    </div>
                                    <div className="message-sender"> | {message.name}</div>
                                </div>
                                <div className="message-content">{createLinkMarkup(message.content)}</div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="message-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type a message..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}

            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default Community;
