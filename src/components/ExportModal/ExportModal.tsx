"use client"

import { useState, useEffect, Fragment } from "react";
import { calculateTotalHours } from "@/utils/timeFormatFunctions";
import styles from "./ExportModal.module.scss";

interface Task {
    id: string;
    title: string;
    times: { 
        id: string,
        start: Date; 
        end: Date | null;
        completed: boolean
    }[],
    category: string
}

interface ExportData {
    name: string;
    totalMinutes: number;
    totalEarned: number;
}

export default function ExportModal({ 
    categories,
    tasks,
    closeModal
} : { 
    categories: string[],
    tasks: Task[],
    closeModal: () => void
}) {
    const month = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    const [exportData, setExportData] = useState<ExportData[]>([]);

    useEffect(() => {
        const totalArr: ExportData[] = [];
        
        categories.forEach(category => {
            totalArr.push({name: category, totalMinutes: 0, totalEarned: 0});
        });

        tasks.forEach((task: Task) => {
            task.times.forEach(time => {
                if (time.end) {
                    const start = new Date(time.start);
                    const end = new Date(time.end);
                    const diff = (end.getTime() - start.getTime()) / (1000 * 60); // difference in hours

                    const categoryTotal = totalArr.find(total => total.name === task.category);
                    
                    if (categoryTotal) {
                        categoryTotal.totalMinutes += diff;
                    }
                }
            });
        });

        totalArr.forEach(category => {
            // const categoryTotal = totalArr.find(total => total.name === category);
            if (category.totalMinutes) {
                // Assuming a fixed hourly rate for demonstration; replace with actual logic if needed
                const hourlyRate = category.name === "BestMind" ? 50 : 60; 
                category.totalEarned = category.totalMinutes / 60 * hourlyRate;
            }
        });

        setExportData(totalArr);
    }, [tasks, categories]);

    return (
        <div className={styles.exportModalContainer}>
            <div className={styles.exportModal}>
                <h2>{month[new Date().getMonth()]} {new Date().getFullYear()} Monthly Report</h2>
                <div className={styles.exportInner}>
                    {exportData.map((categoryData => (
                        <Fragment key={"export-" + categoryData.name}>
                            <h3>{categoryData.name}</h3>
                            <div className={[styles.categoryNumbers, styles.withDivider].join(" ")}>
                                <p>{calculateTotalHours(categoryData.totalMinutes)}</p>
                                <p>${categoryData.totalEarned.toFixed(2)}</p>
                            </div>    
                        </Fragment>
                    )))}
                        <h3>Total</h3>
                        <div className={[styles.categoryNumbers, styles.total].join(" ")}>
                            <p>{calculateTotalHours(exportData.reduce((acc, curr) => acc + curr.totalMinutes, 0))}</p>
                            <p>${exportData.reduce((acc, curr) => acc + curr.totalEarned, 0).toFixed(2)}</p>
                        </div>
                </div>
                <button 
                    className={styles.close}
                    onClick={closeModal}
                >
                    Exit
                </button>
            </div>
        </div>
    )
};
