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
    const [projectRate, setProjectRate] = useState<string>("");

    function handleModalSubmit() {
        handleAddProject(newProjectTitle, Number(projectRate));
        setNewProjectTitle("");
        setProjectRate("");
        closeModal();
    };

    return (
        <div className={styles.addProjectModalContainer}>
            <div className={styles.addProjectModal}>
                <h2>Add Project</h2>
                <div className={styles.inputContainer}>
                    <label htmlFor="projectTitle">Project Title</label>
                    <input 
                        id="projectTitle"
                        type="text" 
                        placeholder="Project Title" 
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                    />
                </div>
                <div className={styles.inputContainer}>
                    <label htmlFor="projectRate">Project Rate</label>
                    <input 
                        id="projectRate"
                        type="number"
                        placeholder="Rate"
                        value={projectRate}
                        onChange={(e) => setProjectRate(e.target.value)}     
                    />
                </div>
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
