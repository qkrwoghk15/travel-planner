import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Papa from 'papaparse';
import { 
  MapPin, Clock, Euro, ExternalLink, Utensils, Train, Camera, Hotel, Info, Navigation, 
  CheckCircle2, CalendarDays, ArrowRight, X, Globe, Map as MapIcon, Zap, Ticket, 
  Link as LinkIcon, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, ShieldCheck, 
  Coins, Lightbulb, Waves, Star, Youtube, ShoppingBag, Coffee, Search, Heart, Sparkles,
  AlertCircle, Bus, Ship, Plane, CreditCard, Droplets, MessageSquare
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

const CATEGORY_MAP = { Food: '미식', Transport: '이동', Sightseeing: '관광', Accommodation: '숙박', Shopping: '쇼핑', Cafe: '카페', Default: '기타' };
const CATEGORY_ICONS = {
  Food: <Utensils className="w-4 h-4" />,
  Transport: <Train className="w-4 h-4" />,
  Sightseeing: <Camera className="w-4 h-4" />,
  Accommodation: <Hotel className="w-4 h-4" />,
  Shopping: <ShoppingBag className="w-4 h-4" />,
  Cafe: <Coffee className="w-4 h-4" />,
  Default: <Info className="w-4 h-4" />
};
const CATEGORY_COLORS = {
  Food: 'text-orange-600 bg-orange-50 border-orange-100 ring-orange-200',
  Transport: 'text-blue-600 bg-blue-50 border-blue-100 ring-blue-200',
  Sightseeing: 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-200',
  Accommodation: 'text-purple-600 bg-purple-50 border-purple-100 ring-purple-200',
  Shopping: 'text-pink-600 bg-pink-50 border-pink-100 ring-pink-200',
  Cafe: 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-200',
  Default: 'text-slate-600 bg-slate-50 border-slate-100 ring-slate-200'
};

const TRANSIT_ICONS = {
  '비행기': <Plane className="w-3 h-3" />,
  '기차': <Train className="w-3 h-3" />,
  '버스': <Bus className="w-3 h-3" />,
  '유람선': <Ship className="w-3 h-3" />,
  '도보': <Navigation className="w-3 h-3 rotate-45" />,
  '메트로': <Train className="w-3 h-3" />,
  '트램': <Train className="w-3 h-3" />,
  '택시': <Bus className="w-3 h-3" />,
  '푸니쿨라': <Train className="w-3 h-3" />,
  '레오나르도': <Train className="w-3 h-3" />,
  Airplane: <Plane className="w-3 h-3" />,
  Train: <Train className="w-3 h-3" />,
  Bus: <Bus className="w-3 h-3" />,
  Boat: <Ship className="w-3 h-3" />,
  Walking: <Navigation className="w-3 h-3 rotate-45" />,
  Metro: <Train className="w-3 h-3" />,
  Taxi: <Bus className="w-3 h-3" />
};

const CITY_WISDOM = {
  Paris: {
    safety: "7구/15구 안전. 보르디예 버터 위탁 수하물 필수 처리.",
    money: "카드 95% 가능. 팁 15% 포함됨. 만족 시 €1~2 현금.",
    culture: "상점 입실 시 'Bonjour' 인사는 서비스 품질 결정.",
    utilities: "무료 수돗물 요청 시 'Une carafe d'eau'라고 말하세요."
  },
  Lyon: {
    safety: "프레스킬 지역 안전. 부숑 인증 마크 확인 필수.",
    money: "시장 소액 결제용 현금 권장. 카드 대부분 가능.",
    culture: "미식의 수도답게 식사 시간 김. 부숑 예약 필수.",
    utilities: "공공 식수대 많음. 텀블러 지참 시 매우 유용."
  },
  Interlaken: {
    safety: "치안 우수. 융프라우 등정 시 선글라스 절대 필수.",
    money: "온라인 선결제 할인 높음. 카드 보편화.",
    culture: "독일어/영어 통용. 산악 철도 시간 준수 철저.",
    utilities: "기차역 화장실 유료. 식당 이용 시 해결 추천."
  },
  Munich: {
    safety: "독일 내에서 가장 안전한 도시. 중앙역 부근만 밤에 조심.",
    money: "현금 결제 비중이 여전히 꽤 있음 (비어가든 등).",
    culture: "비어가든에선 합석이 기본. 'Prost!'로 건배하기.",
    utilities: "판트(Pfand) 제도로 플라스틱 병/캔 환급 가능."
  },
  Prague: {
    safety: "천문 시계와 카를교 근처 소매치기 매우 주의.",
    money: "체코 코루나(CZK) 사용. 환전소 사기 주의 (카드 결제 추천).",
    culture: "맥주(Pivo)가 물보다 쌈. 팁은 영수증 확인 후 10% 추가.",
    utilities: "화장실 유료. 트램 티켓 펀칭 안하면 엄청난 벌금."
  },
  Venice: {
    safety: "산 마르코 소매치기 주의. 가방 앞으로 매기.",
    money: "바포레토권 온라인 선구매. 도시 입장료 확인.",
    culture: "치케티는 서서 먹는 문화. 안쪽 골목 추천.",
    utilities: "산 조르조 종탑 전망대로 T-폰다코 대체 추천."
  },
  Florence: {
    safety: "가죽 시장 흥정 필수. 소매치기 상시 주의.",
    money: "박물관 예약비 별도 확인. 스테이크 무게 단위 주문.",
    culture: "우피치 월요일 휴관. 예약 시간 20분 전 도착 필수.",
    utilities: "시내 중심 무료 화장실 드묾. 카페 화장실 활용."
  },
  Rome: {
    safety: "관광지 소매치기 극심. 가방 앞으로 매기.",
    money: "유료 화장실용 €1 동전 필수. 예약 60일 전 오픈.",
    culture: "노천카페 자릿세 비쌈. 6월 2일 공화국 선포일 주의.",
    utilities: "코 모양 식수대 'Nasoni' 물 매우 차고 깨끗함."
  }
};

function MapController({ center, zoom, bounds, forceFly = false }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (bounds && bounds.length > 0) {
      if (forceFly) map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 16, duration: 1.5 });
      else map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      if (forceFly) map.flyTo(center, zoom || 14, { duration: 1.5 }); 
      else map.setView(center, zoom || 14); 
    }
    const timer = setTimeout(() => map.invalidateSize(), 400);
    return () => clearTimeout(timer);
  }, [center, zoom, bounds, map, forceFly]);
  return null;
}

export default function App() {
  const [itinerary, setItinerary] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [mapConfig, setMapConfig] = useState({ center: [48.8566, 2.3522], zoom: 14, bounds: null, forceFly: false });
  const [focusedEventIndex, setFocusedEventIndex] = useState(null);
  const [searchTerm, setSearchBaseTerm] = useState("");
  const [cityEssentials, setCityEssentials] = useState({});

  useEffect(() => {
    fetch('/itinerary/summary.json')
      .then(res => res.json())
      .then(data => { setSummary(data); setLoading(false); })
      .catch(err => { console.error('Summary Load Error:', err); setLoading(false); });
      
    fetch('/itinerary/places.json')
      .then(res => res.json())
      .then(data => setCityEssentials(data))
      .catch(err => console.error('Places Load Error:', err));

    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!summary) return;
    setDayLoading(true);
    Papa.parse(`/itinerary/day${selectedDay}.csv`, {
      download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.filter(row => row.Activity);
        setItinerary(data);
        setDayLoading(false);
      },
      error: (err) => { console.error('Day Load Error:', err); setDayLoading(false); }
    });
  }, [selectedDay, summary]);

  const resetToDailyView = () => {
    setFocusedEventIndex(null);
    if (itinerary.length > 0) {
      const points = itinerary.filter(e => e.Lat && e.Lng).map(e => [e.Lat, e.Lng]);
      if (points.length > 1) setMapConfig({ bounds: points, forceFly: true });
      else if (points.length === 1) setMapConfig({ center: points[0], zoom: 14, forceFly: true });
    }
  };

  useEffect(() => { resetToDailyView(); }, [selectedDay, itinerary]);

  const currentStatus = useMemo(() => {
    if (!summary) return { isTripDay: false };
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const todayInfo = summary.total_points?.find(item => item.date === todayStr);
    const activeEvent = itinerary.find(item => item.Date === todayStr && timeStr >= (item.StartTime || '') && timeStr < (item.EndTime || ''));
    return { isTripDay: !!todayInfo, currentDay: todayInfo ? Number(todayInfo.day) : null, activeEvent, timeStr };
  }, [itinerary, summary, now]);

  const currentCityName = useMemo(() => {
    if (!summary || !selectedDay) return "";
    let foundCity = "";
    summary.stay_groups.forEach(group => {
      if (group.days.includes(selectedDay)) {
        foundCity = group.city;
      }
    });
    // Fallback if "Night Train" is selected but we want to show destination info
    if (foundCity === "Night Train") return "Prague"; 
    if (foundCity === "Incheon") return "Rome";
    return foundCity;
  }, [summary, selectedDay]);

  const filteredEssentials = useMemo(() => {
    const list = cityEssentials[currentCityName] || [];
    if (!searchTerm) return list;
    return list.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.review && item.review.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [currentCityName, searchTerm, cityEssentials]);

  const currentCityWisdom = useMemo(() => CITY_WISDOM[currentCityName] || null, [currentCityName]);
  const days = useMemo(() => summary?.days || [], [summary]);
  const dayCost = useMemo(() => itinerary.reduce((sum, item) => sum + (Number(item.Cost) || 0), 0), [itinerary]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4 font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-slate-500 font-black tracking-widest leading-none italic uppercase">EuroGuide Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-md"><Sparkles className="text-white w-4 h-4 fill-white/20" /></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none italic">EuroGuide Pro</h1>
              <p className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">{days.length} Days Epicurean Journey</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[8px] text-slate-400 font-black uppercase">전체 예상 예산</p>
              <p className="text-sm font-black text-blue-600">€{summary?.total_cost?.toLocaleString()}</p>
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

        {/* Journey Timeline */}
        <section className="mb-6 bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <CalendarDays className="w-3 h-3 text-blue-500" /> 여정 내비게이션 (프랑스➔스위스➔독일➔체코➔이탈리아)
          </h3>
          <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pb-1">
            {summary?.stay_groups.map((group, gIdx) => {
              const isActiveGroup = group.days.includes(selectedDay);
              return (
                <div key={gIdx} className="flex-shrink-0 flex flex-col gap-2 min-w-[150px]">
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
                      <span className={cn("text-[9px] font-bold truncate w-28", isActiveGroup ? "text-slate-400" : "text-slate-500")}>{group.accommodation}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 px-0.5">
                    {group.days.map(day => (
                      <button 
                        key={day} 
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          "w-7 h-7 rounded-md text-[10px] font-black transition-all border flex items-center justify-center relative",
                          selectedDay === day ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-105 z-10" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-end justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Daily Itinerary</h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{selectedDay}일차 일정 - {itinerary[0]?.Date || '로딩 중...'}</p>
                </div>
                <div className="flex gap-1.5 mb-1.5">
                  <button onClick={() => setSelectedDay(prev => Math.max(days[0] || 1, prev - 1))} className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setSelectedDay(prev => Math.min(days[days.length - 1] || 18, prev + 1))} className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-md flex items-center gap-1.5">
                <Euro className="w-3 h-3" /> 일일 지출: €{dayCost.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              {itinerary.sort((a,b)=>(a.StartTime||'').localeCompare(b.StartTime||'')).map((event, idx) => {
                const isLive = currentStatus.activeEvent?.Activity === event.Activity && Number(currentStatus.currentDay) === selectedDay;
                return (
                  <div key={idx} className="relative pl-9">
                    <button 
                      onClick={() => { setFocusedEventIndex(idx); setMapConfig({ center: [event.Lat, event.Lng], zoom: 16, forceFly: true }); }}
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-[#F8FAFC] z-10 flex items-center justify-center shadow-sm transition-all hover:scale-110", 
                        isLive ? "bg-red-500 scale-110 shadow-lg shadow-red-200" : (focusedEventIndex === idx ? "bg-blue-600 ring-2 ring-blue-200 shadow-md" : (CATEGORY_COLORS[event.Category]?.split(' ')[1] || 'bg-slate-100'))
                      )}
                    >
                      {isLive ? <Zap className="w-3.5 h-3.5 text-white fill-white" /> : (CATEGORY_ICONS[event.Category] || CATEGORY_ICONS.Default)}
                    </button>
                    <div className={cn("bg-white p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3", isLive ? "border-red-500 ring-2 ring-red-50 shadow-md" : "border-slate-200 shadow-sm hover:shadow-md")}>
                      <div className="flex items-center gap-4">
                        <div className="min-w-[60px] flex flex-col items-center border-r border-slate-100 pr-4">
                          <span className={cn("font-black text-[13px] tracking-tighter", isLive ? "text-red-600" : "text-slate-900")}>{event.StartTime || '--:--'}</span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">~ {event.EndTime || '--:--'}</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn("px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border", CATEGORY_COLORS[event.Category])}>{CATEGORY_MAP[event.Category] || '기타'}</span>
                            <h3 className="text-[13px] font-black text-slate-800 tracking-tight truncate">{event.Activity}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[9px] text-slate-400 font-black shrink-0"><MapPin className="w-2.5 h-2.5 text-red-400" />{event.Location}</span>
                            <p className="text-slate-500 text-[10px] font-medium truncate italic opacity-80">{event.Description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-slate-50">
                          <div className="flex gap-1.5">
                            {event.MapLink && <a href={event.MapLink} target="_blank" rel="noreferrer" title="Google Maps" className="p-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 rounded-xl transition-all shadow-sm border border-slate-100"><MapIcon className="w-3.5 h-3.5" /></a>}
                            {event.BookingLink && <a href={event.BookingLink} target="_blank" rel="noreferrer" title="Booking" className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl transition-all shadow-sm border border-blue-100"><Ticket className="w-3.5 h-3.5" /></a>}
                            {event.OfficialLink && <a href={event.OfficialLink} target="_blank" rel="noreferrer" title="Official Website" className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-xl transition-all shadow-sm border border-emerald-100"><Globe className="w-3.5 h-3.5" /></a>}
                          </div>
                          <div className="h-8 w-px bg-slate-100 mx-1" />
                          <div className="flex flex-col items-end min-w-[50px]">
                            <span className="text-sm font-black text-slate-900 tracking-tighter">€{(Number(event.Cost) || 0).toLocaleString()}</span>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Budget</p>
                          </div>
                        </div>
                      </div>

                      {(event.Transit || event.PlanB) && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                          {event.Transit && (
                            <div className="flex items-center gap-1.5 bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                              {TRANSIT_ICONS[Object.keys(TRANSIT_ICONS).find(k => event.Transit.includes(k)) || '도보']}
                              <p className="text-[9px] text-blue-700 font-bold uppercase tracking-tight">{event.Transit}</p>
                            </div>
                          )}
                          {event.PlanB && (
                            <div className="flex items-center gap-1.5 bg-amber-50/50 px-2.5 py-1 rounded-lg border border-amber-100/50">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <p className="text-[9px] text-amber-700 font-bold leading-tight"><span className="opacity-60 mr-1 italic">Plan B:</span>{event.PlanB}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Real-time Map */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-black flex items-center gap-2 text-slate-900 text-sm"><MapIcon className="w-4 h-4 text-blue-600" />실시간 동선 가이드</h3>
                <div className="flex gap-1">
                  <button onClick={() => setIsModalOpen(true)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Globe className="w-3.5 h-3.5" /></button>
                  <button onClick={resetToDailyView} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div style={{ height: '250px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
                <MapContainer center={mapConfig.center} zoom={mapConfig.zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController center={mapConfig.center} zoom={mapConfig.zoom} bounds={mapConfig.bounds} forceFly={mapConfig.forceFly} />
                  {itinerary.filter(e => e.Lat && e.Lng).map((event, i) => (
                    <Marker key={i} position={[event.Lat, event.Lng]} icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div class="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border border-white shadow-lg bg-slate-900 text-white">${i + 1}</div>`,
                      iconSize: [20, 20], iconAnchor: [10, 10]
                    })}>
                      <Popup><div className="font-black text-xs">{event.Activity}</div></Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Expanded Must-Go List with Search, Ranking & Reviews */}
            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-amber-200 pb-3">
                <h3 className="text-lg font-black text-amber-900 flex items-center gap-2">⭐ {currentCityName} Must-Go</h3>
                <span className="text-[9px] font-black bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-tighter">{filteredEssentials.length} Places</span>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400" />
                <input 
                  type="text" 
                  placeholder="맛집, 명소 검색..." 
                  className="w-full bg-white/80 border border-amber-100 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchBaseTerm(e.target.value)}
                />
              </div>

              <div className="space-y-3 max-h-[550px] overflow-y-auto no-scrollbar pr-1">
                {filteredEssentials.map((item, i) => (
                  <div key={i} className={cn(
                    "bg-white/60 hover:bg-white transition-all rounded-2xl p-4 border shadow-sm group relative flex flex-col gap-2",
                    item.isMust ? "border-amber-300 ring-1 ring-amber-100" : "border-amber-100"
                  )}>
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-amber-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h4>
                          {item.isMust && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-[10px] text-amber-800/70 font-medium">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2 bg-amber-100/50 px-1.5 py-0.5 rounded text-[9px] font-black text-amber-700">
                        Top {item.rank}
                      </div>
                    </div>

                    {item.review && (
                      <div className="mt-1 p-2.5 bg-amber-100/30 rounded-xl border border-amber-200/50 flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-900/90 font-bold leading-relaxed">{item.review}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[7px] font-black uppercase px-1.5 py-0.5 rounded",
                        item.type === 'Food' ? "bg-orange-100 text-orange-700" : 
                        (item.type === 'Shopping' ? "bg-pink-100 text-pink-700" : 
                        (item.type === 'Cafe' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"))
                      )}>{item.type}</span>
                      <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.links?.maps && <a href={item.links.maps} target="_blank" rel="noreferrer" className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-md transition-all shadow-sm"><MapIcon className="w-3 h-3" /></a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City Wisdom (Pro-Tips) */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl border border-white/10">
              <h3 className="text-lg font-black flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                <Lightbulb className="w-5 h-5 text-amber-400" /> {currentCityName} 마스터 팁
              </h3>
              <div className="space-y-4">
                {currentCityWisdom ? (
                  <>
                    <div className="flex gap-3">
                      <div className="bg-white/10 p-2 rounded-xl shrink-0 h-fit"><ShieldCheck className="w-4 h-4 text-emerald-400" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">청결 및 치안</p>
                        <p className="text-[11px] font-medium leading-relaxed opacity-90">{currentCityWisdom.safety}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-white/10 p-2 rounded-xl shrink-0 h-fit"><Coins className="w-4 h-4 text-amber-400" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">결제 및 팁</p>
                        <p className="text-[11px] font-medium leading-relaxed opacity-90">{currentCityWisdom.money}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-white/10 p-2 rounded-xl shrink-0 h-fit"><Globe className="w-4 h-4 text-blue-400" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">로컬 문화</p>
                        <p className="text-[11px] font-medium leading-relaxed opacity-90">{currentCityWisdom.culture}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-white/10 p-2 rounded-xl shrink-0 h-fit"><Waves className="w-4 h-4 text-cyan-400" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">식수 및 기타</p>
                        <p className="text-[11px] font-medium leading-relaxed opacity-90">{currentCityWisdom.utilities}</p>
                      </div>
                    </div>
                  </>
                ) : <p className="text-center py-4 text-slate-500 text-xs italic">데이터 분석 중...</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Map Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-white w-full max-w-7xl h-full max-h-[85vh] rounded-[3.5rem] overflow-hidden flex flex-col relative shadow-2xl border border-white/20">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 z-[2100] bg-slate-900 text-white p-4 rounded-full hover:bg-blue-600 transition-all shadow-2xl"><X className="w-6 h-6" /></button>
            <div className="p-10 border-b bg-white relative z-[2050] shrink-0">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">19일간의 5개국 대장정</h2>
              <p className="text-slate-500 font-medium">프랑스 ➔ 스위스 ➔ 독일 ➔ 체코 ➔ 이탈리아</p>
            </div>
            <div className="flex-grow w-full relative bg-slate-50">
              <MapContainer center={[47.0, 9.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {summary?.total_points.map((pt, i) => (
                  <Marker key={i} position={pt.pos} icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-2xl bg-blue-600 text-white">${i + 1}</div>`,
                    iconSize: [32, 32], iconAnchor: [16, 16]
                  })}><Popup><div className="font-black text-xs p-1">{pt.activity}</div></Popup></Marker>
                ))}
                {summary?.total_points.length > 1 && <Polyline positions={summary.total_points.map(pt => pt.pos)} color="#2563eb" weight={3} opacity={0.3} dashArray="10, 20" />}
              </MapContainer>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}