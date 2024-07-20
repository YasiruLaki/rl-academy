// Sidebar.js
import React, { useState } from 'react';
import './sidebar.css';
import { Link } from 'react-router-dom';

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
                        <li>
                            <Link to="/dashboard">
                                <span className="material-symbols-outlined">dashboard</span>
                                Dashboard
                                </Link>
                        </li>
                        <li>                           <Link to="/courses"><span className="material-symbols-outlined">
                            book
                        </span> Courses</Link></li>
                        <li>                            <Link to="/assignments"><span className="material-symbols-outlined">
                            assignment
                        </span> Assignments</Link></li>
                        <li>                            <Link to="/community"><span className="material-symbols-outlined">
                            forum
                        </span> Community</Link></li>
                    </ul>
                    <div className='sidebar-bottom'>
                        <ul>
                            <li><Link to="/profile"><span className="material-symbols-outlined">
                                person
                            </span> Profile</Link></li>

                            {/* <li><span className="material-symbols-outlined">
                                toggle_off
                            </span> Dark Mode</li> */}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;