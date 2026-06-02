'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home, FileText, Settings, LogOut, ChevronRight,
  CheckCircle, AlertCircle, XCircle, CalendarDays, X
} from 'lucide-react'
import ClassificationPie from '@/components/ClassificationPie'
import GrafanaChart from '@/components/GrafanaChart'

export default function DashboardPage() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('Dashboard')

  const [eggData, setEggData] = useState({
    grade_a: 0, grade_b: 0, grade_c: 0, tidak_layak: 0, total: 0
  })
  const [pieData, setPieData]       = useState<any[]>([])
  const [historyData, setHistoryData] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [loading, setLoading]       = useState(true)

  // ✅ State filter tanggal
  const [filterDate, setFilterDate] = useState('') // '' = hari ini

  // ===== FETCH DATA =====
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterDate) params.set('date', filterDate)
      // jika filterDate kosong → API default ke hari ini (WIB)

      const res  = await fetch(`/api/egg-data?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setEggData(data.current)
        setPieData(data.pieChart)
        setHistoryData(data.history)
        setLastUpdate(data.stats?.lastUpdate || '')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterDate])

  useEffect(() => {
    fetchData()

    // Auto-refresh tiap 5 detik HANYA saat tidak ada filter tanggal spesifik
    if (!filterDate) {
      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    }
  }, [fetchData, filterDate])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    router.push('/')
  }

  // Label tanggal aktif untuk ditampilkan di header
  const activeDateLabel = filterDate
    ? new Date(filterDate + 'T00:00:00').toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : 'Hari Ini'

  const stats = [
    { grade: 'A',          count: eggData.grade_a,     color: 'bg-green-600',  icon: CheckCircle },
    { grade: 'B',          count: eggData.grade_b,     color: 'bg-yellow-500', icon: AlertCircle },
    { grade: 'C',          count: eggData.grade_c,     color: 'bg-orange-500', icon: AlertCircle },
    { grade: 'Tidak Layak', count: eggData.tidak_layak, color: 'bg-red-600',    icon: XCircle     },
  ]

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Memuat data...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-700 to-slate-800 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8">Monitoring System</h2>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveMenu('Dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
              activeMenu === 'Dashboard' ? 'bg-blue-600' : 'hover:bg-slate-600'
            }`}
          >
            <Home size={20} /> Dashboard
          </button>

          <button
            onClick={() => router.push('/reporting')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600"
          >
            <FileText size={20} /> Reporting
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-600"
          >
            <span className="flex items-center gap-3">
              <Settings size={20} /> Settings
            </span>
            <ChevronRight size={16} />
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 mt-auto"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Monitoring Kualitas Telur</h1>
            {/* Label tanggal aktif */}
            <p className="text-sm text-gray-500 mt-1">
              Menampilkan data: <span className="font-semibold text-gray-700">{activeDateLabel}</span>
              {!filterDate && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Live • refresh 5s
                </span>
              )}
            </p>
          </div>

          {/* ✅ Date picker + reset */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <CalendarDays size={16} className="text-gray-400" />
              <input
                type="date"
                value={filterDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setFilterDate(e.target.value)}
                className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
              />
            </div>

            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="flex items-center gap-1 text-sm text-gray-500 border border-gray-300 bg-white rounded-lg px-3 py-2 hover:bg-gray-50 shadow-sm"
              >
                <X size={14} /> Hari Ini
              </button>
            )}

            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Update: {new Date(lastUpdate).toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>
        </div>

        {/* Grade Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className={`${s.color} text-white p-6 rounded-xl shadow`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} />
                  <span className="font-medium">Grade {s.grade}</span>
                </div>
                <div className="text-3xl font-bold">{s.count}</div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl mb-8 shadow">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: 'Grade A',     value: eggData.grade_a },
              { label: 'Grade B',     value: eggData.grade_b },
              { label: 'Grade C',     value: eggData.grade_c },
              { label: 'Tidak Layak', value: eggData.tidak_layak },
              { label: 'Total',       value: eggData.total },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="text-xl font-bold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold mb-4">Klasifikasi Telur</h2>
            <ClassificationPie data={pieData} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold mb-4">
              Grafik Telur ({filterDate ? activeDateLabel : '12 Jam Terakhir'})
            </h2>
            <GrafanaChart data={historyData} />
          </div>
        </div>

      </main>
    </div>
  )
}