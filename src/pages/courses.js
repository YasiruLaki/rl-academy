import React, { useState, useEffect } from 'react';
import './dashboard.css';
import './courses.css';
import LoadingScreen from '../components/loadingScreen';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function Courses() {
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();
    const [, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [coursesCount, setCoursesCount] = useState(0);
    const [submissionsCount, setSubmissionsCount] = useState(0);

    const courses = [
        {
            title: "Graphic Design",
            description: "Join our Graphic Design course to master visual communication. Learn typography, color theory, and digital illustration through hands-on projects, and turn creativity into a career.",
            imgSrc: "https://jeweltoned.com/wp-content/uploads/2020/06/Graphic-Designing.jpg"
        },
        {
            title: "Video Editing",
            description: "Join our Video Editing course to master the art of storytelling. Learn cutting-edge techniques, special effects, and sound editing through hands-on projects, and turn your creative vision into compelling videos.",
            imgSrc: "https://static.vecteezy.com/system/resources/previews/024/348/911/original/background-of-video-editor-processing-tools-tool-blocks-graphic-movie-editing-motion-designer-ui-bg-set-of-icon-panels-for-film-makers-set-of-videomakers-items-fx-buttons-and-icons-toolbar-vector.jpg"
        },
        {
            title: "Web Development",
            description: "Join our Web Development course to build modern, responsive websites. Learn HTML, CSS, JavaScript, and more through hands-on projects, and turn your coding skills into a successful career.",
            imgSrc: "https://www.logicommerce.com/es/wp-content/uploads/sites/4/shutterstock_2149658841-1024x576.jpg"
        }
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                setLoading(true);
                try {
                    const userRef = doc(firestore, 'users', currentUser.email);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        let coursesArray = [];
                        if (typeof data.courses === 'string') {
                            coursesArray = data.courses.split(',').map(course => course.trim());
                        }
                        setUserData({
                            ...data,
                            courses: coursesArray
                        });
                        setCoursesCount(coursesArray.length);
                        setSubmissionsCount(data.submissions || 0);
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

    const handleEnroll = async (course) => {
        if (userData && !userData.courses.includes(course)) {
            try {
                const newCourses = [...userData.courses, course];
                const userRef = doc(firestore, 'users', currentUser.email);
                await updateDoc(userRef, {
                    courses: newCourses.join(', ')
                });
                setUserData(prevState => ({
                    ...prevState,
                    courses: newCourses
                }));
                setCoursesCount(newCourses.length);
            } catch (error) {
                console.error('Error enrolling in course:', error);
                setError('Failed to enroll in course. Please try again.');
            }
        }
    };

    return (
        <div>
            {loading && <LoadingScreen />}
            <div className='dashboard'>
                <div className='courses-text'>
                    <h1>Courses</h1>
                </div>
                <div className='courses'>
                    {courses.map((course, index) => (
                        <div className='course-box' key={index}>
                            <div className='course-img'>
                                <img src={course.imgSrc} alt='course' />
                            </div>
                            <div className='course-text'>
                                <h2>{course.title}</h2>
                                <p>{course.description}</p>
                                {userData?.courses?.includes(course.title) ? (
                                    <button disabled>Already Enrolled</button>
                                ) : (
                                    <button onClick={() => handleEnroll(course.title)}>Enroll</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Courses;
