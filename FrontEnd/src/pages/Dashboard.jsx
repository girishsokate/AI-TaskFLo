import { useState, useMemo, useCallback } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Filter, Home as HomeIcon, Calendar as CalendarIcon, Flame } from "lucide-react"
// import TaskModal from "../components/AddTask"
// import TaskItem from "../components/TaskItem"
import axios from "axios"

import {
  WRAPPER, HEADER, ADD_BUTTON, STATS_GRID, STAT_CARD, ICON_WRAPPER, VALUE_CLASS, LABEL_CLASS,
  STATS, FILTER_OPTIONS, FILTER_LABELS, EMPTY_STATE, FILTER_WRAPPER, SELECT_CLASSES,
  TABS_WRAPPER, TAB_BASE, TAB_ACTIVE, TAB_INACTIVE
} from '../assets/dummy'


const Dashboard = () => {
  const {tasks, refreshTasks} = useOutletContext()
  const [filter, setFilter] = useState("all")

  const stats = useMemo(() => ({
    total:tasks.length,
    lowPriority: tasks.filter((t)=> t.priority?.toLowerCase() === "low").length,
    mediumPriority: tasks.filter((t)=> t.priority?.toLowerCase() === "medium").length,
    highPriority: tasks.filter((t)=> t.priority?.toLowerCase() === "high").length,
    completed: tasks.filter((t) => 
          t.completed === true || t.completed === 1 ||
      (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length
  }),[tasks])

  const filteredTasks = useMemo(()=> tasks.filter(task =>{
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
    console.log(dueDate)
    console.log(nextWeek)
    switch (filter) {
      case "today":
        return dueDate.toDateString() === today.toDateString()
      case "week":
        return dueDate >= today && dueDate <= nextWeek
      case "high":
      case "medium":
      case "low":
        return task.priority?.toLowerCase() === filter
      default:
        return true
    }

  }),[tasks, filter])
  
  return (
       <div className={WRAPPER}>
      {/* Header */}
      <div className={HEADER}>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HomeIcon className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Overview</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-7 truncate">Manage your tasks efficiently</p>
        </div>
        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* Stats */}
      <div className={STATS_GRID}>
      {STATS.map(({ key, label, icon: Icon, iconColor, borderColor = "border-purple-100", valueKey, textColor, gradient }) => (
           <div key={key} className={`${STAT_CARD} ${borderColor}`}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${ICON_WRAPPER} ${iconColor}`}><Icon className="w-4 h-4 md:w-5 md:h-5" /></div>
              <div className="min-w-0">
                <p className={`${VALUE_CLASS} ${gradient ? "bg-linear-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent" : textColor}`}>{stats[valueKey]}</p>
                <p className={LABEL_CLASS}>{label}</p>
              </div>
            </div>
          </div>
      ))}

      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filter */}
        <div className={FILTER_WRAPPER}>
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-5 h-5 text-purple-500 shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">{FILTER_LABELS[filter]}</h2>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className={SELECT_CLASSES}>
            {FILTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
          </select>
          <div className={TABS_WRAPPER}>
            {FILTER_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setFilter(opt)} className={`${TAB_BASE} ${filter === opt ? TAB_ACTIVE : TAB_INACTIVE}`}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className={EMPTY_STATE.wrapper}>
              <div className={EMPTY_STATE.iconWrapper}><CalendarIcon className="w-8 h-8 text-purple-500" /></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks found</h3>
              <p className="text-sm text-gray-500 mb-4">{filter === "all" ? "Create your first task to get started" : "No tasks match this filter"}</p>
              <button onClick={() => setShowModal(true)} className={EMPTY_STATE.btn}>Add New Task</button>
            </div>
          ) : (
            filteredTasks.map(task => (
              console.log(task)
            ))
          )}
        </div>

      </div>














      </div>
  )
}

export default Dashboard