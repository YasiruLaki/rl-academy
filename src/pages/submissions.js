import React, { useState, useEffect } from 'react';
import './dashboard.css';
import './submissions.css';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, setDoc, getDoc, collection, query, getDocs,updateDoc, increment } from 'firebase/firestore';
import { format, parseISO, set } from 'date-fns';
import Modal from '../components/modal';
import LoadingScreen from '../components/loadingScreen';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../components/footer.css';
import { se } from 'date-fns/locale';

function Submissions() {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [clickedAssignment, setClickedAssignment] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [submitAssignmentLink, setSubmitAssignmentLink] = useState('');
    const [submitAssignmentDes, setSubmitAssignmentDes] = useState('');
    const [clickedAssignmentDone, setClickedAssignmentDone] = useState(false);
    const [clickedAssignmentPending, setClickedAssignmentPending] = useState(false);
    const [checkBox, setCheckBox] = useState(false);
    const [review, setReview] = useState(false);
    const [reviewPending, setReviewPending] = useState(false);
    const [marks, setMarks] = useState(0);
    const [reviewDescription, setReviewDescription] = useState('');
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [completedSubmissions, setCompletedSubmissions] = useState(0);


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
                    } else {
                        setError('User data not found.');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError('Failed to fetch user data. Please try again.');
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    // Fetch assignments
    const fetchAssignments = async () => {
        if (!currentUser) return;
        
        setLoading(true);
        
        try {
            const userRef = doc(firestore, 'users', currentUser.email);
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                setError('User data not found.');
                return;
            }
            
            let data = docSnap.data();
            if (typeof data.courses === 'string') {
                data.courses = data.courses.split(',').map(course => course.trim());
            }
            setUserData(data);
    
            const courseCollectionMap = {
                'Graphic Design': 'GD',
                'Web Development': 'WD',
                'Video Editing': 'VE',
            };
    
            const allAssignments = await Promise.all(
                data.courses.map(async course => {
                    const courseCollection = courseCollectionMap[course];
                    if (!courseCollection) {
                        setError('Invalid course selected.');
                        return [];
                    }
                    const assignmentsQuery = query(collection(firestore, courseCollection));
                    const assignmentsSnapshot = await getDocs(assignmentsQuery);
                    return assignmentsSnapshot.docs.map(doc => {
                        const assignmentData = doc.data();
                        if (assignmentData.deadline) {
                            assignmentData.deadline = parseISO(assignmentData.deadline);
                        }
                        return assignmentData;
                    });
                })
            );
    
            setAssignments(allAssignments.flat());
            setTotalSubmissions(allAssignments.flat().length);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to fetch assignments. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleClickedAssignment = async (assignment) => {
        setLoading(true);
        setClickedAssignment(assignment);
        
        if (assignment.deadline) {
            const now = new Date();
            const deadline = new Date(assignment.deadline);
            const isToday = now.toDateString() === deadline.toDateString();
            const isBeforeEndOfDay = now.getHours() <= 23 && now.getMinutes() <= 59;
            setIsActive(now <= deadline || (isToday && isBeforeEndOfDay));
        }
        
        setClickedAssignmentDone(false);
        setClickedAssignmentPending(false);
        setReviewPending(false);
        setReview(false);
        
        const submittedBy = currentUser?.email;
        const submissionNumber = String(assignment.submissionNumber);
        const course = assignment.course;
    
        if (typeof course !== 'string' || typeof submissionNumber !== 'string') {
            console.error('Invalid data type for course or submissionNumber');
            setLoading(false);
            return;
        }
    
        try {
            const parentDocRef = doc(firestore, 'submissions', course);
            const docRef = doc(parentDocRef, submissionNumber, submittedBy);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const { Remarks: remarksFieldValue, Marks: marksFieldValue } = docSnap.data();
                if (remarksFieldValue && typeof remarksFieldValue === 'string' && remarksFieldValue.trim() !== '') {
                    setClickedAssignmentDone(true);
                    setReview(true);
                    setMarks(marksFieldValue);
                    setReviewDescription(remarksFieldValue);
                } else {
                    setClickedAssignmentPending(true);
                    setReviewPending(true);
                }
            } else {
                console.log("Document does not exist");
            }
        } catch (error) {
            console.error("Error checking document: ", error);
        } finally {
            setLoading(false);
        }
    };
    
    const submitWork = async (clickedAssignment) => {
        const submissionDate = new Date();
        const submittedBy = currentUser.email;
        const submissionNumber = String(clickedAssignment.submissionNumber);
        const course = clickedAssignment.course;
        const submissionDes = submitAssignmentDes;
        const submissionLink = submitAssignmentLink;
        const submissionData = {
            Timestamp: submissionDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
            Title: clickedAssignment.title,
            Email: submittedBy,
            Name: userData.Name,
            submissionNumber: submissionNumber,
            Description: submissionDes,
            "Submission Link": submissionLink,
            Remarks: '',
            Marks: 0,
        };
    
        const parentDocRef = doc(firestore, 'submissions', course);
        const docRef = doc(parentDocRef, submissionNumber, submittedBy);
    
        if (typeof course !== 'string' || typeof submissionNumber !== 'string') {
            console.error('Invalid data type for course or submissionNumber');
            return;
        }
    
        try {
            setLoading(true);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                alert('You have already submitted this assignment');
                setSubmitAssignmentDes('');
                setSubmitAssignmentLink('');
                setIsSubmitModalOpen(false);
                return;
            }
    
            await setDoc(docRef, submissionData);
            console.log('Document successfully written!');
    
            const userDocRef = doc(firestore, 'users', submittedBy);
            await updateDoc(userDocRef, {
                submissions: increment(1)
            });
    
            setIsSubmitModalOpen(false);
        } catch (error) {
            console.error('Error writing document: ', error);
        } finally {
            setLoading(false);
            setSubmitAssignmentDes('');
            setSubmitAssignmentLink('');
            setCheckBox(false);
        }
    };
    
    const completedAssignmentsCount = async () => {
        try {
            const docRef = doc(firestore, 'users', currentUser.email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompletedSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Error fetching completed assignments count:', error);
        }
    };
    
    

    // const modules = {
    //     toolbar: [
    //         [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' }, { 'font': [] }],
    //         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    //         ['bold', 'italic', 'underline'],
    //         [{ 'align': [] }],
    //         [{ 'color': [] }],
    //         ['clean'] // remove formatting button
    //     ]
    // };

    const mobileModules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic'],
            [{ 'align': [] }],
        ]
    };

    const tabletModules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            [{ 'align': [] }],
        ]
    };

    const desktopModules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            [{ 'align': [] }],
            [{ 'color': [] }],
            ['clean'] // remove formatting button
        ]
    };


    const modules = window.innerWidth < 600 ? mobileModules :
    window.innerWidth < 1024 ? tabletModules :
    desktopModules;



    useEffect(() => {
        fetchAssignments();
        completedAssignmentsCount();

    }, [currentUser]);

    return (
        <div className='dashboard'>
            {loading && <LoadingScreen />}
            {error && <p className="error">{error}</p>}
            {userData ? (
                <>
                    <div className='submissions'>
                        <div className='courses-text'>
                            <p>Assignments</p>
                            <span className='subs-count'>You have submitted {completedSubmissions} of {totalSubmissions} assignments.</span>
                            <div className='solid-line'></div>
                        </div>

                        <div className='submissions-box'>
                        {userData.courses.map((course, index) => {
    // Filter assignments for the current course
    const courseAssignments = assignments.filter(assignment => assignment.course === course);
    
    // If there are assignments for this course, render the course name and its assignments
    if (courseAssignments.length > 0) {
        return (
            <div key={index} className='submission'>
                <h3 className='course-name'>&gt; {course}</h3>
                <div className='submission-div'>
                    {courseAssignments
                        .sort((a, b) => b.submissionNumber - a.submissionNumber)
                        .map((assignment) => {
                            const now = new Date();
                            const deadline = new Date(assignment.deadline);
                            const isActive = now <= deadline || (now.getDate() === deadline.getDate() && now.getHours() <= 23 && now.getMinutes() <= 59);
                            return (
                                <div key={assignment.submissionNumber}>
                                    <label htmlFor={`toggle-${assignment.submissionNumber}`}>
                                        <div className='submissions-box-header' onClick={() => { setIsAssignmentModalOpen(true); handleClickedAssignment(assignment); }}>
                                            <div className='submission-box-title'>
                                                <div><p className='box-number'>Assignment {assignment.submissionNumber} :&nbsp;&nbsp;</p></div> <div><p className='box-title'> {assignment.title}</p></div>
                                            </div>
                                            <div className='status'>
                                                <p><span className={isActive ? 'Active' : 'Expired'}>{isActive ? 'Active' : 'Closed'}</span></p>
                                            </div>
                                        </div>
                                    </label>
                                    <input type='checkbox' id={`toggle-${assignment.submissionNumber}`} />
                                    <div className="menu-content" style={{ zIndex: -100 }}>
                                        <p dangerouslySetInnerHTML={{ __html: assignment.description }} />
                                        {assignment.deadline && (
                                            <span>{format(assignment.deadline, 'yyyy-MM-dd')}</span>
                                        )}<br></br>
                                        <button>View Submissions</button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    } else {    
        return (
            <div key={index} className='submission'>
                <h3 className='course-name'>&gt; {course}</h3>
                <div className='submission-div'>
                    <p>No assignments found for this course.</p>
                </div>
            </div>
        );
    }
})}

                        </div>

                        <div className='dashboard-bottom-cards'>
                            <div className='dashboard-left-cards'>
                                <div className='dashboard-card-announcements'></div>
                            </div>
                        </div>

                        {/* Modal for opening assignments */}
                        <Modal show={isAssignmentModalOpen} handleClose={() => setIsAssignmentModalOpen(false)}>
                            <div className='manage-modal'>
                                {clickedAssignment && (
                                    <div className='assignment-handle'>
                                        <div className='assignment-modal-top'>
                                        <p className='assignment-handle-number'>Assignment {clickedAssignment.submissionNumber}</p>
                                        <span id='active' className={isActive ? 'Active' : 'Expired'}>{isActive ? 'Active' : 'Closed'}</span>
                                        <span id='active' className={clickedAssignmentDone ? 'done' : ''}>{clickedAssignmentDone ? 'Completed ✓' : ''}</span>
                                        <span id='active' className={clickedAssignmentPending ? 'pending' : ''}>{clickedAssignmentPending ? 'Pending Review 🕓' : ''}</span>
                                    </div>


                                        <p className='assignment-handle-title'>{clickedAssignment.title}</p>
                                        <div className='dash-line'></div>
                                        {review && (
                                            <div>
                                            <div className='review-box'>
                                                <p className='assignment-handle-des marks'>Your work has been reviewed. You scored <span>{marks}/10</span> marks.</p>
                                                <p className='assignment-handle-des remarks'>Remarks : <span>{reviewDescription}</span></p>
                                            </div>
                                             <div className='dash-line'></div>
                                             </div>
                                        )}
                                        {reviewPending && (
                                            <div>
                                            <div className='review-box'>
                                                <p className='assignment-handle-des'>Your work is pending review. You can view the remarks once the review is complete.</p>
                                            </div>
                                                <div className='dash-line'></div>
                                            </div>
                                        )}
                                        <div>
                                        </div>
                                        <p className='assignment-handle-des' dangerouslySetInnerHTML={{ __html: clickedAssignment.description }} />
                                        <div className='dash-line'></div>
                                        {clickedAssignment.deadline && (
                                            <p className='assignment-handle-deadline'>Deadline : {format(clickedAssignment.deadline, 'yyyy-MM-dd')}</p>
                                        )}
                                        <div className='dash-line'></div>
                                        <button className='announcement-modal-button assign-btn' onClick={() => {
                                            if (isActive) {
                                                setIsSubmitModalOpen(true);
                                                setIsAssignmentModalOpen(false)
                                            }
                                        }}
                                        >{isActive ? 'Submit Work' : 'Closed'}</button>
                                    </div>
                                )}
                            </div>
                        </Modal>

                        {/* Modal for submitting assignments */}
                        <Modal show={isSubmitModalOpen} handleClose={() => setIsSubmitModalOpen(false)}>
                            <div className='manage-modal'>
                                {clickedAssignment && (
                                    <div className='assignment-handle'>
                                        <p className='assignment-handle-number'>Assignment {clickedAssignment.submissionNumber}</p>
                                        <span id='active' className={isActive ? 'Active' : 'Expired'}>{isActive ? 'Active' : 'Closed'}</span>
                                        <p className='assignment-handle-title submission-txt'>Submit Work</p>
                                        <div className='dash-line submit'></div>

                                        <form onSubmit={(e) => { e.preventDefault(); submitWork(clickedAssignment); }}>
                                            <p className='submission-p'>Describe Your Work:<span> (optional)</span></p>
                                            <ReactQuill
                                                value={submitAssignmentDes}
                                                onChange={setSubmitAssignmentDes}
                                                theme="snow"
                                                className='text-editor-submit'
                                                modules={modules}
                                                required
                                            />
                                            <p className='submission-p'>Submission Link:</p>
                                            <input 
                                            className='link-box'
                                            type='text' 
                                            value={submitAssignmentLink}
                                            onChange={(e) => setSubmitAssignmentLink(e.target.value)}
                                            />
                                            <div className='dash-line'></div>
                                            <div className='checkbox'>
                                                <input
                                                    type='checkbox'
                                                    required 
                                                    className='tickbox'
                                                    checked={checkBox}
                                                    onChange={() => setCheckBox(!checkBox)}
                                                />
                                                <span>I completed this assignment independently and used no copyrighted materials.</span>
                                            </div>
                                            <button type="submit" className='announcement-modal-button assign-btn' >Submit</button>

                                        </form>
                                    </div>
                                )}
                            </div>
                        </Modal>

                    </div>
                </>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>

    );
}

export default Submissions;
