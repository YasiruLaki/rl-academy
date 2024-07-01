import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/sidebar';
import './profile.css';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Profile = () => {
    const { currentUser, resetPassword } = useAuth();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const userRef = doc(firestore, 'users', currentUser.email);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Convert comma-separated string to array
                        if (data.courses) {
                            data.courses = data.courses.split(',').map(course => course.trim());
                        }
                        setUserData(data);
                    } else {
                        setError('User data not found.');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError('Failed to fetch user data. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }
    }, [currentUser]);

    const handlePasswordReset = async () => {
        setLoading(true);
        try {
            await resetPassword(currentUser.email);
            setError('');
            alert('Password reset email sent successfully!');
        } catch (error) {
            setError(error.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>; // You can replace this with a loading spinner or animation
    }

    return (
        <div>
            <Sidebar />
            <div className='profile'>
                <div className='dashboard-top-text'>
                    <h1>Profile</h1>
                    <h2>Membership: <span>Richmond Live</span> </h2>
                </div>
                <div className='profile-card-profile'>
                    <div className='profile-profile-pic'>
                        <button className='profile-profile-pic-btn'>Change Picture</button>
                    </div>
                    <div className='profile-profile-txt'>
                        {userData ? (
                            <>
                                <h3>{userData.Name}</h3>
                                <p>{userData.role} ({userData.Id})</p>
                                <h4>Email:</h4>
                                <p>{currentUser.email}</p>
                                <h4>Courses enrolled:</h4>
                                <div className='profile-card-courses'>
                                    <ul>
                                        {userData.courses.map((course, index) => (
                                            <li key={index}>
                                                <p>{course}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <h4>Whatsapp no:</h4>
                                <p>{userData.Whatsapp}</p>
                                <div>
                                    <h4>Reset Password:</h4>
                                    <button onClick={handlePasswordReset} disabled={loading}>
                                        {loading ? 'Sending' : 'Send Password Reset Email'}
                                    </button>
                                    {error && <p>{error}</p>}
                                </div>
                            </>
                        ) : (
                            <p>Loading user data...</p> // You can replace this with a loading state
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
