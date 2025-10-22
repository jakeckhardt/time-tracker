"use client"

import { useState, useEffect, Fragment } from "react";
import styles from "./page.module.scss";
import { createClient } from '@supabase/supabase-js'
import Task from "@/components/Task/Task";
import AddModal from "@/components/AddModal/AddModal";
import ExportModal from "@/components/ExportModal/ExportModal";
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)

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

const categories = ["BestMind", "CapTrust", "CO Materials"];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addTask, setAddTask] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  async function handleTimer(index: number) {
    const newTasks = [...tasks];

    if (activeTask !== null) {
      const currentTime = new Date();
      const lastTimeEntry = newTasks[Number(activeTask)].times[newTasks[Number(activeTask)].times.length - 1];

      if (lastTimeEntry && !lastTimeEntry.end) {
        lastTimeEntry.end = currentTime;

        const { error } = await supabase
          .from('times')
          .insert({ start: lastTimeEntry.start, end: lastTimeEntry.end, task_id: newTasks[Number(activeTask)].id });
        
        if (error) {
          console.error("Error adding task:", error);
          return;
        }
      };
    };

    if (activeTask === index) {
      setActiveTask(null);
      setTasks(newTasks);
      return;
    }

    newTasks[Number(index)].times.push({ id: (newTasks[Number(index)].times.length + 1).toString(), start: new Date(), end: null, completed: false });
    setTasks(newTasks);
    setActiveTask(activeTask === index ? null : index);
  };

  async function handleAddTask(taskTitle: string, taskCategory: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: taskTitle, category: taskCategory })
      .select();
    
    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    const newTasks = [{ id: data[0].id, title: taskTitle, times: [], category: taskCategory }, ...tasks];
    setTasks(newTasks);
  };

  async function updateTaskCompletion(timeId: string, completed: boolean) {
    const { error } = await supabase
      .from('times')
      .update({ completed: completed })
      .eq('id', timeId);
    
    if (error) {
      console.error("Error updating task completion:", error);
      return;
    }

    let newTasks = [...tasks];
    let updatedTask = newTasks.find(task => task.times.some(time => time.id === timeId));

    if (updatedTask) {
      let timeEntry = updatedTask.times.find(time => time.id === timeId);
      if (timeEntry) {
        timeEntry.completed = completed;
      }
    };

    setTasks(newTasks);
  };

  useEffect(() => {
    async function getSession() {
        const { data } = await supabase.auth.getSession();

        if (data.session === null) {
            router.push('/login');
        }
    }

    getSession();

    async function getTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          category,
          title,
          times (
            id,
            start,
            end,
            completed
          )
        `)
        .order('start', { referencedTable: 'times', ascending: false });
      
      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        if (data) {
          setTasks(data as Task[]);
          setLoading(false);
        }
      }
    }
    
    getTasks();
  }, [router]);

  return (
    <div className={styles.page}>
      <h1>Task Timer</h1>
      <div className={styles.actionsContainer}>
        <div className={styles.categories}>
          {categories.map((category => (
            <button 
              key={"category-" + category}
              className={[styles.categoryButton, selectedCategory === category ? styles.selected : " "].join(" ")}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>                        
          )))}
          <button 
            className={[styles.categoryButton, selectedCategory === "All" ? styles.selected : ""].join(" ")}
            onClick={() => setSelectedCategory("All")}
          >
            All 
          </button>
        </div>
        <div className={styles.actionButtonsContainer}>
          <button 
            className={styles.addTaskButton}
            onClick={() => setShowExport(true)}
          >
            Export
          </button>
          <button 
            className={styles.addTaskButton}
            onClick={() => setAddTask(true)}
          >
            + Add Task
          </button>
        </div>
      </div>
      <div className={styles.allTaskContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Fragment>
            {tasks.map((task, index) => (
              (selectedCategory === "All" || task.category === selectedCategory) &&
                <Task 
                  key={"task-" + index} 
                  task={task} 
                  index={index} 
                  activeTask={activeTask} 
                  handleTimer={handleTimer} 
                  updateTimeCompletion={updateTaskCompletion}
                />
            ))}
          </Fragment>
        )}
      </div>
      {addTask && (
        <AddModal 
          categories={categories}
          handleAddTask={handleAddTask}
          closeModal={() => setAddTask(false)}
        />
      )}
      {showExport && (
        <ExportModal 
          categories={categories}
          tasks={tasks}
          closeModal={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
