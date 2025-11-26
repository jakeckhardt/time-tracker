"use client"

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from 'next/navigation';
import styles from "./Navigation.module.scss";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)

export default function Navigation() {
    const router = useRouter();
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    function handleUserButton() {
        if (userLoggedIn) {
            supabase.auth.signOut();
            router.push('/login');
            return;
        }
        router.push('/login');
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserLoggedIn(session === null ? false : true);
        });
    
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUserLoggedIn(session === null ? false : true);
            }
        );
    
        return () => listener.subscription.unsubscribe();  
    }, []);

    return (
        <div className={styles.navigationContainer}>
            <div className={styles.innerContainer}>
                <h1>Task Timer</h1>
                <div className={styles.navButtons}>
                    <button
                        onClick={handleUserButton}
                    >
                        {userLoggedIn ? "Logout" : "Login"}
                    </button>
                </div>
            </div>
        </div>
    )
};
