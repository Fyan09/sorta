'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home, FileText, Settings, LogOut, ChevronRight,
  Users, Database, Plus, Pencil, Trash2, X, Check, Eye, EyeOff
} from 'lucide-react'

interface User {
  id: number
  nama: string
  username: string
  role: 'admin' | 'operator'
  created_at: string
}

interface DbConfig {
  host: string
  port: string
  user: string
  password: string
  database: string
}

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-700 border border-blue-300',
  operator: 'bg-gray-100 text-gray-700 border border-gray-300',
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'database'>('users')

  // ===== USER STATE =====
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [userForm, setUserForm] = useState({ nama: '', username: '', password: '', role: 'operator' })
  const [userMsg, setUserMsg] = useState({ text: '', type: '' })

  // ===== DB CONFIG STATE =====
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: '', port: '3306', user: '', password: '', database: ''
  })
  const [dbMsg, setDbMsg] = useState({ text: '', type: '' })
  const [showDbPassword, setShowDbPassword] = useState(false)
  const [testingDb, setTestingDb] = useState(false)

  // ===== FETCH USERS =====
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/settings/users')
      const json = await res.json()
      if (json.success) setUsers(json.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // ===== FETCH DB CONFIG from .env =====
  const fetchDbConfig = async () => {
    try {
      const res = await fetch('/api/settings/database')
      const json = await res.json()
      if (json.success) setDbConfig(json.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchDbConfig()
  }, [])

  // ===== OPEN MODAL =====
  const openAdd = () => {
    setEditUser(null)
    setUserForm({ nama: '', username: '', password: '', role: 'operator' })
    setShowModal(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setUserForm({ nama: u.nama, username: u.username, password: '', role: u.role })
    setShowModal(true)
  }

  // ===== SAVE USER =====
  const handleSaveUser = async () => {
    try {
      const method = editUser ? 'PUT' : 'POST'
      const body = editUser
        ? { id: editUser.id, ...userForm }
        : userForm

      const res = await fetch('/api/settings/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()

      if (json.success) {
        setUserMsg({ text: json.message, type: 'success' })
        setShowModal(false)
        fetchUsers()
      } else {
        setUserMsg({ text: json.message, type: 'error' })
      }
    } catch (err) {
      setUserMsg({ text: 'Terjadi kesalahan', type: 'error' })
    }
    setTimeout(() => setUserMsg({ text: '', type: '' }), 3000)
  }

  // ===== DELETE USER =====
  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus user ini?')) return
    try {
      const res = await fetch('/api/settings/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const json = await res.json()
      if (json.success) {
        setUserMsg({ text: json.message, type: 'success' })
        fetchUsers()
      }
    } catch (err) {
      setUserMsg({ text: 'Gagal menghapus user', type: 'error' })
    }
    setTimeout(() => setUserMsg({ text: '', type: '' }), 3000)
  }

  // ===== SAVE DB CONFIG =====
  const handleSaveDb = async () => {
    try {
      const res = await fetch('/api/settings/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig)
      })
      const json = await res.json()
      setDbMsg({ text: json.message, type: json.success ? 'success' : 'error' })
    } catch (err) {
      setDbMsg({ text: 'Gagal menyimpan konfigurasi', type: 'error' })
    }
    setTimeout(() => setDbMsg({ text: '', type: '' }), 3000)
  }

  // ===== TEST DB CONNECTION =====
  const handleTestDb = async () => {
    setTestingDb(true)
    try {
      const res = await fetch('/api/settings/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig)
      })
      const json = await res.json()
      setDbMsg({ text: json.message, type: json.success ? 'success' : 'error' })
    } catch (err) {
      setDbMsg({ text: 'Koneksi gagal', type: 'error' })
    } finally {
      setTestingDb(false)
    }
    setTimeout(() => setDbMsg({ text: '', type: '' }), 4000)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-700 to-slate-800 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8">Monitoring System</h2>
        <nav className="flex-1 space-y-2">
          <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600">
            <Home size={20} /> Dashboard
          </button>
          <button onClick={() => router.push('/reporting')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600">
            <FileText size={20} /> Reporting
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-blue-600">
            <div className="flex items-center gap-3"><Settings size={20} /> Settings</div>
            <ChevronRight size={16} />
          </button>
        </nav>
        <button onClick={() => router.push('/login')} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'}`}
          >
            <Users size={16} /> Manajemen User
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm ${activeTab === 'database' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'}`}
          >
            <Database size={16} /> Konfigurasi Database
          </button>
        </div>

        {/* ===== TAB: USERS ===== */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Daftar User</h2>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                <Plus size={16} /> Tambah User
              </button>
            </div>

            {/* Alert */}
            {userMsg.text && (
              <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${userMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {userMsg.text}
              </div>
            )}

            <table className="w-full text-sm">
              <thead className="bg-slate-700 text-white rounded">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Dibuat</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Memuat...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada user</td></tr>
                ) : users.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium">{u.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{u.username}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_STYLE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== TAB: DATABASE ===== */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-xl shadow p-6 max-w-lg">
            <h2 className="font-bold text-lg mb-4">Konfigurasi Database</h2>

            {dbMsg.text && (
              <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${dbMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {dbMsg.text}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: 'Host', key: 'host', placeholder: '10.10.1.112' },
                { label: 'Port', key: 'port', placeholder: '3306' },
                { label: 'Username DB', key: 'user', placeholder: 'admin' },
                { label: 'Nama Database', key: 'database', placeholder: 'klasifikasi_telur' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-sm text-gray-600 mb-1 block">{label}</label>
                  <input
                    type="text"
                    value={(dbConfig as any)[key]}
                    onChange={e => setDbConfig(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              {/* Password DB */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Password DB</label>
                <div className="relative">
                  <input
                    type={showDbPassword ? 'text' : 'password'}
                    value={dbConfig.password}
                    onChange={e => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDbPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showDbPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleTestDb}
                  disabled={testingDb}
                  className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {testingDb ? 'Testing...' : 'Test Koneksi'}
                </button>
                <button
                  onClick={handleSaveDb}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Simpan
                </button>
              </div>

              <p className="text-xs text-gray-400">
                * Perubahan konfigurasi akan update file <code>.env.local</code> dan memerlukan restart server.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ===== MODAL USER ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editUser ? 'Edit User' : 'Tambah User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={userForm.nama}
                  onChange={e => setUserForm(p => ({ ...p, nama: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))}
                  disabled={!!editUser}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Password {editUser && <span className="text-gray-400">(kosongkan jika tidak diganti)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userForm.password}
                    onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Role</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Check size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}