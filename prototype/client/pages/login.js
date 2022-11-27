import { auth, firestore, googleAuthProvider } from "../lib/firebase"
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { signInWithPopup } from "firebase/auth"

import { useContext, useEffect, useState, useCallback } from 'react';
import { UserContext } from '../lib/context'

import { debounce } from "lodash"

import { Input, Button } from "@chakra-ui/react";

export default function EnterPage({}) {
    const {userData} = useContext(UserContext)
    const {user, username} = userData

    return (
        <main>
            <h1>Sign Up</h1>
            {user ? 
               !username ? <UsernameForm /> : <SignOutButton /> 
               : 
               <SignInButton />
            }
        </main>
    )
}

function SignInButton() {
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider)
    }

    return (
        <Button colorScheme='teal' variant='solid' className="btn-google" onClick={signInWithGoogle}>
            <img src={'/google.png'} /> Sign in with Google
        </Button>
    )
}

function SignOutButton() {
    return <Button colorScheme='teal' variant='solid' onClick={() => auth.signOut()}>Sign out</Button>
}

function UsernameForm() {
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const { userData } = useContext(UserContext)
    const { user, username } = userData

    useEffect(() => {
        checkUsername(formValue);
    }, [formValue])

    const onChange = (e) => {
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/

        if (val.length < 3) {
            setFormValue(val)
            setLoading(false)
            setIsValid(false)
        }

        if (re.test(val)) {
            setFormValue(val);
            setLoading(true);
            setIsValid(false);
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
    
        // Create refs for both documents
        const userDoc = doc(firestore, `users/${user.uid}`);
        const usernameDoc = doc(firestore, `usernames/${formValue}`);

        const batch = writeBatch(firestore);
        batch.set(userDoc, {
            username: formValue,
            photoURL: user.photoURL, 
            displayName: user.displayName 
        });
        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();
      };

    const checkUsername = useCallback(
        debounce(async (username) => {
            if (username.length >= 3) {
                const ref = doc(firestore, `usernames/${username}`)
                const docSnap = await getDoc(ref);
                console.log(`firestore read executed`)
                setIsValid(!docSnap.exists())
                setLoading(false)
            }
        }, 500),[]
    )

    return (
        !username && (
            <section>
                <h3>Choose Username</h3>
                <form onSubmit={onSubmit}>
                    <Input name="username" placeholder="username" value={formValue} onChange={onChange}/>
                    <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
                    <Button colorScheme='teal' variant='solid' type='submit' className="btn-green" disabled={!isValid}>
                        Submit
                    </Button>
                    <h3>Debug</h3>
                    <div>
                        Username: {formValue} <br />
                        Loading: {loading.toString()} <br />
                        Username Valid: {isValid.toString()} <br />

                    </div>
                </form>
            </section>
        )
    )

}

function UsernameMessage({ username, isValid, loading }) {
    if (loading) {
      return <p>Checking...</p>;
    } else if (isValid) {
      return <p className="text-success">{username} is available!</p>;
    } else if (username && !isValid) {
      return <p className="text-danger">That username is taken!</p>;
    } else {
      return <p></p>;
    }
}