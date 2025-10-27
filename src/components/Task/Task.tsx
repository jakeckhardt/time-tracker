"use client"

import { useState } from "react";
import { formatDate, calculateDuration } from "@/utils/timeFormatFunctions";
import styles from "./Task.module.scss";

interface Task {
    id: string;
    title: string;
    times: {
        id: string,
        start: Date;
        end: Date | null,
        completed: boolean
    }[],
    category: string,
};

export default function Task({ 
    task, 
    index, 
    activeTask, 
    handleTimer,
    updateTimeCompletion 
} : { 
    task: Task, 
    index: number, 
    activeTask: number | null, 
    handleTimer: (index: number, id: string) => void ,
    updateTimeCompletion: (taskId: string, completed: boolean) => void
}) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    function formatTime(date: Date) {
        const d = new Date(date);

        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const timeString = hours + ':' + formattedMinutes + ' ' + ampm;

        return timeString;
    };

    function checkUncompletedTimes() {
        const uncompleted = task.times.some(time => !time.completed);
        return uncompleted ? styles.uncompletedTask : "";
    };

    return (
        <div key={"task-" + task.id} className={styles.taskContainer}>
            <div className={[styles.task, activeTask === index ? styles.activeTask : checkUncompletedTimes()].join(" ")}>
                <div className={styles.taskDetails}>
                    <p className={styles.taskTitle}>{task.title}</p>
                    <p>{task.category}</p>
                    <button onClick={() => handleTimer(index, task.id)}>{activeTask === index ? "Stop Timer" : "Start Timer"}</button>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    className={[isOpen ? styles.open : ""].join("")}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <path d="M300.3 440.8C312.9 451 331.4 450.3 343.1 438.6L471.1 310.6C480.3 301.4 483 287.7 478 275.7C473 263.7 461.4 256 448.5 256L192.5 256C179.6 256 167.9 263.8 162.9 275.8C157.9 287.8 160.7 301.5 169.9 310.6L297.9 438.6L300.3 440.8z" />
                </svg>
            </div>
            <div className={[styles.timeEntriesContainer, isOpen ? styles.open : ""].join(" ")}>
                <div className={styles.timeEntries}>
                    {task.times.length === 0 ? (
                        <p>No time entries yet.</p>
                    ) : ( 
                        task.times.map((time, index) => (
                            <div key={`time-${task.id}-${index}`} className={[styles.timeEntry, time.completed ? styles.completed : ""].join(" ")}>
                                <p>{formatDate(time.start)}</p>
                                <p>{formatTime(time.start)} - {time.end ? formatTime(new Date(time.end)) : "In Progress"}</p>
                                <p>{calculateDuration(time.start, time.end)}</p>
                                <div 
                                    className={[styles.checkbox, time.completed ? styles.checked : ""].join(" ")} 
                                    onClick={() => updateTimeCompletion(time.id, !time.completed)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"> 
                                        <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>
                                    </svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
};
