"use client"

import { useState } from "react";
import styles from "./AddModal.module.scss";

export default function AddModal({ 
    categories,
    handleAddTask,
    closeModal
} : { 
    categories: string[],
    handleAddTask: (title: string, category: string) => void,
    closeModal: () => void
}) {

    const [newTaskTitle, setNewTaskTitle] = useState<string>("");
    const [newTaskCategory, setNewTaskCategory] = useState<string>(categories[0]);

    function handleModalSubmit() {
        handleAddTask(newTaskTitle, newTaskCategory);
        setNewTaskTitle("");
        setNewTaskCategory(categories[0]);
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
                    {categories.map((category => (
                        <button 
                            key={`addModal-category-${category}`}
                            className={[styles.categoryButton, newTaskCategory === category && styles.activeCategory].join(" ")}
                            onClick={() => setNewTaskCategory(category)}
                        >
                            {category}
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
