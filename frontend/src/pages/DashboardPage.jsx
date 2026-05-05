import React from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LogOut, Plus, Trash2, UserPlus } from "lucide-react";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const emptyTask = { title: "", description: "", dueDate: "", priority: "Medium", assignedTo: "" };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [membership, setMembership] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberForm, setMemberForm] = useState({ email: "", role: "Member" });
  const [taskForm, setTaskForm] = useState(emptyTask);
  const isAdmin = membership?.role === "Admin";

  useEffect(() => { loadInitialData(); }, []);

  async function loadInitialData() {
    try {
      const [projectData, dashboardData] = await Promise.all([apiClient.get("/projects"), apiClient.get("/dashboard")]);
      setProjects(projectData.projects);
      setDashboard(dashboardData);
      if (projectData.projects.length) await selectProject(projectData.projects[0]._id);
    } catch (err) { toast.error(err.message); }
  }

  async function refreshDashboard() { setDashboard(await apiClient.get("/dashboard")); }
  async function selectProject(id) {
    try {
      const data = await apiClient.get(`/projects/${id}`);
      setSelectedProject(data.project); setMembership(data.membership); setTasks(data.tasks);
    } catch (err) { toast.error(err.message); }
  }

  async function createProject(e) {
    e.preventDefault();
    try {
      const data = await apiClient.post("/projects", projectForm);
      setProjectForm({ name: "", description: "" });
      const projectData = await apiClient.get("/projects");
      setProjects(projectData.projects);
      await selectProject(data.project._id); await refreshDashboard();
      toast.success(data.message);
    } catch (err) { toast.error(err.message); }
  }

  async function addMember(e) {
    e.preventDefault();
    try {
      const data = await apiClient.post(`/projects/${selectedProject._id}/members`, memberForm);
      setSelectedProject(data.project); setMemberForm({ email: "", role: "Member" }); toast.success(data.message);
    } catch (err) { toast.error(err.message); }
  }

  async function removeMember(userId) {
    try {
      const data = await apiClient.delete(`/projects/${selectedProject._id}/members/${userId}`);
      setSelectedProject(data.project); await selectProject(selectedProject._id); await refreshDashboard(); toast.success(data.message);
    } catch (err) { toast.error(err.message); }
  }

  async function createTask(e) {
    e.preventDefault();
    try {
      const data = await apiClient.post("/tasks", { ...taskForm, project: selectedProject._id });
      setTaskForm(emptyTask); await selectProject(selectedProject._id); await refreshDashboard(); toast.success(data.message);
    } catch (err) { toast.error(err.message); }
  }

  async function updateTaskStatus(taskId, status) {
    try {
      const data = await apiClient.patch(`/tasks/${taskId}`, { status });
      await selectProject(selectedProject._id); await refreshDashboard(); toast.success(data.message);
    } catch (err) { toast.error(err.message); }
  }

  async function deleteTask(taskId) {
    try {
      const data = await apiClient.delete(`/tasks/${taskId}`);
      await selectProject(selectedProject._id); await refreshDashboard(); toast.success(data.message);
    } catch (err) { toast.error(err.message); }
  }

  const filteredTasks = statusFilter === "All" ? tasks : tasks.filter((task) => task.status === statusFilter);
  const metrics = useMemo(() => ({ total: dashboard?.totalTasks || 0, todo: dashboard?.byStatus?.["To Do"] || 0, progress: dashboard?.byStatus?.["In Progress"] || 0, done: dashboard?.byStatus?.Done || 0, overdue: dashboard?.overdueTasks?.length || 0 }), [dashboard]);

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div><p className="eyebrow">Workspace</p><h2>Projects</h2></div>
        <form className="stack" onSubmit={createProject}>
          <label>Project name<input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} minLength="2" required /></label>
          <label>Description<textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows="3" maxLength="500" /></label>
          <button className="primary" type="submit"><Plus size={17} />Create project</button>
        </form>
        <div className="list">{projects.length === 0 && <p className="empty">No projects yet.</p>}{projects.map((project) => { const role = project.members.find((m) => m.user._id === user.id)?.role || "Member"; return <button className={`project-row ${selectedProject?._id === project._id ? "active" : ""}`} key={project._id} type="button" onClick={() => selectProject(project._id)}><strong>{project.name}</strong><small>{role} - {project.members.length} member(s)</small></button>; })}</div>
      </aside>

      <section className="main-pane">
        <header className="topbar"><div><p className="eyebrow">{user.name} - {user.email}</p><h1>{selectedProject?.name || "Select a project"}</h1><p>{selectedProject?.description || "Create or select a project to begin."}</p></div><div className="topbar-actions">{membership && <span className="badge">{membership.role}</span>}<button className="ghost icon-button" type="button" onClick={logout} title="Logout"><LogOut size={18} /></button></div></header>
        <section className="metrics">{[["Total", metrics.total], ["To Do", metrics.todo], ["In Progress", metrics.progress], ["Done", metrics.done], ["Overdue", metrics.overdue]].map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
        <div className="content-grid">
          <section className="panel task-panel"><div className="panel-title"><h2>Tasks</h2><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="All">All status</option><option>To Do</option><option>In Progress</option><option>Done</option></select></div><div className="task-list">{filteredTasks.length === 0 && <p className="empty">No tasks found.</p>}{filteredTasks.map((task) => <article className="task-row" key={task._id}><div className="task-header"><h3>{task.title}</h3><span className={`priority ${task.priority}`}>{task.priority}</span></div><p>{task.description || "No description"}</p><div className="task-meta"><span className="status">{task.status}</span><small>Due {new Date(task.dueDate).toLocaleDateString()} - {task.assignedTo?.name}</small></div><div className="task-actions"><select value={task.status} onChange={(e) => updateTaskStatus(task._id, e.target.value)}><option>To Do</option><option>In Progress</option><option>Done</option></select>{isAdmin && <button className="danger" type="button" onClick={() => deleteTask(task._id)} title="Delete task"><Trash2 size={16} /></button>}</div></article>)}</div></section>
          <div className="side-stack">
            {selectedProject && isAdmin && <><section className="panel"><h2>Create task</h2><form className="stack" onSubmit={createTask}><label>Title<input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} minLength="2" required /></label><label>Description<textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows="3" maxLength="800" /></label><div className="two-col"><label>Due date<input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required /></label><label>Priority<select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><option>Medium</option><option>Low</option><option>High</option></select></label></div><label>Assign to<select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} required><option value="">Select member</option>{selectedProject.members.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name} ({m.role})</option>)}</select></label><button className="primary" type="submit">Add task</button></form></section><section className="panel"><h2>Members</h2><form className="stack" onSubmit={addMember}><label>User email<input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} required /></label><label>Role<select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}><option>Member</option><option>Admin</option></select></label><button className="primary" type="submit"><UserPlus size={17} />Add member</button></form><div className="member-list">{selectedProject.members.map((m) => <div className="member-row" key={m.user._id}><div><strong>{m.user.name}</strong><small>{m.user.email} - {m.role}</small></div>{m.user._id !== user.id && <button className="danger" type="button" onClick={() => removeMember(m.user._id)}>Remove</button>}</div>)}</div></section></>}
            <section className="panel"><h2>Tasks per user</h2><div className="member-list">{(dashboard?.tasksPerUser || []).length === 0 && <p className="empty">No assigned tasks yet.</p>}{(dashboard?.tasksPerUser || []).map((item) => <div className="user-row" key={item.email}><strong>{item.user}</strong><span className="badge">{item.count}</span></div>)}</div></section>
          </div>
        </div>
      </section>
    </main>
  );
}
