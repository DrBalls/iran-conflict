import { useEffect, useState } from 'react';
import { fetchIntelligenceReport, type IntelligenceReport } from './services/intelligence';
import ConflictMap from './components/Map';
import { Activity, AlertTriangle, RefreshCw, Shield, Target, Radio, Clock, Map as MapIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function App() {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setExpandedEventId(null);
    const data = await fetchIntelligenceReport();
    setReport(data);
    setLastRefreshed(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (level?: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const filteredEvents = report?.events?.filter(event => 
    filter === 'ALL' || event.type === filter
  ) || [];

  return (
    <div className="dashboard-grid">
      {/* Header */}
      <header className="col-span-3 bg-[#0a0a0a] border-b border-[#333] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="live-indicator"></div>
          <h1 className="font-mono text-lg tracking-widest text-white font-bold">
            IRAN CONFLICT MONITOR <span className="text-[#666] text-xs ml-2">v2.1.0</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6 text-xs font-mono text-[#888]">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{format(new Date(), 'HH:mm:ss')} UTC</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className={getAlertColor(report?.alertLevel)} />
            <span className={getAlertColor(report?.alertLevel)}>
              DEFCON: {report?.alertLevel || 'ANALYZING...'}
            </span>
          </div>
          <button 
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'SYNCING...' : 'REFRESH'}
          </button>
        </div>
      </header>

      {/* Left Panel: Events Feed */}
      <aside className="grid-panel border-r border-[#333] flex flex-col">
        <div className="panel-header flex-col items-start gap-2 !h-auto">
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2"><Activity size={14} /> INTELLIGENCE FEED</span>
            <span className="text-[10px] opacity-50">{filteredEvents.length} EVENTS</span>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-1 w-full pt-1">
            {['ALL', 'MILITARY', 'DIPLOMATIC', 'CIVIL', 'CYBER'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`text-[9px] px-2 py-1 rounded border transition-colors ${
                  filter === type 
                    ? 'bg-white text-black border-white font-bold' 
                    : 'bg-transparent text-[#666] border-[#333] hover:border-[#666] hover:text-[#888]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading && !report ? (
            <div className="p-4 text-xs font-mono text-[#666] animate-pulse">
              {'>'} ESTABLISHING SECURE CONNECTION...<br/>
              {'>'} DECRYPTING FEEDS...<br/>
              {'>'} ANALYZING SATELLITE DATA...
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                className={`p-4 border-b border-[#333] transition-colors cursor-pointer group ${
                  expandedEventId === event.id ? 'bg-[#1a1a1a]' : 'hover:bg-[#111]'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    event.type === 'MILITARY' ? 'bg-red-900/30 text-red-400' :
                    event.type === 'DIPLOMATIC' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {event.type}
                  </span>
                  <span className="text-[10px] font-mono text-[#666]">{event.timestamp.split(' ')[1] || event.timestamp}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-200 mb-1 leading-tight group-hover:text-white">
                  {event.title}
                </h3>
                <p className={`text-xs text-[#888] mb-2 ${expandedEventId === event.id ? '' : 'line-clamp-2'}`}>
                  {event.description}
                </p>
                
                {/* Expanded Details */}
                {expandedEventId === event.id && (
                  <div className="mt-3 pt-3 border-t border-[#333] animate-in fade-in slide-in-from-top-1 duration-200">
                    <h4 className="text-[10px] font-mono text-[#666] uppercase mb-1">Analysis</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {event.detailedAnalysis || "No detailed analysis available."}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[10px] text-[#666] font-mono mt-2">
                  <MapIcon size={10} />
                  {event.location.toUpperCase()}
                </div>
              </div>
            ))
          )}
          
          {!loading && filteredEvents.length === 0 && (
            <div className="p-8 text-center text-xs text-[#666] font-mono">
              NO EVENTS MATCHING FILTER
            </div>
          )}
        </div>
      </aside>

      {/* Center Panel: Map */}
      <main className="grid-panel relative bg-black">
        {/* Map Overlay Grid Lines for "Tech" feel */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10" 
             style={{
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}>
        </div>
        
        <ConflictMap events={filteredEvents} />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-t-red-500 border-r-transparent border-b-red-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-xs font-mono text-red-500 tracking-widest">UPDATING TACTICAL MAP</div>
            </div>
          </div>
        )}
      </main>

      {/* Right Panel: Summary & Stats */}
      <aside className="grid-panel border-l border-[#333] flex flex-col">
        <div className="panel-header">
          <span className="flex items-center gap-2"><Target size={14} /> SITUATION REPORT</span>
        </div>
        
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-xs font-mono text-[#666] mb-2 uppercase">Executive Summary</h2>
          <p className="text-sm leading-relaxed text-gray-300">
            {report?.summary || "Waiting for intelligence analysis..."}
          </p>
        </div>

        <div className="panel-header">
          <span className="flex items-center gap-2"><Radio size={14} /> KEY METRICS</span>
        </div>

        <div className="flex-1">
          {report?.stats?.map((stat, i) => (
            <div key={i} className="data-row">
              <div className="data-label">{stat.label}</div>
              <div className="flex items-center justify-between">
                <span className="data-value text-white">{stat.value}</span>
                <span className={`text-[10px] font-mono ${
                  stat.trend === 'UP' ? 'text-red-500' : 
                  stat.trend === 'DOWN' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {stat.trend === 'UP' ? '▲' : stat.trend === 'DOWN' ? '▼' : '−'}
                </span>
              </div>
            </div>
          ))}
          
          {!report?.stats.length && !loading && (
            <div className="p-4 text-xs text-[#666] font-mono">
              INSUFFICIENT DATA FOR METRICS
            </div>
          )}
        </div>

        <div className="p-4 bg-[#111] border-t border-[#333]">
          <div className="text-[10px] font-mono text-[#444] mb-1">LAST UPDATE</div>
          <div className="text-xs text-[#888]">
            {lastRefreshed ? format(lastRefreshed, 'yyyy-MM-dd HH:mm:ss') : '--'}
          </div>
        </div>
      </aside>
    </div>
  );
}
