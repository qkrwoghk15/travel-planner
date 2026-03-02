import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Papa from 'papaparse';
import { 
  MapPin, 
  Clock, 
  Euro, 
  ExternalLink, 
  Utensils,
  Train,
  Camera,
  Hotel,
  Info,
  Navigation,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  X,
  Globe,
  Map as MapIcon,
  Zap,
  Ticket,
  Link as LinkIcon,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Leaflet Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_MAP = { Food: '미식', Transport: '이동', Sightseeing: '관광', Accommodation: '숙박', Default: '기타' };
const CATEGORY_ICONS = {
  Food: <Utensils className="w-4 h-4" />,
  Transport: <Train className="w-4 h-4" />,
  Sightseeing: <Camera className="w-4 h-4" />,
  Accommodation: <Hotel className="w-4 h-4" />,
  Default: <Info className="w-4 h-4" />
};
const CATEGORY_COLORS = {
  Food: 'text-orange-600 bg-orange-50 border-orange-100 ring-orange-200',
  Transport: 'text-blue-600 bg-blue-50 border-blue-100 ring-blue-200',
  Sightseeing: 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-200',
  Accommodation: 'text-purple-600 bg-purple-50 border-purple-100 ring-purple-200',
  Default: 'text-slate-600 bg-slate-50 border-slate-100 ring-slate-200'
};
const PROGRESS_COLORS = { Food: 'bg-orange-400', Transport: 'bg-blue-400', Sightseeing: 'bg-emerald-400', Accommodation: 'bg-purple-400', Default: 'bg-slate-400' };

function MapController({ center, zoom, bounds, forceFly = false }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    
    if (bounds && bounds.length > 0) {
      if (forceFly) {
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 16, duration: 1.5 });
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    } else if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      if (forceFly) { 
        map.flyTo(center, zoom || 14, { duration: 1.5 }); 
      } else { 
        map.setView(center, zoom || 14); 
      }
    }
    
    const timer = setTimeout(() => map.invalidateSize(), 400);
    return () => clearTimeout(timer);
  }, [center, zoom, bounds, map, forceFly]);
  return null;
}

export default function App() {
  const [itinerary, setItinerary] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [mapConfig, setMapConfig] = useState({ center: [48.8566, 2.3522], zoom: 14, bounds: null, forceFly: false });
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [focusedEventIndex, setFocusedEventIndex] = useState(null);

  useEffect(() => {
    Papa.parse('/itinerary.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parsed Data:', results.data);
        const data = results.data.filter(row => row.Day && row.Activity);
        setItinerary(data);
        setLoading(false);
      },
      error: (err) => {
        console.error('CSV Parsing Error:', err);
        setLoading(false);
      }
    });
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    if (index < 0 || index >= allTripPoints.length) return;
    setSlideshowIndex(index);
    const point = allTripPoints[index];
    setMapConfig({ center: point.pos, zoom: 14, forceFly: true });
  };

  const handleNext = () => goToSlide(slideshowIndex + 1);
  const handlePrev = () => goToSlide(slideshowIndex - 1);

  const currentStatus = useMemo(() => {
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const activeEvent = itinerary.find(item => item.Date === todayStr && timeStr >= (item.StartTime || '') && timeStr < (item.EndTime || ''));
    const todayInfo = itinerary.find(item => item.Date === todayStr);
    return { isTripDay: !!todayInfo, currentDay: todayInfo ? Number(todayInfo.Day) : null, activeEvent, todayStr, timeStr };
  }, [itinerary, now]);

  useEffect(() => {
    if (currentStatus.currentDay && itinerary.length > 0) {
      setSelectedDay(currentStatus.currentDay);
    }
  }, [currentStatus.currentDay, itinerary.length]);

  const days = useMemo(() => {
    return [...new Set(itinerary.map(item => Number(item.Day)))].sort((a, b) => a - b);
  }, [itinerary]);

  const currentDayEvents = useMemo(() => {
    return itinerary.filter(item => Number(item.Day) === selectedDay)
      .sort((a, b) => (a.StartTime || '').localeCompare(b.StartTime || ''));
  }, [itinerary, selectedDay]);

  const stats = useMemo(() => {
    const categories = ['Food', 'Transport', 'Sightseeing', 'Accommodation'];
    const summary = categories.map(cat => ({
      name: cat,
      displayName: CATEGORY_MAP[cat],
      cost: itinerary.filter(item => item.Category === cat).reduce((sum, i) => sum + (Number(i.Cost) || 0), 0),
    }));
    const total = summary.reduce((sum, item) => sum + item.cost, 0);
    return { summary, total };
  }, [itinerary]);

  const dayCost = useMemo(() => currentDayEvents.reduce((sum, item) => sum + (Number(item.Cost) || 0), 0), [currentDayEvents]);

  const resetToDailyView = () => {
    setFocusedEventIndex(null);
    if (currentDayEvents.length > 0) {
      const points = currentDayEvents.filter(e => e.Lat && e.Lng).map(e => [e.Lat, e.Lng]);
      if (points.length > 1) {
        setMapConfig({ bounds: points, forceFly: true });
      } else if (points.length === 1) {
        setMapConfig({ center: points[0], zoom: 14, forceFly: true });
      }
    }
  };

  const handleFocusEvent = (event, idx) => {
    if (focusedEventIndex === idx) {
      resetToDailyView();
    } else {
      setFocusedEventIndex(idx);
      setMapConfig({ center: [event.Lat, event.Lng], zoom: 16, forceFly: true });
    }
  };

  useEffect(() => {
    resetToDailyView();
  }, [selectedDay, currentDayEvents]);

  const stayGroups = useMemo(() => {
    const groups = [];
    if (days.length === 0) return groups;

    let currentGroup = null;

    days.forEach(day => {
      const dayEvents = itinerary.filter(item => Number(item.Day) === day);
      const allPrevAccommodations = itinerary
        .filter(e => Number(e.Day) <= day && e.Category === 'Accommodation')
        .sort((a, b) => (Number(b.Day) - Number(a.Day)) || (b.StartTime || '').localeCompare(a.StartTime || ''));
      
      const acc = allPrevAccommodations[0]?.Activity
        .replace('[체크인]', '').replace('[공식 체크인]', '').replace('🏠', '').trim() || "기내/이동";
      const city = dayEvents[dayEvents.length - 1]?.Location?.split('(')[0].trim() || "N/A";

      if (!currentGroup || currentGroup.accommodation !== acc || currentGroup.city !== city) {
        currentGroup = {
          city,
          accommodation: acc,
          days: [day]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.days.push(day);
      }
    });
    return groups;
  }, [itinerary, days]);

  const dayPathPoints = useMemo(() => {
    return currentDayEvents.filter(e => e.Lat && e.Lng).map(e => [e.Lat, e.Lng]);
  }, [currentDayEvents]);

  const allTripPoints = useMemo(() => {
    return itinerary
      .filter(e => e.Lat && e.Lng)
      .sort((a, b) => (Number(a.Day) - Number(b.Day)) || (a.StartTime || '').localeCompare(b.StartTime || ''))
      .map(e => ({ pos: [e.Lat, e.Lng], day: Number(e.Day), activity: e.Activity, time: e.StartTime }));
  }, [itinerary]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-slate-500 font-medium font-sans tracking-widest">EuroGuide Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-md"><Navigation className="text-white w-4 h-4 fill-white/20" /></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none italic">EuroGuide Pro</h1>
              <p className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">{days.length} Days Journey</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[8px] text-slate-400 font-black uppercase">총 예산</p>
              <p className="text-sm font-black text-blue-600">€{stats.total.toLocaleString()}</p>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="text-right">
              <p className="text-[8px] text-slate-400 font-black uppercase">현재 진행</p>
              <p className="text-sm font-black text-slate-700">{selectedDay}일차</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentStatus.isTripDay && (
          <div className="mb-6">
            <div className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]" />
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Live Now - {currentStatus.timeStr}</p>
                  <h4 className="text-sm font-black tracking-tight">{currentStatus.activeEvent ? currentStatus.activeEvent.Activity : "자유 시간 및 휴식"}</h4>
                </div>
              </div>
              <button onClick={() => setSelectedDay(Number(currentStatus.currentDay))} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all">오늘 일정</button>
            </div>
          </div>
        )}

        {/* Unified Gantt-Style Journey Timeline */}
        <section className="mb-6 bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <CalendarDays className="w-3 h-3 text-blue-500" /> 여정 내비게이션
          </h3>
          <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pb-1">
            {stayGroups.map((group, gIdx) => {
              const isActiveGroup = group.days.includes(selectedDay);
              return (
                <div key={gIdx} className="flex-shrink-0 flex flex-col gap-2 min-w-[140px]">
                  <div className={cn(
                    "p-3 rounded-xl border transition-all",
                    isActiveGroup ? "bg-slate-900 border-slate-900 shadow-md" : "bg-slate-50 border-slate-100"
                  )}>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className={cn("w-2.5 h-2.5", isActiveGroup ? "text-blue-400" : "text-slate-400")} />
                      <span className={cn("text-[11px] font-black tracking-tight", isActiveGroup ? "text-white" : "text-slate-900")}>{group.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hotel className={cn("w-2.5 h-2.5", isActiveGroup ? "text-blue-400" : "text-slate-400")} />
                      <span className={cn("text-[9px] font-bold truncate w-24", isActiveGroup ? "text-slate-400" : "text-slate-500")}>{group.accommodation}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 px-0.5">
                    {group.days.map(day => (
                      <button 
                        key={day} 
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          "w-7 h-7 rounded-md text-[10px] font-black transition-all border flex items-center justify-center relative",
                          selectedDay === day 
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-105 z-10" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                        )}
                      >
                        {day}
                        {currentStatus.currentDay === day && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-end justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Daily Itinerary</h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{selectedDay}일차 일정 - {currentDayEvents[0]?.Date || '날짜 정보 없음'}</p>
                </div>
                <div className="flex gap-1.5 mb-1.5">
                  <button 
                    onClick={() => setSelectedDay(prev => Math.max(days[0], prev - 1))}
                    disabled={selectedDay === days[0]}
                    className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedDay(prev => Math.min(days[days.length - 1], prev + 1))}
                    disabled={selectedDay === days[days.length - 1]}
                    className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-md flex items-center gap-1.5"><Euro className="w-3 h-3" />지출: €{dayCost.toLocaleString()}</div>
            </div>

            <div className="space-y-2">
              {currentDayEvents.map((event, idx) => {
                const isLive = currentStatus.activeEvent?.Activity === event.Activity && Number(currentStatus.currentDay) === selectedDay;
                return (
                  <div key={idx} className="relative pl-9">
                    <button 
                      onClick={() => handleFocusEvent(event, idx)}
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-[#F8FAFC] z-10 flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer group", 
                        isLive ? "bg-red-500 scale-110 shadow-red-200" : (focusedEventIndex === idx ? "bg-blue-600 ring-2 ring-blue-200 shadow-md" : (CATEGORY_COLORS[event.Category]?.split(' ')[1] || 'bg-slate-100'))
                      )}
                      title="지도에서 위치 보기"
                    >
                      {isLive ? <Zap className="w-3.5 h-3.5 text-white fill-white" /> : (focusedEventIndex === idx ? <Navigation className="w-3.5 h-3.5 text-white fill-white/20" /> : (CATEGORY_ICONS[event.Category] || CATEGORY_ICONS.Default))}
                      <div className="absolute -right-1 -top-1 bg-slate-900 text-white text-[6px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{idx + 1}</div>
                    </button>
                    <div className={cn("bg-white p-3 rounded-2xl border transition-all duration-300 flex items-center gap-4", isLive ? "border-red-500 ring-2 ring-red-50 shadow-md" : "border-slate-200 shadow-sm hover:shadow-md")}>
                      {/* Time Section */}
                      <div className="min-w-[60px] flex flex-col items-center border-r border-slate-100 pr-4">
                        <span className={cn("font-black text-[13px] tracking-tighter", isLive ? "text-red-600" : "text-slate-900")}>{event.StartTime || '--:--'}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">~ {event.EndTime || '--:--'}</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {isLive && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black rounded-full animate-pulse uppercase tracking-widest">LIVE</span>}
                          <span className={cn("px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border", CATEGORY_COLORS[event.Category])}>{CATEGORY_MAP[event.Category] || '기타'}</span>
                          <h3 className="text-[13px] font-black text-slate-800 tracking-tight truncate">{event.Activity}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[9px] text-slate-400 font-black shrink-0"><MapPin className="w-2.5 h-2.5 text-red-400" />{event.Location}</span>
                          <p className="text-slate-500 text-[10px] font-medium truncate italic opacity-80">{event.Description}</p>
                        </div>
                      </div>

                      {/* Actions & Cost Section */}
                      <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-slate-50">
                        <div className="flex gap-1">
                          {event.MapLink && <a href={event.MapLink} target="_blank" rel="noopener noreferrer" title="Google Maps" className="p-1.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 rounded-lg transition-all"><MapIcon className="w-3 h-3" /></a>}
                          {event.BookingLink && <a href={event.BookingLink} target="_blank" rel="noopener noreferrer" title="Reservation" className="p-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-400 rounded-lg transition-all"><Ticket className="w-3 h-3" /></a>}
                          {event.OfficialLink && <a href={event.OfficialLink} target="_blank" rel="noopener noreferrer" title="Official Site" className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-400 rounded-lg transition-all"><Globe className="w-3 h-3" /></a>}
                        </div>
                        <div className="h-6 w-px bg-slate-100 mx-1" />
                        <div className="flex flex-col items-end min-w-[45px]">
                          <span className="text-xs font-black text-slate-900 tracking-tighter">€{(Number(event.Cost) || 0).toLocaleString()}</span>
                          <button onClick={() => handleFocusEvent(event, idx)} className={cn("text-[7px] font-black transition-colors uppercase tracking-widest mt-0.5", focusedEventIndex === idx ? "text-red-500" : "text-blue-500 hover:text-blue-700")}>{focusedEventIndex === idx ? "Reset" : "Locate"}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black flex items-center gap-2 text-slate-900 text-base"><MapIcon className="w-4 h-4 text-blue-600" />실시간 위치 가이드</h3>
                <button 
                  onClick={resetToDailyView}
                  className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all group"
                  title="하루 동선 한눈에 보기"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
                </button>
              </div>
              <div style={{ height: '350px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
                <MapContainer center={mapConfig.center} zoom={mapConfig.zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController center={mapConfig.center} zoom={mapConfig.zoom} bounds={mapConfig.bounds} forceFly={mapConfig.forceFly} />
                  {currentDayEvents.filter(e => e.Lat && e.Lng).map((event, i, arr) => {
                    const isLive = currentStatus.activeEvent?.Activity === event.Activity && Number(currentStatus.currentDay) === selectedDay;
                    // 중복 좌표 확인 및 미세 오프셋 적용 (겹침 방지)
                    let lat = event.Lat;
                    let lng = event.Lng;
                    const duplicates = arr.slice(0, i).filter(prev => prev.Lat === event.Lat && prev.Lng === event.Lng).length;
                    if (duplicates > 0) {
                      lat += duplicates * 0.0001;
                      lng += duplicates * 0.0001;
                    }

                    return (
                      <Marker key={i} position={[lat, lng]} icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black border border-white shadow-lg transition-all ${isLive ? 'bg-red-500 text-white scale-125 marker-pulse ring-2 ring-red-200' : 'bg-slate-900 text-white'}">${i + 1}</div>`,
                        iconSize: [24, 24], iconAnchor: [12, 12]
                      })}>
                        <Popup><div className="font-black text-xs p-1">{event.Activity}</div></Popup>
                      </Marker>
                    );
                  })}
                  {dayPathPoints.length > 1 && <Polyline positions={dayPathPoints} color="#2563eb" weight={3} opacity={0.5} dashArray="5, 10" />}
                </MapContainer>
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full p-5 bg-slate-900 rounded-2xl text-white shadow-lg hover:bg-slate-800 transition-all flex items-center justify-between group"
                >
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Open Grand Map</p>
                    <p className="text-xl font-black tracking-tighter">전체 여정 보기</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-20 overflow-hidden">
          <div className="bg-white w-full max-w-7xl h-full max-h-[85vh] rounded-[3.5rem] overflow-hidden flex flex-col relative shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 z-[2100] bg-slate-900 text-white p-5 rounded-full hover:bg-blue-600 transition-all shadow-2xl"><X className="w-6 h-6" /></button>
            <div className="p-12 border-b bg-white relative z-[2050] shrink-0">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{days.length}일 유럽 여행 그랜드 투어</h2>
              <p className="text-slate-500 font-medium mt-2">전체 이동 동선과 방문 도시를 한눈에 파악하세요.</p>
            </div>
            <div className="flex-grow w-full relative bg-slate-50">
              <MapContainer key="global-route-map" center={mapConfig.center} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController center={mapConfig.center} zoom={mapConfig.zoom} bounds={mapConfig.bounds} forceFly={mapConfig.forceFly} />
                {allTripPoints.map((pt, i) => (
                  <Marker key={i} position={pt.pos} eventHandlers={{ click: () => { setSelectedDay(Number(pt.day)); setMapConfig({ center: pt.pos, zoom: 14, forceFly: true }); setSlideshowIndex(i); }}} icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-4 border-white shadow-2xl transition-all cursor-pointer hover:scale-125 ${(slideshowIndex === i || (slideshowIndex === -1 && Number(currentStatus.currentDay) === Number(pt.day))) ? 'bg-red-500 text-white marker-pulse ring-4 ring-red-100' : 'bg-blue-600 text-white'}">${i + 1}</div>`,
                    iconSize: [40, 40], iconAnchor: [20, 20]
                  })}><Popup><div className="font-black p-2"><p className="text-xs text-blue-500 mb-1">Step {i + 1} | Day {pt.day} {pt.time}</p><p className="text-sm">{pt.activity}</p><button onClick={() => { setSelectedDay(Number(pt.day)); setIsModalOpen(false); }} className="mt-2 w-full bg-slate-900 text-white text-[10px] py-1 rounded-lg">타임라인 보기</button></div></Popup></Marker>
                ))}
                {allTripPoints.length > 1 && <Polyline positions={allTripPoints.map(pt => pt.pos)} color="#2563eb" weight={4} opacity={0.3} dashArray="10, 20" />}
              </MapContainer>

              {/* Slideshow Controls */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2050] bg-white/90 backdrop-blur-xl p-8 rounded-[3.5rem] shadow-2xl border border-slate-200 w-[95%] max-w-4xl">
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
                    <div className="flex gap-3">
                      <button onClick={handlePrev} disabled={slideshowIndex === 0} className="w-14 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                        <ChevronLeft className="w-8 h-8" />
                      </button>
                      <button onClick={handleNext} disabled={slideshowIndex === allTripPoints.length - 1} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200">
                        <ChevronRight className="w-8 h-8" />
                      </button>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">Step {slideshowIndex + 1}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day {allTripPoints[slideshowIndex]?.day} - {allTripPoints[slideshowIndex]?.time}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 tracking-widest">{slideshowIndex + 1} / {allTripPoints.length}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight truncate">{allTripPoints[slideshowIndex]?.activity}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                    {allTripPoints.map((_, i) => (
                      <button key={i} onClick={() => goToSlide(i)} className={cn("flex-shrink-0 w-10 h-10 rounded-xl text-xs font-black transition-all border", slideshowIndex === i ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600")}>{i + 1}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
