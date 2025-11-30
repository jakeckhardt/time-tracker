"use client"

import { useState } from "react";
import styles from "./AddModal.module.scss";

interface Project {
    id: string;
    title: string;
    rate: number;
}

export default function AddModal({ 
    projects,
    handleAddTask,
    closeModal
} : { 
    projects: Project[],
    handleAddTask: (title: string, category: string) => void,
    closeModal: () => void
}) {

    const [newTaskTitle, setNewTaskTitle] = useState<string>("");
    const [newTaskCategory, setNewTaskCategory] = useState<string>(projects[0].id);

    function handleModalSubmit() {
        handleAddTask(newTaskTitle, newTaskCategory);
        setNewTaskTitle("");
        setNewTaskCategory(projects[0].id);
        closeModal();
    };

    return (
        <div className={styles.addModalContainer}>
            <div className={styles.addModal}>
                <h2>Add Task</h2>
                <input 
                    type="text" 
                    placeholder="Task Title" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <div className={styles.categoriesContainer}>
                    {projects.map((project => (
                        <button 
                            key={`addModal-category-${project.id}`}
                            className={[styles.categoryButton, newTaskCategory === project.id && styles.activeCategory].join(" ")}
                            onClick={() => setNewTaskCategory(project.id)}
                        >
                            {project.title}
                        </button>                        
                    )))}
                </div>
                <button 
                    className={styles.addTask}
                    onClick={handleModalSubmit}
                >
                    Add Task
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
