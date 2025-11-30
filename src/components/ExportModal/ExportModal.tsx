"use client"

import Decimal from "decimal.js";
import { useState, useEffect, Fragment } from "react";
import { calculateTotalHours } from "@/utils/timeFormatFunctions";
import styles from "./ExportModal.module.scss";

interface Project {
    id: string;
    title: string;
    rate: number;
}

interface Task {
    id: string;
    projectId: string;
    title: string;
    times: {
      id: string,
      start: Date;
      end: Date | null;
      completed: boolean
    }[],
}

interface ExportData {
    totalMinutes: Decimal;
    totalEarned: Decimal;
    projects: {
        projectId: string;
        projectTitle: string;
        projectRate: number;
        totalMinutes: Decimal;
        totalEarned: Decimal;
        weeklyBreakdown: {
            startDate: Date;
            endDate: Date;
            totalMinutes: Decimal;
            totalEarned: Decimal;
        }[]
    }[]
}

export default function ExportModal({ 
    projects,
    tasks,
    closeModal
} : { 
    projects: Project[],
    tasks: Task[],
    closeModal: () => void
}) {
    const month = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    const [exportData, setExportData] = useState<ExportData>({totalMinutes: new Decimal(0), totalEarned: new Decimal(0), projects: []});

    useEffect(() => {
        const dataSetup: ExportData = {
            totalMinutes: new Decimal(0),
            totalEarned: new Decimal(0),
            projects: [],
        };

        const currentTime = new Date();
        
        projects.forEach(project => {

            const daysOfMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
            const weeksInMonth = Math.ceil(daysOfMonth / 7);

            const breakdownArr = [];

            for (let week = 0; week < weeksInMonth; week++) {
                const startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), week * 7 + 1);
                const endDate = new Date(new Date(currentTime.getFullYear(), currentTime.getMonth(), Math.min((week + 1) * 7, daysOfMonth)).setHours(23, 59, 59, 999));

                breakdownArr.push({
                    startDate,
                    endDate,
                    totalMinutes: new Decimal(0),
                    totalEarned: new Decimal(0),
                    // tasks: []
                });
            };

            dataSetup.projects.push({
                projectId: project.id,
                projectTitle: project.title, 
                projectRate: project.rate,
                totalMinutes: new Decimal(0), 
                totalEarned: new Decimal(0),
                weeklyBreakdown: breakdownArr
            });
        });

        tasks.forEach((task: Task) => {

            task.times.forEach(time => {
                
                if (time.end) {
                    const start = new Decimal(new Date(time.start).getTime()).div(60000).floor().mul(60000);
                    const end = new Decimal(new Date(time.end).getTime()).div(60000).floor().mul(60000);
                    const taskTimeInMinutes = new Decimal(end).minus(start).div(60000);

                    const project = dataSetup.projects.find(project => project.projectId === task.projectId);
                    if (project) {

                        project.weeklyBreakdown.forEach(week => {
                            
                            if (new Date(time.end!) >= week.startDate && new Date(time.end!) <= week.endDate) {

                                week.totalMinutes = new Decimal(week.totalMinutes).add(taskTimeInMinutes.trunc());
                                project.totalMinutes = new Decimal(project.totalMinutes).add(taskTimeInMinutes.trunc());
                                dataSetup.totalMinutes = new Decimal(dataSetup.totalMinutes).add(taskTimeInMinutes.trunc());
                                // const rate = task.category === "BestMind" ? 50 : 60;
                                const rate = project.projectRate;
                                const taskTimeInHours = taskTimeInMinutes.div(60);
                                const amountEarned = taskTimeInHours.mul(rate);

                                week.totalEarned = new Decimal(week.totalEarned).add(amountEarned);
                                project.totalEarned = new Decimal(project.totalEarned).add(amountEarned);
                                dataSetup.totalEarned = new Decimal(dataSetup.totalEarned).add(amountEarned);
                            }
                        });
                    };
                }
            });
        });

        setExportData(dataSetup);
    }, [tasks, projects]);

    return (
        <div className={styles.exportModalContainer}>
            <div className={styles.exportModal}>
                <h2>{month[new Date().getMonth()]} {new Date().getFullYear()} Monthly Report</h2>
                <div className={styles.exportInner}>
                    {exportData.projects.map((projectData => (
                        <div key={"export-" + projectData.projectTitle} className={styles.projectContainer}>
                            <h3>{projectData.projectTitle}</h3>
                            <div className={styles.weeksContainer}>
                                {projectData.weeklyBreakdown.map((weekData, index) => (
                                    <div key={projectData.projectTitle + "-week-" + index} className={styles.weekContainer}>
                                        <p>{new Date(weekData.startDate).getMonth() + 1}/{new Date(weekData.startDate).getDate()} - {new Date(weekData.startDate).getMonth() + 1}/{new Date(weekData.endDate).getDate()}</p>
                                        <p>{calculateTotalHours(weekData.totalMinutes)}</p>
                                        <p>${weekData.totalEarned.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className={[styles.categoryNumbers, styles.withDivider].join(" ")}>
                                <p>Total</p>
                                <p>{calculateTotalHours(projectData.totalMinutes)}</p>
                                <p>${new Decimal(projectData.totalEarned).toFixed(2)}</p>
                            </div>    
                        </div>
                    )))}
                        <div className={[styles.categoryNumbers, styles.total].join(" ")}>
                            <h3>Total</h3>
                            <p>{calculateTotalHours(exportData.totalMinutes)}</p>
                            <p>${exportData.totalEarned.toFixed(2)}</p>
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
