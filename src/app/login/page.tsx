"use client"

import { useState, useEffect } from "react";
import styles from "./login.module.scss";

import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)

export default function Login() {
    const router = useRouter();
    const [password, setPassword] = useState<string>("");

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
                email: 'jake.c.eckhardt@gmail.com',
                password: password,
            });

            if (data) {
                router.push('/');
            }
        } catch (error) {
            console.error('Error signing up:', error);
        };
    };

    return (
        <div className={styles.loginContainer}>
            <h1>Prove it.</h1>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    )
};
