"use client"

import { useState } from "react";
import styles from "./AddTaskModal.module.scss";

interface Project {
    id: string;
    title: string;
    rate: number;
}

export default function AddTaskModal({ 
    projects,
    handleAddTask,
    closeModal
} : { 
    projects: Project[],
    handleAddTask: (title: string, projectId: string) => void,
    closeModal: () => void
}) {

    const [newTaskTitle, setNewTaskTitle] = useState<string>("");
    const [projectId, setProjectId] = useState<string>(projects[0].id);

    function handleModalSubmit() {
        handleAddTask(newTaskTitle, projectId);
        setNewTaskTitle("");
        setProjectId(projects[0].id);
        closeModal();
    };

    return (
        <div className={styles.addTaskModalContainer}>
            <div className={styles.addTaskModal}>
                <h2>Add Task</h2>
                <div className={styles.inputContainer}>
                    <label htmlFor="taskTitle">Task Title</label>
                    <input 
                        id="taskTitle"
                        type="text" 
                        placeholder="Title of upcoming task" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                </div>
                {projects.length > 1 && (
                    <div className={styles.categoriesContainer}>
                        {projects.map((project => (
                            <button 
                                key={`addTaskModal-category-${project.id}`}
                                className={[styles.categoryButton, projectId === project.id && styles.activeCategory].join(" ")}
                                onClick={() => setProjectId(project.id)}
                            >
                                {project.title}
                            </button>                        
                        )))}
                    </div>
                )}
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
