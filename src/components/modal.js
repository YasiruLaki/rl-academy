import React from 'react';
import './modal.css';

const Modal = ({ show, handleClose, children }) => {
    return (
            <div className={`modal ${show ? 'show' : ''}`}>
                <div className="modal-content">
                    <span className="close" onClick={handleClose}>&times;</span>
                    {children}
                </div>
            </div>
    );
};

export default Modal;
