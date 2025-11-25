"use client"

import { useState, useEffect } from "react";
import styles from "./signup.module.scss";
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation';
import clsx from "clsx";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)

export default function Signup() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [firstName, setFirstName] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        async function getSession() {
            const { data } = await supabase.auth.getSession();

            if (data.session !== null) {
                router.push('/');
            }
        }

        getSession();
    }), [];

    async function handleSignup() {
        if (firstName.length === 0) {
            if (password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword) {
                setPasswordError(true);
                return;
            }

            try {
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });

                if (error) {
                    setError(error.message);
                    return;
                }

                if (data) {
                    console.log(data);
                    setSuccess(true);
                }
            } catch (error) {
                console.error('Error signing up:', error);
            };
        };
    };

    useEffect(() => {
        setPasswordError(false);
    }), [password, confirmPassword];

    return (
        <div className={styles.signupContainer}>
            <div className={styles.innerContainer}>
                {!success ? (
                    <>
                        <h1>Signup</h1>
                        {error.length > 0 && (
                            <div className={styles.errorContainer}>
                                <p>{error}</p>
                            </div>
                        )}
                        <div className={styles.inputContainer}>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className={clsx(styles.inputContainer, {[styles.error]: passwordError})}>
                            <label htmlFor="password">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className={clsx(styles.inputContainer, {[styles.error]: passwordError})}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <input id="firstName" type="hidden" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <button onClick={handleSignup} disabled={!email || !password || !confirmPassword}>Signup</button>
                        <div className={styles.orDivider}>
                            <span/>
                            <p>or</p>
                            <span/>
                        </div>
                        <a href="/login" className={styles.login}>Login</a>
                    </>
                ) : (
                    <div className={styles.successContainer}>
                        <h2>Signup Successful!</h2>
                        <p>Please check your email to verify your account.</p>
                        <a href="/login" className={styles.login}>Login</a>
                    </div>
                )}
            </div>
        </div>
    )
};
