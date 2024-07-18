import React, { useState, useEffect } from 'react';
import './dashboard.css';
import './submissions.css';
import { useAuth } from '../hooks/useAuth';
import { firestore } from '../firebase';
import { doc, setDoc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import Modal from '../components/modal';
import LoadingScreen from '../components/loadingScreen';

function Submissions() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [clickedAssignment, setClickedAssignment] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [assignments, setAssignments] = useState([]);

    useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const userRef = doc(firestore, 'mentors', currentUser.email);
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

          const courseCollectionMap = {
            'Graphic Design': 'GD',
            'Web Development': 'WD',
            'Video Editing': 'VE',
          };

          const allAssignments = [];

          for (const course of data.courses) {
            const courseCollection = courseCollectionMap[course];
            if (!courseCollection) {
              setError('Invalid course selected.');
              return;
            }
            const assignmentsQuery = query(collection(firestore, courseCollection));
            const assignmentsSnapshot = await getDocs(assignmentsQuery);
            const courseAssignments = assignmentsSnapshot.docs.map(doc => {
              const assignmentData = doc.data();
              if (assignmentData.deadline) {
                assignmentData.deadline = parseISO(assignmentData.deadline);
              }
              return assignmentData;
            });
            allAssignments.push(...courseAssignments);
          }

          setAssignments(allAssignments);
        } else {
          setError('User data not found.');
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setError('Failed to fetch assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClickedAssignment = (assignment) => {
    console.log('clicked data:', assignment);
    setClickedAssignment(assignment);

    if (assignment.deadline) {
      const now = new Date();
      const deadline = new Date(assignment.deadline);
      setIsActive(now <= deadline || (now.getDate() === deadline.getDate() && now.getHours() <= 23 && now.getMinutes() <= 59));
    }
  };


  useEffect(() => {
    fetchAssignments();
  }, [currentUser]);

return (
    <div className='dashboard'>
        {loading && <LoadingScreen />}
        {error && <p className="error">{error}</p>}
        {userData ? (
            <>
<div className='submissions'>
<div className='courses-text'>
                    <h1>Assignments</h1>
                    <div className='solid-line'></div>
                </div>

                <div className='submissions-box'>
                    {userData.courses.map((course, index) => (
                        <div key={index} className='submission'>
                            <h3 className='course-name'>&gt; {course}</h3>
                            <div className='submission-div'>
                            {assignments.length > 0 ? (
                                assignments
                                    .filter(assignment => assignment.course === course)
                                    .sort((a, b) => b.submissionNumber - a.submissionNumber)
                                    .map((assignment) => {
                                        const now = new Date();
                                        const deadline = new Date(assignment.deadline);
                                        const isActive = now <= deadline || (now.getDate() === deadline.getDate() && now.getHours() <= 23 && now.getMinutes() <= 59);
                                        return (
                                            <div key={assignment.submissionNumber}>
                                                <label htmlFor={`toggle-${assignment.submissionNumber}`}>
                                                    <div className='submissions-box-header' onClick={() => { setIsAssignmentModalOpen(true); handleClickedAssignment(assignment); }}>
                                                        <div>
                                                            <label htmlFor={`toggle-${assignment.submissionNumber}`}>Assignment {assignment.submissionNumber}:<span> {assignment.title}</span></label>
                                                        </div>
                                                        <div className='status'>
                                                            <p>Status: <span className={isActive ? 'Active' : 'Expired'}>{isActive ? 'Active' : 'Closed'}</span></p>
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
                                    })
                            ) : (
                                <p>No assignments available.</p>
                            )}
                            </div>
                        </div>
                    ))}
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
                                <p className='assignment-handle-number'>Assignment {clickedAssignment.submissionNumber}</p>
                                    <span id='active' className={isActive ? 'Active' : 'Expired'}>{isActive ? 'Active' : 'Closed'}</span>
                                <p className='assignment-handle-title'>{clickedAssignment.title}</p>
                                <div className='dash-line'></div>
                                <p className='assignment-handle-des' dangerouslySetInnerHTML={{ __html: clickedAssignment.description }} />
                                <div className='dash-line'></div>
                                {clickedAssignment.deadline && (
                                    <p className='assignment-handle-deadline'>Deadline : {format(clickedAssignment.deadline, 'yyyy-MM-dd')}</p>
                                )}
                                <div className='dash-line'></div>
                                <button className='announcement-modal-button assign-btn' >Submit Work</button>
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
