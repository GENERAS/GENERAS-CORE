import React, { useEffect, useState, lazy, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import CommentsSection from '../components/comments/CommentsSection'
import Loader from '../components/common/Loader'

// Inline SVG icons
const IconTrendingUp = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const IconDollar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconPercent = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const IconTrophy = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const IconSkull = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const IconChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const IconLightbulb = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const IconWarning = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const IconBookOpen = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

// Lazy load heavy recharts only when needed
const MonthlyPnLChart = lazy(() => import('../components/trading/MonthlyPnLChart'))

const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}

export default function TradingPage() {
  useScrollToTop()
  
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllTrades, setShowAllTrades] = useState(false)
  const [expandedTrade, setExpandedTrade] = useState(null)
  const [stats, setStats] = useState({
    totalPnL: 0,
    winRate: 0,
    winningTrades: 0,
    losingTrades: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0
  })
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    loadTrades()
    
    const channel = supabase
      .channel('trading-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trades' },
        () => loadTrades()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadTrades = async () => {
    try {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false })
      
      setTrades(data || [])
      calculateStats(data || [])
      prepareChartData(data || [])
    } catch (error) {
      console.error('Error loading trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tradesData) => {
    const totalPnL = tradesData.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
    const winningTradesList = tradesData.filter(t => t.profit_loss > 0)
    const losingTradesList = tradesData.filter(t => t.profit_loss < 0)
    const winningTrades = winningTradesList.length
    const losingTrades = losingTradesList.length
    const winRate = tradesData.length > 0 ? (winningTrades / tradesData.length) * 100 : 0
    const bestTrade = Math.max(...tradesData.map(t => t.profit_loss || 0), 0)
    const worstTrade = Math.min(...tradesData.map(t => t.profit_loss || 0), 0)
    
    const totalWins = winningTradesList.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
    const totalLosses = Math.abs(losingTradesList.reduce((sum, t) => sum + (t.profit_loss || 0), 0))
    const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0
    const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? totalWins : 0

    setStats({
      totalPnL,
      winRate: winRate.toFixed(1),
      winningTrades,
      losingTrades,
      bestTrade,
      worstTrade,
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      profitFactor: profitFactor.toFixed(2)
    })
  }

  const prepareChartData = (tradesData) => {
    const monthlyData = {}
    tradesData.forEach(trade => {
      const date = new Date(trade.trade_date)
      const month = date.toLocaleString('default', { month: 'short' })
      monthlyData[month] = (monthlyData[month] || 0) + (trade.profit_loss || 0)
    })
    
    setChartData(Object.entries(monthlyData).map(([month, pnl]) => ({ month, pnl })))
  }

  const toggleExpand = (tradeId) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  if (loading) {
    return <Loader />
  }

  const displayTrades = showAllTrades ? trades : trades.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[yellow-600] rounded-xl flex items-center justify-center">
                <IconTrendingUp className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">
                  Trading Journal
                </h1>
                <p className="text-xs text-gray-600">{trades.length} trades</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <IconDollar className="text-yellow-600" />
                <span className="text-gray-600">P&L:</span>
                <span className={`font-semibold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.totalPnL)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconPercent className="text-yellow-600" />
                <span className="text-gray-600">Win Rate:</span>
                <span className="font-semibold text-gray-800">{stats.winRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Sticky Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Main Navigation */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Overview
                </h3>
                <nav className="space-y-1">
                  {[
                    { id: 'all', icon: IconTrendingUp, label: 'All Trades', count: trades.length },
                    { id: 'winning', icon: IconTrophy, label: 'Winning', count: stats.winningTrades },
                    { id: 'losing', icon: IconSkull, label: 'Losing', count: stats.losingTrades },
                  ].map(item => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 text-gray-600 hover:bg-gray-100"
                    >
                      <item.icon />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Best Trade</span>
                    <span className={`font-semibold ${stats.bestTrade >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.bestTrade)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Worst Trade</span>
                    <span className={`font-semibold ${stats.worstTrade >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.worstTrade)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Win</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stats.avgWin)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Loss</span>
                    <span className="font-semibold text-red-600">{formatCurrency(stats.avgLoss)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* HERO SECTION */}
            <div className="bg-white rounded-3xl p-6 border border-gray-300">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img 
                      src="/owner-photo.jpg" 
                      alt="Generas Kagiraneza" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect fill='%23fbbf24' width='160' height='160'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%231f2937'%3EPhoto%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800">Stop Losing. Start Winning.</h2>
                  <p className="text-gray-600">
                    Real trading results. Real strategies. No fluff. Learn what actually works in the markets.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Learn From Me */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-yellow-400 transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
                  <IconTrophy className="text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-800">Proven Results</h3>
                <p className="text-sm text-gray-600">
                  Not theory. These are my actual trades with real money. See my win rate, profit factor, and monthly performance.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-yellow-400 transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
                  <IconLightbulb className="text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-800">Stop Bad Strategies</h3>
                <p className="text-sm text-gray-600">
                  Tired of courses that don't work? Learn from someone who's been there. Cut your learning curve in half.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-yellow-400 transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
                  <IconBookOpen className="text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-800">1-on-1 Mentorship</h3>
                <p className="text-sm text-gray-600">
                  Get personalized guidance. Ask questions. Review your trades. Build a strategy that fits YOUR style.
                </p>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-300">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800">
                  <span className="text-yellow-600"><IconTrendingUp /></span>
                  Monthly Performance
                </h2>
                <div className="h-64">
                  <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-400">Loading...</div>}>
                    <MonthlyPnLChart data={chartData} formatCurrency={formatCurrency} />
                  </Suspense>
                </div>
              </div>
            )}

            {/* Recent Trades - Compact */}
            <section id="trades-section" className="bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Recent Trades</h2>
                  <p className="text-xs text-gray-600">
                    {stats.winningTrades} wins / {stats.losingTrades} losses • Click to view comments
                  </p>
                </div>
                {trades.length > 5 && (
                  <button
                    onClick={() => setShowAllTrades(!showAllTrades)}
                    className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
                  >
                    {showAllTrades ? 'Show Less' : `View All (${trades.length})`}
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left rounded-tl-lg text-gray-700">Date</th>
                      <th className="px-3 py-2 text-left text-gray-700">Pair</th>
                      <th className="px-3 py-2 text-right text-gray-700">P&L</th>
                      <th className="px-3 py-2 text-left text-gray-700">Strategy</th>
                      <th className="px-3 py-2 text-center rounded-tr-lg text-gray-700"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayTrades.map(trade => (
                      <React.Fragment key={trade.id}>
                        <tr 
                          className="border-t border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors text-xs"
                          onClick={() => toggleExpand(trade.id)}
                        >
                          <td className="px-3 py-2 font-mono text-gray-600">
                            {new Date(trade.trade_date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 font-mono font-medium text-gray-800">{trade.pair}</td>
                          <td className={`px-3 py-2 text-right font-bold ${trade.profit_loss >= 0 ? 'text-yellow-600' : 'text-yellow-600'}`}>
                            {formatCurrency(trade.profit_loss)}
                          </td>
                          <td className="px-3 py-2">
                            {trade.strategy ? (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">{trade.strategy}</span>
                            ) : '-'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {expandedTrade === trade.id ? (
                              <span className="text-yellow-600"><IconChevronUp /></span>
                            ) : (
                              <span className="text-gray-500"><IconChevronDown /></span>
                            )}
                          </td>
                        </tr>
                        {expandedTrade === trade.id && (
                          <tr className="bg-gray-50">
                            <td colSpan="5" className="px-3 py-3">
                              <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                                <div>
                                  <span className="text-gray-600">Entry:</span>
                                  <span className="ml-2 font-mono text-gray-800">{formatCurrency(trade.entry_price)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Exit:</span>
                                  <span className="ml-2 font-mono text-gray-800">{formatCurrency(trade.exit_price)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Platform:</span>
                                  <span className="ml-2 text-gray-800">{trade.platform}</span>
                                </div>
                              </div>
                              <CommentsSection contentType="trade" contentId={trade.id} compact />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {trades.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  <p>No trades recorded yet.</p>
                </div>
              )}
            </section>

            {/* Key Lessons */}
            <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-200 flex items-center justify-center shrink-0">
                  <IconWarning className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-800">What I've Learned</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5"><IconCheck /></span>
                      <span>Risk management is more important than profits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5"><IconCheck /></span>
                      <span>A simple strategy executed well beats complex systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5"><IconCheck /></span>
                      <span>Psychology matters more than technical analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5"><IconCheck /></span>
                      <span>Consistency beats occasional big wins</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-300">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Ready to Level Up Your Trading?</h2>
              <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">
                Stop wasting time on strategies that don't work. Get mentored by someone with real market experience.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link 
                  to="/service"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors duration-200"
                >
                  Start Mentorship <IconArrowRight />
                </Link>
                <a 
                  href="https://wa.me/250789123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors duration-200"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Stats */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconDollar className="text-yellow-600" />
                  </div>
                  <p className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.totalPnL)}</p>
                  <p className="text-xs text-gray-600">Total P&L</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconPercent className="text-yellow-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{stats.winRate}%</p>
                  <p className="text-xs text-gray-600">Win Rate</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconTrophy className="text-yellow-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{stats.winningTrades}</p>
                  <p className="text-xs text-gray-600">Wins</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconSkull className="text-yellow-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{stats.losingTrades}</p>
                  <p className="text-xs text-gray-600">Losses</p>
                </div>
              </div>

              {/* Profit Factor */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Profit Factor
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{stats.profitFactor}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.profitFactor >= 2 ? 'Excellent' : stats.profitFactor >= 1.5 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}