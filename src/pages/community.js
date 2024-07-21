import React, { useState, useEffect } from 'react';
import './community.css';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
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

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    const userRef = doc(firestore, 'mentors', currentUser.email);
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
        };

        fetchUserData();
    }, [currentUser]);

    // Fetch chat messages for selected course
    useEffect(() => {
        if (selectedCourse) {
            const q = query(collection(firestore, 'messages', selectedCourse, 'courseMessages'), orderBy('timestamp', 'asc'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const messagesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messagesData);
            });

            return () => unsubscribe();
        }
        setLoading(false)
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
    };

    return (
        <div className="dashboard">
            {loading && <LoadingScreen />}
            <h1>Welcome to the Community Page</h1>
            <p>This is the place where users can interact and share their thoughts.</p>
            
            {userData && (
                <div className="course-select">
                    <label>Select Course:</label>
                    <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
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
                                    {message.timestamp ? format(message.timestamp.toDate(), 'p, MMM d') : 'Sending...'}
                                </div>
                                <div className="message-sender">{message.name}</div>
                                <div className="message-content">{message.content}</div>
                            </div>
                        ))}
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
