import React from 'react';
import './loadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <div>
                    <img className='logo' src={require("../images/rla-logo-transparent-background.ec023073 (1) copy.png")} alt="Profile" />
                    </div>
                <div className="loader">
                <div className="ball"></div>
                <div className=" red ball"></div>
                <div className="ball"></div>
            </div>
        </div>
    );
};

export default LoadingScreen;

