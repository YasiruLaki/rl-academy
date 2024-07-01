import React from 'react';
import './dashboard.css';
import Sidebar from '../components/sidebar';

function Courses() {
    return (
        <div>
            <Sidebar />
            <div className='dashboard'>
            <div className='dashboard-top-text'>
                <h1>Courses</h1>
                <h2>Membership: <span>Richmond Live</span> </h2>
            </div>
        </div>
    </div>
    );
}

export default Courses;