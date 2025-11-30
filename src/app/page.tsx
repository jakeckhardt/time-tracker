"use client"

import { useState, useEffect, Fragment } from "react";
import styles from "./page.module.scss";
import { createClient } from '@supabase/supabase-js'
import Task from "@/components/Task/Task";
import AddProjectModal from "@/components/AddProjectModal/AddProjectModal";
import AddModal from "@/components/AddModal/AddModal";
import ExportModal from "@/components/ExportModal/ExportModal";
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!)

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

interface Project {
  id: string;
  title: string;
  rate: number;
}

const categories = ["BestMind", "CapTrust", "CO Materials"];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addProject, setAddProject] = useState(false);
  const [addTask, setAddTask] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  async function handleTimer(index: number) {
    const newTasks = [...tasks];

    if (activeTask !== null) {
      const currentTime = new Date();
      const lastTimeEntry = newTasks[Number(activeTask)].times[0];

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

    newTasks[Number(index)].times = ([{ id: (newTasks[Number(index)].times.length + 1).toString(), start: new Date(), end: null, completed: false }, ...newTasks[Number(index)].times]);

    setTasks(newTasks);
    setActiveTask(activeTask === index ? null : index);
  };

  async function handleAddProject(projectTitle: string, rate: number) {
    console.log(projectTitle);
    const { data, error } = await supabase
      .from('projects')
      .insert({ project_title: projectTitle, rate: rate })
      .select();

    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    console.log(data);
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

    const newTasks = [...tasks, { id: data[0].id, title: taskTitle, times: [], category: taskCategory }];
    // setTasks(newTasks);
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

    const newTasks = [...tasks];
    const updatedTask = newTasks.find(task => task.times.some(time => time.id === timeId));

    if (updatedTask) {
      const timeEntry = updatedTask.times.find(time => time.id === timeId);
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

    async function getProjects() {
      const currentDate = new Date();

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          project_title,
          rate,
          tasks (
            id,
            project_id,
            title,
            times (
              id,
              start,
              end,
              completed
            )
          )
        `)
      .order('start', { referencedTable: 'tasks.times', ascending: false })
      .gte('tasks.times.start', new Date(`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-1`).toISOString());

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      console.log(data);

      const projectArr = data.map(project => ({
        id: project.id,
        title: project.project_title,
        rate: project.rate
      }));
      
      const projectTasksArr = data.flatMap(project =>
        project.tasks.map(task => ({
          id: task.id,
          projectId: task.project_id,
          title: task.title,
          times: task.times
        }))
      );

      setProjects(projectArr);
      setTasks(projectTasksArr);
      setLoading(false);
    };

    getProjects();
  }, [router]);

  return (
    <div className={styles.page}>
      <div className={styles.actionsContainer}>
        <div className={styles.categories}>
          {projects.map((project => (
            <button
              key={"project-" + project.title}
              className={[styles.categoryButton, selectedCategory === project.id ? styles.selected : " "].join(" ")}
              onClick={() => setSelectedCategory(project.id)}
            >
              {project.title}
            </button>
          )))}
          <button
            className={[styles.categoryButton, selectedCategory === "All" ? styles.selected : ""].join(" ")}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          <button 
            className={styles.addProjectButton}
            onClick={() => setAddProject(true)}>
              + Add project
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
          <h2 className={styles.loading}>Loading...</h2>
        ) : (
          <Fragment>
            {tasks.map((task, index) => (
              (selectedCategory === "All" || task.projectId === selectedCategory) &&
              <Task
                key={"task-" + index}
                task={task}
                projectTitle={projects.find(project => project.id === task.projectId)!.title}
                index={index}
                activeTask={activeTask}
                handleTimer={handleTimer}
                updateTimeCompletion={updateTaskCompletion}
              />
            ))}
          </Fragment>
        )}
      </div>
      {addProject && (
        <AddProjectModal
          handleAddProject={handleAddProject}
          closeModal={() => setAddProject(false)}
        />
      )}
      {addTask && (
        <AddModal
          projects={projects}
          handleAddTask={handleAddTask}
          closeModal={() => setAddTask(false)}
        />
      )}
      {showExport && (
        <ExportModal
          projects={projects}
          tasks={tasks}
          closeModal={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
