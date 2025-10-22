"use client"

import { useState, useEffect, Fragment } from "react";
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
    totalHours: number;
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

    const [exportData, setExportData] = useState<ExportData[]>([]);

    useEffect(() => {
        const totalArr: ExportData[] = [];
        
        categories.forEach(category => {
            totalArr.push({name: category, totalHours: 0, totalEarned: 0});
        });

        tasks.forEach((task: Task) => {
            task.times.forEach(time => {
                if (time.end) {
                    const start = new Date(time.start);
                    const end = new Date(time.end);
                    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // difference in hours

                    const categoryTotal = totalArr.find(total => total.name === task.category);
                    
                    if (categoryTotal) {
                        categoryTotal.totalHours += diff;
                        
                    }
                }
            });
        });

        totalArr.forEach(category => {
            // const categoryTotal = totalArr.find(total => total.name === category);
            if (category.totalHours) {
                // Assuming a fixed hourly rate for demonstration; replace with actual logic if needed
                const hourlyRate = category.name === "BestMind" ? 50 : 60; 
                category.totalEarned = category.totalHours * hourlyRate;
            }
        });

        setExportData(totalArr);
    }, [tasks, categories]);

    return (
        <div className={styles.exportModalContainer}>
            <div className={styles.exportModal}>
                <h2>Monthly Report</h2>
                {exportData.map((categoryData => (
                    <Fragment key={"export-" + categoryData.name}>
                        <h3>{categoryData.name}</h3>    
                        <p>{categoryData.totalHours.toFixed(2)} hours</p>
                        <p>${categoryData.totalEarned.toFixed(2)}</p>
                    </Fragment>
                )))}
                <div>
                    <h3>Total</h3>
                    <p>{exportData.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(2)} hours</p>
                    <p>${exportData.reduce((acc, curr) => acc + curr.totalEarned, 0).toFixed(2)}</p>
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
