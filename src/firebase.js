import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD-4Pr3hvDtrVmb6VujUx3r5dH2BSoXop4",
    authDomain: "rl-academy-dffe6.firebaseapp.com",
    projectId: "rl-academy-dffe6",
    storageBucket: "rl-academy-dffe6.appspot.com",
    messagingSenderId: "485840616147",
    appId: "1:485840616147:web:639f6ec6561140703cf226"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
