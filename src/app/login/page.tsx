"use client"

import { useState, useEffect } from "react";
import styles from "./login.module.scss";
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)

export default function Login() {
    const router = useRouter();
    const [user, setUser] = useState<string>("")
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");


    useEffect(() => {
        async function getSession() {
            const { data } = await supabase.auth.getSession();

            if (data.session !== null) {
                router.push('/');
            }
        }

        getSession();
    }), [];

    async function handleLogin() {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: user,
                password: password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            if (data) {
                router.push('/');
            }

        } catch (error) {
            console.error('Error logging in:', error);
        };
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.innerContainer}>
                <h1>Login</h1>
                {error.length > 0 && (
                    <div className={styles.errorContainer}>
                        <p>{error}</p>
                    </div>
                )}
                <div className={styles.inputContainer}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" value={user} onChange={(e) => setUser(e.target.value)} />
                </div>
                <div className={styles.inputContainer}>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button onClick={handleLogin}>Login</button>
                <div className={styles.orDivider}>
                    <span/>
                    <p>or</p>
                    <span/>
                </div>
                <a href="/signup" className={styles.signup}>Signup</a>
            </div>
        </div>
    )
};
