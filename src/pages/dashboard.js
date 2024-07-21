import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs,orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import LoadingScreen from '../components/loadingScreen';

function Dashboard() {
    const { currentUser } = useAuth();
    const [, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [upcomingClass, setUpcomingClass] = useState(null);
    const [loading, setLoading] = useState(false);
    const [coursesCount, setCoursesCount] = useState(0);
    const [submissionsCount, setSubmissionsCount] = useState(0);
    const [announcements, setAnnouncements] = useState([]);
    const [submissionPending, setSubmissionPending] = useState(false);
    const [submissionDone, setSubmissionDone] = useState(false);
    const [latestLoading, setLatestLoading] = useState(false);
    const [latestSubmissionData, setLatestSubmissionData] = useState(null);

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
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

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
                setLoading(false);
            }
        };

        if (userData) {
            fetchUpcomingClasses();
        }
    }, [userData]);

    const fetchAnnouncements = async () => {
        try {
            const announcementsRef = collection(firestore, 'announcements');
            const announcementsQuery = query(announcementsRef, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(announcementsQuery);
            const fetchedAnnouncements = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                if (data.date && data.date.toDate) {
                    data.date = data.date.toDate(); 
                } else {
                    console.warn('Date format is not a Firestore Timestamp or is missing:', data.date);
                    data.date = new Date();
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

    const fetchLatestSubmissionForUser = async (userEmail) => {
        setSubmissionPending(false);
        setLatestLoading(true);
        setSubmissionDone(false);

        try {
            const coursesRef = collection(firestore, 'submissions');
            const courseSnapshot = await getDocs(coursesRef);

            const assignmentSubcollectionNames = ['1', '2', '3', '4', '5'];
            const fetchPromises = [];
            let latestSubmission = null;

            for (const courseDoc of courseSnapshot.docs) {
                const courseId = courseDoc.id;

                for (const subcollectionName of assignmentSubcollectionNames) {
                    const subcollectionRef = collection(firestore, 'submissions', courseId, subcollectionName);

                    fetchPromises.push(getDocs(subcollectionRef)
                        .then(subcollectionSnapshot => {
                            subcollectionSnapshot.forEach(subDoc => {
                                const submissionData = subDoc.data();
                                if (subDoc.id === userEmail) {
                                    const submissionDate = submissionData.Timestamp;
                                    if (submissionDate) {
                                        const submissionDateObj = submissionDate.toDate ? submissionDate.toDate() : new Date(submissionDate);

                                        if (!latestSubmission || submissionDateObj > latestSubmission.date) {
                                            latestSubmission = {
                                                courseId,
                                                assignmentId: subcollectionName,
                                                userEmail,
                                                ...submissionData,
                                                date: submissionDateObj
                                            };
                                        }
                                    }
                                }
                            });
                        })
                        .catch(error => {
                            console.error(`Error fetching documents for course ${courseId}, assignment ${subcollectionName}:`, error);
                        }));
                }
            }

            await Promise.all(fetchPromises);

            if (latestSubmission !== null) {
                setLatestSubmissionData(latestSubmission);
                if (latestSubmission.Remarks === '') {
                    setSubmissionPending(true);
                } else {
                    setSubmissionDone(true);
                }
            } else {
                setLatestSubmissionData(null); // Ensure latestSubmissionData is set to null if no submission is found
                console.log('No submissions found for the user.');
            }

            setLatestLoading(false);

        } catch (error) {
            console.error('Error fetching latest submission:', error);
            setLatestLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                await fetchLatestSubmissionForUser(currentUser.email);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleStartMeeting = async (upcomingClass) => {
        const userID = userData.Id;
        const userName = userData.Name;

        const joinName = `${userID} - ${userName}`;
        const { join_url } = upcomingClass;

        const joinUrlWithName = `${join_url}?uname=${encodeURIComponent(joinName)}`;

        try {
            const startWindow = window.open(joinUrlWithName, '_blank');

            if (startWindow) {
                return;
            }
        } catch (error) {
            console.error('Failed to start meeting as host:', error);
        }
    };

    return (
        <div>
            <div className='dashboard'>
                {loading && <LoadingScreen />}
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
                                <h3><span className="material-symbols-outlined">assignment_turned_in</span> Assignments <span className='count'>(✅ {submissionsCount})</span></h3>

                                {latestLoading && (
                                    <div>
                                        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                                        <p className='loading-latest'>Loading Latest Submission...</p>
                                    </div>
                                )}

                                {latestSubmissionData && (
                                    <div>
                                        <p className='latest-title'>{latestSubmissionData.submissionNumber}: {latestSubmissionData.Title}</p>
                                        {submissionPending && <p className='pending'>Pending Review 🕓</p>}
                                        {submissionDone && (
                                            <div className='done-div-dash'>
                                                <p className='done-dash'>Completed ✓</p>
                                                <p className='marks-dash'>Marks: {latestSubmissionData.Marks}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {latestSubmissionData === null && !latestLoading && (
                                    <p>No submissions found.</p>
                                )}

                                {/* <ul id='courses-progress'>
                                {userData.courses.map((course, index) => (
                                    <li key={index}>
                                        <div className='progress'>
                                            <p>{course}</p>
                                            <div className='progress-bar'>
                                                <div className='progress-bar-fill' style={{ width: ${userData.submissions[course] / 3 * 100}% }}></div>
                                            </div>
                                            <div>
                                                <div><p id='progress-count'>60%</p></div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul> */}
                            </div>
                            <div className='dashboard-card-courses'>
                                <h3><span className="material-symbols-outlined">check</span> Attendance </h3>
                                <ul id='courses-progress'>
                                    {userData.courses.map((course, index) => (
                                        <li key={index}>
                                            <div className='progress'>
                                                <p>{course}</p>
                                                <div className='progress-bar'>
                                                    <div className='progress-bar-fill' style={{ width: "0px" }}></div>

                                                    {/* <div className='progress-bar-fill' style={{ width: ${userData.submissions[course] / 3 * 100}% }}></div> */}
                                                </div>
                                                <div>
                                                    <div><p id='progress-count'>0%</p></div>
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
                                                        <button className='join-btn' onClick={() => { handleStartMeeting(upcomingClass) }}>Join</button>
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
                    <p>Please log in to view your dashboard.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
