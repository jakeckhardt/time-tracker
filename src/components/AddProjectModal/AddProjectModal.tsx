"use client"

import { useState } from "react";
import styles from "./AddProjectModal.module.scss";

export default function AddProjectModal({ 
    handleAddProject,
    closeModal
} : { 
    handleAddProject: (projectTitle: string, rate: number) => void,
    closeModal: () => void
}) {

    const [newProjectTitle, setNewProjectTitle] = useState<string>("");
    const [projectRate, setProjectRate] = useState<number>(0);

    function handleModalSubmit() {
        handleAddProject(newProjectTitle, projectRate);
        setNewProjectTitle("");
        setProjectRate(0);
        closeModal();
    };

    return (
        <div className={styles.addProjectModalContainer}>
            <div className={styles.addProjectModal}>
                <h2>Add Project</h2>
                <input 
                    type="text" 
                    placeholder="Task Title" 
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                />
                <input 
                    type="number"
                    placeholder="Rate"
                    value={projectRate}
                    onChange={(e) => setProjectRate(Number(e.target.value))}     
                />
                <button 
                    className={styles.addTask}
                    onClick={handleModalSubmit}
                >
                    Add Project
                </button>
                <button 
                    className={styles.close}
                    onClick={closeModal}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
};
