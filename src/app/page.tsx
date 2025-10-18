"use client"

import { useState, useEffect, Fragment } from "react";
import styles from "./page.module.scss";
import { createClient } from '@supabase/supabase-js'
import Task from "@/components/Task/Task";
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)

interface Task {
  id: string;
  title: string;
  times: { 
      id: string,
      start: Date; 
      end: Date | null 
  }[],
  category: string
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<number | null>(null);

  const categories = ["BestMind", "CapTrust", "CO Materials"];

  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskCategory, setNewTaskCategory] = useState<string>(categories[0]);

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

    newTasks[Number(index)].times.push({ id: (newTasks[Number(index)].times.length + 1).toString(), start: new Date(), end: null });
    setTasks(newTasks);
    setActiveTask(activeTask === index ? null : index);
  };

  async function addTask() {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: newTaskTitle, category: newTaskCategory })
      .select();
    
    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    const newTasks = [...tasks, { id: data[0].id, title: newTaskTitle, times: [], category: newTaskCategory }];
    setTasks(newTasks);
    setNewTaskTitle("");
    setNewTaskCategory(categories[0]);
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
            end
          )
        `);
      
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
      <div className={styles.addContainer}>
        <input 
          type="text" 
          placeholder="New Task Title" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <div className={styles.categoriesContainer}>
          {categories.map((category => (
            <button 
              key={"category=" + category} 
              className={[styles.categoryButton, newTaskCategory === category && styles.activeCategory].join(" ")}
              onClick={() => setNewTaskCategory(category)}
            >
              {category}
            </button>
          )))}
        </div>
        <button className={styles.addTask} onClick={addTask}>Add Task</button>
      </div>
      <div className={styles.allTaskContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Fragment>
            {tasks.map((task, index) => (
              <Task 
                key={"task-" + index} 
                task={task} 
                index={index} 
                activeTask={activeTask} 
                handleTimer={handleTimer} 
              />
            ))}
          </Fragment>
        )}
      </div>
    </div>
  );
}
