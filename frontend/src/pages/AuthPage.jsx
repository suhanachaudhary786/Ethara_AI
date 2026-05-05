import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { LockKeyhole, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") await signup(form);
      else await login({ email: form.email, password: form.password });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="brand-block"><p className="eyebrow">MERN Assignment</p><h1>Team Task Manager</h1><p>Create projects, invite teammates, assign work, and track delivery with a MongoDB-backed workflow.</p></section>
      <form className="auth-panel" onSubmit={handleSubmit}>
        <div className="tabs"><button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}><LockKeyhole size={17} />Login</button><button className={mode === "signup" ? "active" : ""} type="button" onClick={() => setMode("signup")}><UserPlus size={17} />Signup</button></div>
        {mode === "signup" && <label>Name<input name="name" value={form.name} onChange={updateField} minLength="2" required /></label>}
        <label>Email<input name="email" type="email" value={form.email} onChange={updateField} required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={updateField} minLength="6" required /></label>
        <button className="primary" type="submit" disabled={submitting}>{submitting ? "Please wait..." : "Continue"}</button>
      </form>
    </main>
  );
}
