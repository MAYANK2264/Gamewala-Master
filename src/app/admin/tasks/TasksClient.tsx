'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CheckCircle, Clock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface Task { id?: string; title: string; description?: string; assigned_to?: string; assignedTo?: string; priority?: string; due_date?: string; dueDate?: string; status?: string }
interface Props { tasks: Task[]; employees: string[]; adminName: string }

export default function TasksClient({ tasks, employees, adminName }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', assignedTo: employees[0] || '', priority: 'medium', dueDate: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const open = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')

  const submit = async () => {
    if (!form.title || !form.assignedTo) { toast.error('Title and assignee required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, assignedBy: adminName }) })
      if (res.ok) { toast.success('Task created!'); setShowForm(false); setForm({ title: '', description: '', assignedTo: employees[0] || '', priority: 'medium', dueDate: '' }); router.refresh() }
      else toast.error('Failed to create task')
    } catch { toast.error('Error') }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(!showForm)} className="btn-primary w-full flex items-center justify-center gap-2">
        <Plus size={16} /> {showForm ? 'Cancel' : 'Create New Task'}
      </button>

      {showForm && (
        <div className="card p-5 space-y-3 animate-slide-up">
          <div>
            <label className="label">Task Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Clean display consoles" className="input-field" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assign To *</label>
              <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="input-field">
                {employees.map(e => <option key={e}>{e}</option>)}
                {employees.length === 0 && <option value="">No employees</option>}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
          </div>
          <button onClick={submit} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {saving && <Loader2 size={15} className="animate-spin" />} {saving ? 'Saving...' : 'Create Task'}
          </button>
        </div>
      )}

      {open.length > 0 && (
        <div>
          <p className="label mb-2">Open ({open.length})</p>
          <div className="space-y-2">
            {open.map((t, i) => (
              <div key={i} className="card p-4 flex items-start gap-3">
                <div className={clsx('w-2 h-2 rounded-full mt-2 shrink-0', t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold text-brand-text truncate">{t.title}</p>
                  <p className="text-xs text-brand-text-dim">→ {t.assigned_to || t.assignedTo}</p>
                  {(t.due_date || t.dueDate) && <p className="text-xs text-brand-muted mt-0.5">Due: {t.due_date || t.dueDate}</p>}
                </div>
                <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <p className="label mb-2">Completed ({done.length})</p>
          <div className="space-y-2">
            {done.slice(0, 5).map((t, i) => (
              <div key={i} className="card p-4 flex items-center gap-3 opacity-60">
                <CheckCircle size={16} className="text-green-400 shrink-0" />
                <p className="text-sm text-brand-text-dim line-through truncate">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && !showForm && (
        <div className="card p-8 text-center">
          <p className="text-brand-text-dim text-sm">No tasks yet. Create one above or add directly in Google Sheets → Tasks tab.</p>
        </div>
      )}
    </div>
  )
}
