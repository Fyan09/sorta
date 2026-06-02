'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home, FileText, Settings, LogOut, ChevronRight,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  Download
} from 'lucide-react'

interface EggRow {
  id: number
  created_at: string
  berat: number
  grade: 'A' | 'B' | 'C' | 'TL'
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const GRADE_STYLE: Record<string, string> = {
  A: 'bg-green-100 text-green-700 border border-green-300',
  B: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  C: 'bg-orange-100 text-orange-700 border border-orange-300',
  TL: 'bg-red-100 text-red-700 border border-red-300',
}

const GRADE_LABEL: Record<string, string> = {
  A: 'Grade A',
  B: 'Grade B',
  C: 'Grade C',
  TL: 'Tidak Layak',
}

// Bulatkan max 2 desimal, hapus trailing zero (61.10 → 61.1, 55.95 → 55.95)
const formatBerat = (berat: number) => {
  if (berat == null) return '-'
  return parseFloat(berat.toFixed(2)).toString()
}

export default function ReportingPage() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('Reporting')

  const [rows, setRows] = useState<EggRow[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0, page: 1, limit: 20, totalPages: 1
  })
  const [loading, setLoading] = useState(true)

  // Filter state
  const [filterGrade, setFilterGrade] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (filterGrade) params.set('grade', filterGrade)
      if (filterDate) params.set('date', filterDate)

      const res = await fetch(`/api/reporting?${params.toString()}`)
      const json = await res.json()

      if (json.success) {
        setRows(json.data)
        setPagination(json.pagination)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage, filterGrade, filterDate])

  const handleLogout = () => router.push('/login')

  const formatWaktu = (waktu: string) => {
    const d = new Date(waktu)
    const tanggal = d.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
    const jam = d.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
    return { tanggal, jam }
  }

  // Export CSV — fetch semua data sesuai filter aktif
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', pagination.total > 0 ? String(pagination.total) : '99999')
      if (filterGrade) params.set('grade', filterGrade)
      if (filterDate) params.set('date', filterDate)

      const res = await fetch(`/api/reporting?${params.toString()}`)
      const json = await res.json()

      if (!json.success) return

      const allRows: EggRow[] = json.data
      const header = 'ID,Tanggal,Jam,Berat (g),Grade\n'
      const csvRows = allRows.map((r, i) => {
        const { tanggal, jam } = formatWaktu(r.created_at)
        return `${i + 1},${tanggal},${jam},${formatBerat(r.berat)},${GRADE_LABEL[r.grade] || r.grade}`
      }).join('\n')

      const blob = new Blob([header + csvRows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-telur-${filterDate || 'semua'}${filterGrade ? `-grade${filterGrade}` : ''}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export gagal:', err)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-700 to-slate-800 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8">Monitoring System</h2>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600"
          >
            <Home size={20} /> Dashboard
          </button>

          <button
            onClick={() => setActiveMenu('Reporting')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
              activeMenu === 'Reporting' ? 'bg-blue-600' : 'hover:bg-slate-600'
            }`}
          >
            <FileText size={20} /> Reporting
          </button>

          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-600">
            <div className="flex items-center gap-3">
              <Settings size={20} /> Settings
            </div>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Laporan Klasifikasi Telur</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Filter Tanggal</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => { setFilterDate(e.target.value); setCurrentPage(1) }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Filter Grade</label>
            <select
              value={filterGrade}
              onChange={e => { setFilterGrade(e.target.value); setCurrentPage(1) }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Grade</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="TL">Tidak Layak</option>
            </select>
          </div>
          <button
            onClick={() => { setFilterGrade(''); setFilterDate(''); setCurrentPage(1) }}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset Filter
          </button>
          <div className="ml-auto text-sm text-gray-500 self-center">
            Total: <span className="font-bold text-gray-800">{pagination.total}</span> data
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left w-12">No</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Jam</th>
                <th className="px-4 py-3 text-left">Berat (g)</th>
                <th className="px-4 py-3 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const { tanggal, jam } = formatWaktu(row.created_at)
                  const rowNum = (pagination.page - 1) * pagination.limit + i + 1
                  return (
                    <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-500">{rowNum}</td>
                      <td className="px-4 py-3 text-gray-700">{tanggal}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{jam}</td>
                      <td className="px-4 py-3 text-gray-700">{formatBerat(row.berat)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${GRADE_STYLE[row.grade] || ''}`}>
                          {GRADE_LABEL[row.grade] || row.grade}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}