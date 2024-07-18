import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Sidebar from '../components/sidebar';
import './courses.css';
import LoadingScreen from '../components/loadingScreen';

function Courses() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);
    return (
        <div>
            {loading && <LoadingScreen />}
            <Sidebar />
            <div className='dashboard'>
                <div className='courses-text'>
                    <h1>Courses</h1>
                </div>

                <div className='courses'>
                    <div className='course-box'>
                        <div className='course-img'>
                        <img src={'https://jeweltoned.com/wp-content/uploads/2020/06/Graphic-Designing.jpg'} alt='course' />
                        </div>
                        <div className='course-text'>
                        <h2>Graphic Design</h2>
                        <p>Join our Graphic Design course to master visual communication. Learn typography, color theory, and digital illustration through hands-on projects, and turn creativity into a career.</p>
                        <button>Enroll</button>
                        </div>
                    </div>
                    <div className='course-box'>
                        <div className='course-img'>
                        <img src={'https://static.vecteezy.com/system/resources/previews/024/348/911/original/background-of-video-editor-processing-tools-tool-blocks-graphic-movie-editing-motion-designer-ui-bg-set-of-icon-panels-for-film-makers-set-of-videomakers-items-fx-buttons-and-icons-toolbar-vector.jpg'} alt='course' />
                        </div>
                        <div className='course-text'>
                        <h2>Video Editing</h2>
                        <p>Join our Video Editing course to master the art of storytelling. Learn cutting-edge techniques, special effects, and sound editing through hands-on projects, and turn your creative vision into compelling videos.</p>
                        <button>Enroll</button>
                        </div>
                    </div>
                    <div className='course-box'>
                        <div className='course-img'>
                        <img src={'https://www.logicommerce.com/es/wp-content/uploads/sites/4/shutterstock_2149658841-1024x576.jpg'} alt='course' />
                        </div>
                        <div className='course-text'>
                        <h2>Web Development</h2>
                        <p>Join our Web Development course to build modern, responsive websites. Learn HTML, CSS, JavaScript, and more through hands-on projects, and turn your coding skills into a successful career.</p>
                        <button>Enroll</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Courses;