// Sidebar.js
import React, { useState } from 'react';
import './sidebar.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>
            <div className='sidebar-control'>
                <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                    <img className='logo' src={require("../images/rla-logo-transparent-background.ec023073 (1) copy.png")} alt="Profile" />
                    <h2>Student Portal</h2>
                    <ul>
                        <li><a href="dashboard"><span className="material-symbols-outlined">
                            dashboard
                        </span> Dashboard</a></li>
                        <li><a href="courses"><span className="material-symbols-outlined">
                            book
                        </span> Courses</a></li>
                        <li><a href="submissions"><span className="material-symbols-outlined">
                            assignment
                        </span> Submissions</a></li>
                        <li><a href="community"><span className="material-symbols-outlined">
                            forum
                        </span> Community</a></li>
                    </ul>
                    <div className='sidebar-bottom'>
                        <ul>
                            <li><a href='profile'><span className="material-symbols-outlined">
                                person
                            </span> Profile</a></li>

                            <li><a><span className="material-symbols-outlined">
                                toggle_off
                            </span> Dark Mode</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
