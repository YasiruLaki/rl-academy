import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

function Dashboard() {
    const { currentUser, resetPassword } = useAuth();
    const [userData, setUserData] = useState(null);
    const [upcomingClass, setUpcomingClass] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [coursesCount, setCoursesCount] = useState(0);
    const [submissionsCount, setSubmissionsCount] = useState(0);

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
                        setCoursesCount(data.courses.length);
                        setSubmissionsCount(data.submissions);
                    } else {
                        setError('User data not found.');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError('Failed to fetch user data. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    useEffect(() => {
        const fetchUpcomingClasses = async () => {
            if (userData && userData.courses) {
                setLoading(true);
                try {
                    const classesRef = collection(firestore, 'classes');
                    const q = query(classesRef, where('course', 'in', userData.courses));
                    const querySnapshot = await getDocs(q);
                    const classes = [];
                    querySnapshot.forEach(doc => {
                        const data = doc.data();
                        data.id = doc.id;

                        if (data.time && data.time.seconds) {
                            data.time = new Date(data.time.seconds * 1000 + data.time.nanoseconds / 1000000);
                        } else {
                            console.warn('Invalid time format:', data.time);
                        }

                        classes.push(data);
                    });

                    console.log('Fetched classes:', classes);
                    const now = new Date();
                    const upcomingClasses = classes
                        .filter(c => c.time > now)
                        .sort((a, b) => a.time - b.time);

                    console.log('Filtered upcoming classes:', upcomingClasses);

                    setUpcomingClass(upcomingClasses[0] || null);
                } catch (error) {
                    console.error('Error fetching upcoming classes:', error);
                    setError('Failed to fetch upcoming classes. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUpcomingClasses();
    }, [userData]);

    useEffect(() => {
        console.log('upcomingClass state:', upcomingClass);
    }, [upcomingClass]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <div className='dashboard'>
                {userData ? (
                    <>
                        <div className='dashboard-top-text'>
                            <div className='profile-pic'>
                            </div>
                            <div>
                                <h1>Welcome Back,</h1>
                                <h2>{userData.Name} ({userData.Id})</h2>
                            </div>
                            <div>
                                <button>Logout<span className="material-symbols-outlined">logout</span></button>
                            </div>
                        </div>

                        <div className='dashboard-top-cards'>
                            <div className='dashboard-card-courses'>
                                <h3><span className="material-symbols-outlined">school</span> Courses enrolled <span className='count'>({coursesCount}/3)</span></h3>
                                <ul>
                                    {userData.courses.map((course, index) => (
                                        <li key={index}>
                                            <p>{course}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className='dashboard-card-courses'>
                                <h3><span className="material-symbols-outlined">assignment_turned_in</span> Submissions <span className='count'>({submissionsCount}/{coursesCount * 3})</span></h3>
                                <ul id='courses-progress'>
                                    {userData.courses.map((course, index) => (
                                        <li key={index}>
                                            <div className='progress'>
                                                <p>{course}</p>
                                                <div className='progress-bar'>
                                                    <div className='progress-bar-fill' style={{ width: `${userData.submissions[course] / 3 * 100}%` }}></div>
                                                </div>
                                                <div>
                                                    <div><p id='progress-count'>60%</p></div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className='dashboard-card-courses'>
                                <h3><span className="material-symbols-outlined">school</span> Courses enrolled <span className='count'>({coursesCount}/3)</span></h3>
                                <ul>
                                    {userData.courses.map((course, index) => (
                                        <li key={index}>
                                            <p>{course}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className='dashboard-bottom-cards'>
                            <div className='dashboard-left-cards'>
                                <div className='dashboard-card-announcements'>
                                    <h3><span className="material-symbols-outlined">campaign</span> Announcements</h3>
                                    <div className='announcement'>
                                        <div className='announcement-details'>
                                            <span>19:48</span> <span>23.06.2024</span> <span>Admin</span>
                                        </div>
                                        <p><span>•</span> There will be a live session on graphic design on 23rd October 2021</p>
                                    </div>
                                    <div className='announcement'>
                                        <div className='announcement-details'>
                                            <span>19:48</span> <span>23.06.2024</span> <span>Admin</span>
                                        </div>
                                        <p><span>•</span> There will be a live session on graphic design on 23rd October 2021</p>
                                    </div>
                                    <div className='announcement'>
                                        <div className='announcement-details'>
                                            <span>19:48</span> <span>23.06.2024</span> <span>Admin</span>
                                        </div>
                                        <p><span>•</span> There will be a live session on graphic design on 23rd October 2021</p>
                                    </div>
                                    <div className='announcement'>
                                        <div className='announcement-details'>
                                            <span>19:48</span> <span>23.06.2024</span> <span>Admin</span>
                                        </div>
                                        <p><span>•</span> There will be a live session on graphic design on 23rd October 2021</p>
                                    </div>
                                </div>
                            </div>

                            <div className='dashboard-right-cards'>
                                <div className='dashboard-card-upcoming'>
                                    <h3><span className="material-symbols-outlined">calendar_month</span> Upcoming class</h3>
                                    {upcomingClass ? (
                                        <div className='upcoming-class'>
                                            <div>
                                                <span class="material-symbols-outlined">
                                                    videocam
                                                </span>
                                            </div>
                                            <div>
                                                <p>{upcomingClass.course}</p>
                                                <p className='meeting-time'>{format(upcomingClass.time, 'dd MMMM   HH:mm')}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>No upcoming classes.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading user data...</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
