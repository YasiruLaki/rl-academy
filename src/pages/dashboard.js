import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

function Dashboard() {
    const { currentUser} = useAuth();
    const [, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [upcomingClass, setUpcomingClass] = useState(null);
    const [loading, setLoading] = useState(false);
    const [coursesCount, setCoursesCount] = useState(0);
    const [submissionsCount, setSubmissionsCount] = useState(0);
    const [announcements, setAnnouncements] = useState([]);

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

    // Fetch upcoming classes
    useEffect(() => {
        const fetchUpcomingClasses = async () => {
            if (userData && userData.courses) {
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
                    const now = new Date();
                    const upcomingClasses = classes
                        .filter(c => c.time > now)
                        .sort((a, b) => a.time - b.time);
                    setUpcomingClass(upcomingClasses);
                } catch (error) {
                    console.error('Error fetching upcoming classes:', error);
                    setError('Failed to fetch upcoming classes. Please try again.');
                }
                finally {
                    setLoading(false);
                }
            }

        };


        if (userData) {
            fetchUpcomingClasses();

        }

    }, [userData]);

    // Fetch announcements
    const fetchAnnouncements = async () => {
        try {
            const announcementsRef = collection(firestore, 'announcements');
            const querySnapshot = await getDocs(announcementsRef);
            const fetchedAnnouncements = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                if (data.date && data.date.toDate) {
                    data.date = data.date.toDate(); // Convert Firestore Timestamp to JavaScript Date
                } else {
                    console.warn('Date format is not a Firestore Timestamp or is missing:', data.date);
                    data.date = new Date(); // Fallback to current date if date is missing
                }
                fetchedAnnouncements.push(data);
            });
            setAnnouncements(fetchedAnnouncements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setError('Failed to fetch announcements. Please try again.');
        }
    };

    useEffect(() => {
        fetchAnnouncements();

    }, []);

    const handleStartMeeting = async (upcomingClass) => {

        const userID = userData.Id;
        const userName = userData.Name;

        const joinName = `${userID} - ${userName}`;
        const { join_url } = upcomingClass;

        const joinUrlWithName = `${join_url}?uname=${encodeURIComponent(joinName)}`
        
        try {
            const startWindow = window.open(joinUrlWithName, '_blank');

            if (startWindow) {
                return;
            }
        } catch (error) {
            console.error('Failed to start meeting as host:', error);
        }
    };

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
                            {/* <div>
                                <button>Logout<span className="material-symbols-outlined">logout</span></button>
                            </div> */}
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
                                <h3><span className="material-symbols-outlined">check</span> Attendance <span className='count'>({coursesCount}/3)</span></h3>
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
                        </div>
                        <div className='dashboard-bottom-cards'>
                            <div className='dashboard-left-cards'>
                            <div className='dashboard-card-announcements'>
                                <h3><span className="material-symbols-outlined">campaign</span> Announcements</h3>
                                {announcements.length > 0 ? (
                                    announcements.map((announcement) => (
                                        <div key={announcement.id} className='announcement'>
                                            <div className='announcement-details'>
                                                <span>{format(announcement.date, 'HH:mm')}</span><span> | </span> <span>{format(announcement.date, 'dd.MM.yyyy')}</span>
                                            </div>
                                            <p dangerouslySetInnerHTML={{ __html: announcement.text }}></p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No announcements available.</p>
                                )}
                            </div>
                            </div>

                            <div className='dashboard-right-cards'>
                                <div className='dashboard-card-upcoming'>
                                    <h3><span className="material-symbols-outlined">calendar_month</span> Upcoming class</h3>
                                    {upcomingClass ? (
                                    upcomingClass.map((upcomingClass) => (
                                    <div className='upcoming-class'>
                                        <div className='class-1'>
                                            <span className="material-symbols-outlined">videocam</span>
                                            <p id='class-course'>{upcomingClass.course}</p>
                                        </div>
                                        <div className='class-2'>
                                            <div>
                                        <p className='meeting-time'>{format(upcomingClass.time, 'dd MMMM  |  HH:mm')}</p>
                                        </div>
                                        <div>
                                        <button className='join-btn' onClick={() => {handleStartMeeting(upcomingClass)}}>Join</button>
                                        </div>
                                        </div>
                                    </div>
                                    ))
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