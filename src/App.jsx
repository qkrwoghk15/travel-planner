import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Papa from 'papaparse';
import { MapPin, Euro, Utensils, Train, Camera, Hotel, Info, Navigation, CalendarDays, ArrowRight, X, Globe, Map as MapIcon, RotateCcw, ChevronLeft, ChevronRight, ShieldCheck, Coins, Lightbulb, Waves, Star, ShoppingBag, Coffee, Search, Heart, Sparkles, MessageSquare, Compass, Calendar, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const CATEGORY_MAP = { Food: '미식', Transport: '이동', Sightseeing: '관광', Accommodation: '숙박', Shopping: '쇼핑', Cafe: '카페', Default: '기타' };
const CATEGORY_ICONS = { Food: <Utensils className="w-4 h-4" />, Transport: <Train className="w-4 h-4" />, Sightseeing: <Camera className="w-4 h-4" />, Accommodation: <Hotel className="w-4 h-4" />, Shopping: <ShoppingBag className="w-4 h-4" />, Cafe: <Coffee className="w-4 h-4" />, Default: <Info className="w-4 h-4" /> };
const CATEGORY_COLORS = { Food: 'text-orange-600 bg-orange-50 border-orange-100', Transport: 'text-blue-600 bg-blue-50 border-blue-100', Sightseeing: 'text-emerald-600 bg-emerald-50 border-emerald-100', Accommodation: 'text-purple-600 bg-purple-50 border-purple-100', Shopping: 'text-pink-600 bg-pink-50 border-pink-100', Cafe: 'text-amber-600 bg-amber-50 border-amber-100', Default: 'text-slate-600 bg-slate-50 border-slate-100' };
const CITY_COLORS = { Paris: 'bg-indigo-500', Lyon: 'bg-rose-500', Interlaken: 'bg-emerald-500', Munich: 'bg-amber-600', Prague: 'bg-orange-500', Venice: 'bg-cyan-500', Florence: 'bg-violet-500', Rome: 'bg-blue-600', Incheon: 'bg-slate-400', Default: 'bg-slate-500' };

const CITY_NAME_MAP = {
  Paris: "파리 (Paris)", Lyon: "리옹 (Lyon)", Interlaken: "인터라켄 (Interlaken)",
  Munich: "뮌헨 (Munich)", Prague: "프라하 (Prague)", Vienna: "빈 (Vienna)",
  Venice: "베네치아 (Venice)", Florence: "피렌체 (Florence)", Rome: "로마 (Rome)",
  Incheon: "인천 (Incheon)", "Night Train": "야간열차 (Night Train)"
};

const CITY_WISDOM = {
  Paris: { safety: "7구/15구 안전. 소매치기 주의.", money: "나비고 주간권 추천.", culture: "Bonjour 인사는 필수.", utilities: "식수대 활용.", prep: "나비고 사진 필수 지참." },
  Lyon: { safety: "프레스킬 지구 안전.", money: "부숑 카드 가능.", culture: "식사 시간이 김.", utilities: "자전거 팁 활용.", prep: "Velo'v 앱 미리 설치." },
  Interlaken: { safety: "치안 우수.", money: "할인권 필수 확인.", culture: "일요일 상점 휴무.", utilities: "화장실 유료.", prep: "융프라우 웹캠 확인." },
  Munich: { safety: "매우 안전.", money: "비어가든 현금.", culture: "Prost! 건배.", utilities: "판트 제도.", prep: "기차 앱 설치." },
  Prague: { safety: "소매치기 주의.", money: "코루나 사용.", culture: "맥주가 저렴.", utilities: "트램 펀칭 필수.", prep: "Bolt 앱 설치." },
  Venice: { safety: "광장 소매치기 주의.", money: "바포레토 선구매.", culture: "치케티 문화.", utilities: "전망대 추천.", prep: "도시 입장료 확인." },
  Florence: { safety: "흥정 필수.", money: "사전 예약 필수.", culture: "스테이크 미디엄 레어.", utilities: "카페 화장실.", prep: "우피치 월요일 휴관." },
  Rome: { safety: "소매치기 극심.", money: "화장실용 동전.", culture: "식수대 활용.", utilities: "예약 60일 전.", prep: "바티칸 예약 필수." }
};

const getDayInfo = (dayNumber) => {
  const startDate = new Date('2026-05-18');
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + (dayNumber - 1));
  const dayOfWeek = targetDate.getDay(); // 0: Sun, 6: Sat
  return {
    dayName: ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek],
    isSat: dayOfWeek === 6,
    isSun: dayOfWeek === 0
  };
};

function MapController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (bounds?.length > 0) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    else if (center && !isNaN(center[0])) map.setView(center, zoom || 14);
    setTimeout(() => map.invalidateSize(), 400);
  }, [center, zoom, bounds, map]);
  return null;
}

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50 text-left text-slate-900">
          <h2 className="text-xl font-black tracking-tighter uppercase italic">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 no-scrollbar text-left text-slate-900">{children}</div>
      </div>
    </div>, document.body
  );
}

export default function App() {
  const [itinerary, setItinerary] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cityEssentials, setCityEssentials] = useState({});
  const [isEssentialsOpen, setIsEssentialsOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isGlobalMapOpen, setIsGlobalMapOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({ center: [48.8566, 2.3522], zoom: 14, bounds: null });
  const [focusedEventIndex, setFocusedEventIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/itinerary/summary.json').then(res => res.json()).then(data => { setSummary(data); setLoading(false); });
    fetch('/itinerary/places.json').then(res => res.json()).then(data => setCityEssentials(data));
  }, []);

  useEffect(() => {
    if (!summary) return;
    setItinerary([]);
    Papa.parse(`/itinerary/day${selectedDay}.csv`, {
      download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
      complete: (res) => setItinerary(res.data.filter(row => row.Activity))
    });
  }, [selectedDay, summary]);

  const dayInfo = useMemo(() => {
    if (!summary) return { city: "", flow: "" };
    let cur = "", prev = "";
    summary.stay_groups.forEach(g => { if (g.days.includes(selectedDay)) cur = g.city; });
    if (selectedDay > 1) summary.stay_groups.forEach(g => { if (g.days.includes(selectedDay-1)) prev = g.city; });
    else prev = "Incheon";
    const curKo = CITY_NAME_MAP[cur] || cur;
    const prevKo = CITY_NAME_MAP[prev] || prev;
    return { city: cur, flow: prev !== cur ? `${prevKo} ➔ ${curKo}` : curKo };
  }, [summary, selectedDay]);

  const currentCityWisdom = useMemo(() => CITY_WISDOM[dayInfo.city] || null, [dayInfo.city]);
  const sortedItinerary = useMemo(() => [...itinerary].sort((a,b)=>(a.StartTime||'').localeCompare(b.StartTime||'')), [itinerary]);
  const filteredEssentials = useMemo(() => (cityEssentials[dayInfo.city] || []).filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())), [cityEssentials, dayInfo.city, searchTerm]);

  useEffect(() => {
    const pts = itinerary.filter(e => e.Lat && !isNaN(e.Lat)).map(e => [e.Lat, e.Lng]);
    if (pts.length > 1) setMapConfig({ center: pts[0], zoom: 14, bounds: pts });
    else if (pts.length === 1) setMapConfig({ center: pts[0], zoom: 14, bounds: null });
  }, [itinerary]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 text-2xl animate-pulse tracking-[0.5em]">L O A D I N G . . .</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 text-left text-slate-900">
      <header className="bg-white border-b sticky top-0 z-[1000] px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 text-left">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-xl"><Globe className="text-white w-6 h-6 animate-spin-slow" /></div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">유럽 미식 대장정</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">19 Days Grand Journey 2026</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">총 여행 예산</p>
          <div className="flex items-center gap-2 justify-end text-slate-900 font-black text-2xl tracking-tighter leading-none"><Euro className="w-5 h-5 text-blue-600" /> €{summary?.total_cost?.toLocaleString()}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10 text-left">
        <section className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3 text-left"><Compass className="w-5 h-5 text-blue-600" /> 여정 진행 경로 (Journey Progression)</h3>
          <div className="flex gap-6 overflow-x-auto no-scrollbar text-left pb-4">
            {summary?.stay_groups.map((group, groupIdx) => {
              const cityKoEn = CITY_NAME_MAP[group.city] || group.city;
              const color = CITY_COLORS[group.city] || CITY_COLORS.Default;
              const isGroupActive = group.days.includes(selectedDay);

              return (
                <div key={groupIdx} className="flex flex-col gap-3 min-w-fit">
                  <div className={cn(
                    "px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter text-center whitespace-nowrap transition-all",
                    isGroupActive ? "bg-slate-900 border-slate-900 text-white shadow-lg scale-105" : "bg-slate-50 border-slate-100 text-slate-400"
                  )}>
                    {cityKoEn}
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    {group.days.map(day => {
                      const { isSat, isSun } = getDayInfo(day);
                      return (
                        <button 
                          key={day} 
                          onClick={() => setSelectedDay(day)} 
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 font-black text-sm relative",
                            selectedDay === day 
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-110 z-10" 
                              : isSat 
                                ? "bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-300" 
                                : isSun 
                                  ? "bg-red-50 border-red-200 text-red-600 hover:border-red-300" 
                                  : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                          )}
                        >
                          {day}
                          <div className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0", selectedDay === day && "opacity-100 bg-white")} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="bg-slate-900 text-white p-8 rounded-[3.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-left">
              <Sparkles className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
              <div className="text-left flex-grow">
                <h2 className="text-3xl font-black tracking-tighter italic uppercase flex flex-wrap items-center gap-4 text-left">
                  {selectedDay}일차 일정 <div className="h-8 w-px bg-white/20 hidden sm:block" /> <span className="text-blue-400 text-xl">{dayInfo.flow}</span>
                </h2>
                <div className="flex items-center gap-4 mt-3 text-left">
                  <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2 text-[11px] font-black text-left">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {itinerary[0]?.Date} ({getDayInfo(selectedDay).dayName})
                  </div>
                  <div className="bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-2 text-[11px] font-black text-emerald-400 uppercase text-left leading-none"><Euro className="w-3.5 h-3.5 text-emerald-400" /> 일일 지출: €{itinerary.reduce((s,e)=>s+(Number(e.Cost)||0),0)}</div>
                </div>
              </div>
              <div className="flex gap-3 z-10 shrink-0">
                <button onClick={() => setIsTipsOpen(true)} className="flex flex-col items-center gap-2 group"><div className="bg-amber-400 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-all shadow-amber-900/20"><Lightbulb className="w-6 h-6 text-slate-900" /></div><span className="text-[9px] font-black uppercase text-white tracking-widest">Tips</span></button>
                <button onClick={() => setIsEssentialsOpen(true)} className="flex flex-col items-center gap-2 group"><div className="bg-blue-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-all shadow-blue-900/20"><Compass className="w-6 h-6 text-white" /></div><span className="text-[9px] font-black uppercase text-white tracking-widest">Must-Go</span></button>
              </div>
            </div>

            <div className="space-y-4 text-left">
              {sortedItinerary.map((e, i) => (
                <div key={i} className="relative pl-12 group text-left">
                  <div className="absolute left-[1.375rem] top-0 bottom-0 w-0.5 bg-slate-200 group-last:bg-gradient-to-b group-last:from-slate-200 group-last:to-transparent" />
                  <button onClick={() => { setFocusedEventIndex(i); setMapConfig({ center: [e.Lat, e.Lng], zoom: 16 }); }} className={cn("absolute left-0 top-8 w-11 h-11 rounded-[1.25rem] border-4 border-[#F8FAFC] z-10 flex items-center justify-center shadow-md transition-all hover:scale-110", focusedEventIndex === i ? "bg-slate-900 text-white rotate-12 scale-110 shadow-lg" : (CATEGORY_COLORS[e.Category]?.split(' ')[1] || 'bg-slate-100'))}>{CATEGORY_ICONS[e.Category] || CATEGORY_ICONS.Default}</button>
                  <div className={cn("bg-white p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col gap-5 text-left shadow-sm", focusedEventIndex === i ? "border-slate-900 shadow-2xl -translate-y-1" : "border-slate-200")}>
                    <div className="flex items-start justify-between text-left">
                      <div className="flex gap-5 text-left">
                        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-w-[85px] shadow-inner text-slate-900 font-black text-left"><span className="text-sm">{e.StartTime}</span><span className="text-[9px] text-slate-400 mt-1 uppercase text-center leading-none">~{e.EndTime}</span></div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-2 text-left text-slate-900"><span className={cn("text-[8px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm", CATEGORY_COLORS[e.Category])}>{CATEGORY_MAP[e.Category]}</span><h4 className="text-base font-black text-left">{e.Activity}</h4></div>
                          <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 text-left"><p className="flex items-center gap-1.5 text-red-500 shrink-0 text-left"><MapPin className="w-3.5 h-3.5" />{e.Location}</p><div className="h-3 w-px bg-slate-200" /><p className="text-blue-600 font-black">€{Number(e.Cost).toLocaleString()}</p></div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {e.MapLink && <a href={e.MapLink} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-100 shadow-sm"><MapIcon className="w-5 h-5" /></a>}
                        {e.OfficialLink && <a href={e.OfficialLink} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all border border-slate-100 shadow-sm"><Globe className="w-5 h-5" /></a>}
                      </div>
                    </div>
                    <div className="bg-slate-50/80 p-5 rounded-[1.75rem] border border-slate-100 relative text-left">
                      <MessageSquare className="absolute -right-2 -top-2 w-8 h-8 text-blue-100 rotate-12" />
                      <p className="text-xs font-bold text-slate-600 italic opacity-95 text-left leading-relaxed">"{e.Description}"</p>
                      {e.Transit && <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-4 text-left"><div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg"><Navigation className="w-4 h-4 rotate-45 fill-white" /></div><div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">교통 안내 (Transit)</p><p className="text-[11px] font-black text-blue-700 text-left leading-none">{e.Transit}</p></div></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 sticky top-28 space-y-8 text-left">
            <div className="bg-white p-6 rounded-[3.5rem] border border-slate-200 shadow-lg relative overflow-hidden text-left text-slate-900">
              <div className="flex items-center justify-between mb-6 text-left"><h3 className="text-base font-black uppercase italic flex items-center gap-3 text-left"><Navigation className="w-5 h-5 text-blue-600" /> 실시간 위치 추적</h3><button onClick={() => setIsGlobalMapOpen(true)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-inner"><Globe className="w-5 h-5" /></button></div>
              <div style={{ height: '400px', borderRadius: '2.5rem', overflow: 'hidden', border: '8px solid #F8FAFC' }}>
                <MapContainer center={mapConfig.center} zoom={mapConfig.zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapController center={mapConfig.center} zoom={mapConfig.zoom} bounds={mapConfig.bounds} />
                  {itinerary.filter(e=>e.Lat && !isNaN(e.Lat)).map((e, i)=>(<Marker key={i} position={[e.Lat, e.Lng]} icon={L.divIcon({ className: '', html: `<div class="w-8 h-8 bg-slate-900 border-4 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-2xl">${i+1}</div>` })}><Popup><span className="font-black text-xs text-slate-900">{e.Activity}</span></Popup></Marker>))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={isEssentialsOpen} onClose={() => setIsEssentialsOpen(false)} title={`⭐ ${CITY_NAME_MAP[dayInfo.city] || dayInfo.city} 필수 방문 리스트`}>
        <div className="relative mb-8 text-left text-slate-900"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="맛집, 명소 검색..." className="w-full bg-slate-100 border-none rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-black focus:ring-4 focus:ring-blue-100 text-left shadow-inner" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} /></div>
        <div className="space-y-6 text-left text-slate-900">
          {filteredEssentials.map((item, i)=>(
            <div key={i} className="bg-slate-50 p-6 rounded-[2.5rem] border group hover:shadow-xl relative transition-all duration-300 text-left">
              <div className="flex justify-between items-start mb-4 text-left">
                <div className="text-left"><div className="flex items-center gap-3 mb-1.5 text-slate-900 font-black text-lg italic text-left">{item.name}{item.isMust && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}</div><p className="text-[11px] text-slate-500 font-black uppercase text-left tracking-widest">{item.desc}</p></div>
                <div className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic shadow-lg shrink-0">Rank #{item.rank}</div>
              </div>
              <div className="bg-white/80 p-5 rounded-[1.75rem] border flex gap-4 text-slate-700 font-bold italic text-[13px] shadow-inner text-left"><MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-1" />"{item.review}"</div>
              <div className="flex items-center justify-between mt-6 text-left"><span className="text-[9px] font-black uppercase px-3 py-1 rounded-lg border bg-orange-100 text-orange-700 shadow-sm">{item.type}</span><a href={item.links.maps} target="_blank" rel="noreferrer" className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg leading-none">지도 보기 <ArrowRight className="w-3.5 h-3.5" /></a></div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} title={`💡 ${CITY_NAME_MAP[dayInfo.city] || dayInfo.city} 마스터 팁`}>
        {currentCityWisdom && <div className="space-y-8 text-left text-slate-900">
          <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-100 shadow-xl text-left"><h4 className="text-sm font-black text-amber-900 uppercase mb-4 flex items-center gap-3 text-left"><Zap className="w-5 h-5 fill-amber-500 text-amber-500" /> 사전 준비 (Prep)</h4><p className="text-sm font-bold text-amber-800 text-left leading-relaxed">{currentCityWisdom.prep}</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[ { icon: <ShieldCheck className="text-emerald-500" />, label: "치안 및 안전", content: currentCityWisdom.safety }, { icon: <Coins className="text-amber-500" />, label: "예산 및 결제", content: currentCityWisdom.money }, { icon: <Globe className="text-blue-500" />, label: "현지 문화", content: currentCityWisdom.culture }, { icon: <Waves className="text-cyan-500" />, label: "식수 및 기타", content: currentCityWisdom.utilities } ].map((tip, i)=>(
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border shadow-md text-left transition-all hover:shadow-xl"><div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-left shadow-inner">{tip.icon}</div><h5 className="text-[11px] font-black text-slate-400 uppercase mb-2 text-left tracking-widest">{tip.label}</h5><p className="text-[13px] font-bold text-slate-700 text-left leading-relaxed">{tip.content}</p></div>
            ))}
          </div>
        </div>}
      </Modal>

      <Modal isOpen={isGlobalMapOpen} onClose={() => setIsGlobalMapOpen(false)} title="🌍 전체 여정 경로">
        <div style={{ height: '65vh', borderRadius: '3rem', overflow: 'hidden', border: '10px solid #F8FAFC' }} className="shadow-2xl text-left"><MapContainer center={[47.0, 9.0]} zoom={5} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {summary?.total_points.filter(pt => pt.pos && !isNaN(pt.pos[0])).map((pt, i) => {
              const cityName = pt.activity.replace(' Arrival', '');
              const cityKoEn = CITY_NAME_MAP[cityName] || pt.activity;
              return (
                <Marker key={i} position={pt.pos} icon={L.divIcon({ className: '', html: `<div class="w-10 h-10 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center text-xs font-black text-white shadow-2xl">${i + 1}</div>` })}>
                  <Popup><span className="font-black text-sm italic text-left text-slate-900">{cityKoEn}</span></Popup>
                </Marker>
              );
            })}
          {summary?.total_points.length > 1 && <Polyline positions={summary.total_points.map(pt => pt.pos)} color="#2563eb" weight={4} opacity={0.2} dashArray="12, 24" />}
        </MapContainer></div>
      </Modal>
    </div>
  );
}
