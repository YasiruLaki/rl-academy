import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './login.css';
import LoadingScreen from '../components/loadingScreen';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [showReset, setShowReset] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(true);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setResetMessage('');
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetMessage('Password reset email sent. Check your inbox.');
        } catch (error) {
            setResetMessage(error.message);
        }
    };

    return (
        <div>
            {loading && <LoadingScreen />}
            <section>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>

                <div className="signin">
                    <div className="content">
                        <h2 className='login-header'>Richmond Live Academy<br></br> Student Portal</h2>
                        <h2 className='login-header-mobile'>RL Academy <br></br>Student Portal</h2>
                    {showLogin && (
                        <form className="form" onSubmit={handleLogin}>
                            <div id='txt' className="inputBox">
                                <input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                                <i>Email</i>
                            </div>
                            <div id='txt' className="inputBox txt">
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <i>Password</i>
                            </div>
                            <div className="links" onClick={() => {setShowReset(true); setShowLogin(false)}}>
                                    Forgot Password?
                            </div>
                            <div className="inputBox">
                                <input type="submit" value="Login" />
                            </div>
                            {error && <p className='error'>Invalid Login Credentials</p>}
                        </form>
                    )}
                        {showReset && (
                            <form className="form" onSubmit={handlePasswordReset}>
                                                            <div id='txt' className="inputBox">
                                <input 
                                    type="text" 
                                    required 
                                    value={resetEmail} 
                                    onChange={(e) => setResetEmail(e.target.value)} 
                                />
                                <i>Email</i>
                            </div>
                            <div className="inputBox">
                                <input type="submit" value="Reset Password" />
                            </div>
                                {resetMessage && <p className='links'>{resetMessage}</p>}
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
