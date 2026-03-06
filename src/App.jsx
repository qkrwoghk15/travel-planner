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

const CITY_ESSENTIALS = {
  Paris: [
    {
      name: "Bistrot Paul Bert",
      type: "Food",
      desc: "파리 정통 스테이크 프릿츠의 성지. 페퍼 스테이크가 일품입니다.",
      links: { 
        official: "http://www.bistrotpaulbert.fr/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Bistrot+Paul+Bert+Paris",
        blog: "https://search.naver.com/search.naver?query=파리+비스트로+폴+베르+후기"
      }
    },
    {
      name: "Le Bon Marché",
      type: "Shopping",
      desc: "세계 최초의 백화점. 식품관(La Grande Épicerie)의 보르디예 버터는 필수!",
      links: { 
        official: "https://www.lebonmarche.com/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Le+Bon+Marche+Paris",
        blog: "https://search.naver.com/search.naver?query=봉마르셰+보르디예+버터+쇼핑"
      }
    }
  ],
  Lyon: [
    {
      name: "Les Halles de Lyon Paul Bocuse",
      type: "Food",
      desc: "전설적인 셰프 폴 보퀴즈의 이름을 딴 미식 시장. 리옹의 모든 맛이 여기 있습니다.",
      links: { 
        official: "https://www.halles-de-lyon-paulbocuse.com/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Les+Halles+de+Lyon+Paul+Bocuse",
        blog: "https://search.naver.com/search.naver?query=리옹+폴+보퀴즈+시장+후기"
      }
    }
  ],
  Zermatt: [
    {
      name: "Saycheese!",
      type: "Food",
      desc: "체르마트 최고의 치즈 요리 전문점. 정통 퐁뒤와 라클렛을 즐겨보세요.",
      links: { 
        official: "https://www.zermatterhof.ch/en/restaurants-bars/saycheese/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Saycheese+Zermatt",
        blog: "https://search.naver.com/search.naver?query=체르마트+퐁뒤+맛집+세이치즈"
      }
    }
  ],
  Interlaken: [
    {
      name: "Jungfraujoch",
      type: "Sightseeing",
      desc: "유럽의 지붕. 아이거 익스프레스를 타고 올라가는 만년설의 세계.",
      links: { 
        official: "https://www.jungfrau.ch/en-gb/jungfraujoch-top-of-europe/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Jungfraujoch",
        blog: "https://search.naver.com/search.naver?query=융프라우요흐+등정+후기"
      }
    }
  ],
  Milan: [
    {
      name: "Luini (판제로티)",
      type: "Food",
      desc: "1949년부터 시작된 밀라노의 전설. 튀긴 치즈 빵 '판제로티'는 무조건 먹어야 합니다.",
      links: { 
        official: "https://www.luini.it/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Luini+Milan",
        blog: "https://search.naver.com/search.naver?query=밀라노+루이니+판제로티+후기"
      }
    },
    {
      name: "Peck (미식 성지)",
      type: "Food",
      desc: "140년 전통의 밀라노 최고급 식품관. 보르디예 버터, 트러플 오일, 치즈의 천국입니다.",
      links: { 
        official: "https://www.peck.it/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Peck+Milan",
        blog: "https://search.naver.com/search.naver?query=밀라노+Peck+쇼핑+리스트"
      }
    },
    {
      name: "Ratanà",
      type: "Food",
      desc: "현대 밀라노 요리의 정점. 샤프란 리조또와 오소부코는 이곳이 최고로 꼽힙니다.",
      links: { 
        official: "https://www.ratana.it/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Ratana+Milan",
        search: "https://www.google.com/search?q=Ratana+Milan+Ossobuco+review"
      }
    },
    {
      name: "Duomo Rooftop",
      type: "Sightseeing",
      desc: "두오모 지붕 위를 걷는 경험. 밀라노 전체를 조망하며 정교한 첨탑을 바로 옆에서 볼 수 있습니다.",
      links: { 
        official: "https://www.duomomilano.it/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Duomo+di+Milano",
        blog: "https://search.naver.com/search.naver?query=밀라노+두오모+테라스+예약"
      }
    },
    {
      name: "Starbucks Reserve Roastery",
      type: "Sightseeing",
      desc: "전 세계 6개뿐인 로스터리 중 가장 아름다운 곳으로 꼽히는 구 우체국 건물 매장.",
      links: { 
        official: "https://www.starbucksreserve.com/en-us/locations/milan", 
        maps: "https://www.google.com/maps/search/?api=1&query=Starbucks+Reserve+Roastery+Milan",
        blog: "https://search.naver.com/search.naver?query=밀라노+스타벅스+리저브+로스터리"
      }
    }
  ],
  Venice: [
    {
      name: "Bar All'Arco",
      type: "Food",
      desc: "베네치아 현지인들의 소울 푸드 '치케티'. 리알토 시장 옆 서서 먹는 낭만이 있습니다.",
      links: { 
        official: "https://www.tripadvisor.com/Restaurant_Review-g187870-d1102318-Reviews-Bar_All_Arco-Venice_Veneto.html", 
        maps: "https://www.google.com/maps/search/?api=1&query=Bar+All+Arco+Venice",
        blog: "https://search.naver.com/search.naver?query=베네치아+치케티+맛집+올아르코"
      }
    },
    {
      name: "Trattoria Antiche Carampane",
      type: "Food",
      desc: "관광객 메뉴 없음! 정통 베네치아 해산물 요리의 끝판왕입니다.",
      links: { 
        official: "https://www.antichecarampane.it/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Antiche+Carampane+Venice",
        search: "https://www.google.com/search?q=Antiche+Carampane+review"
      }
    },
    {
      name: "Burano Island",
      type: "Sightseeing",
      desc: "알록달록 무지개 빛깔 집들로 가득한 섬. 인생샷 명소이자 레이스 공예의 중심.",
      links: { 
        maps: "https://www.google.com/maps/search/?api=1&query=Burano+Island+Venice", 
        blog: "https://search.naver.com/search.naver?query=베네치아+부라노섬+가는법"
      }
    }
  ],
  Bologna: [
    {
      name: "Osteria dell'Orsa",
      type: "Food",
      desc: "줄 서서 먹는 원조 라구 파스타. 합리적인 가격과 활기찬 분위기가 특징입니다.",
      links: { 
        official: "https://www.osteriadellorsa.it/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Osteria+dell+Orsa+Bologna",
        blog: "https://search.naver.com/search.naver?query=볼로냐+오스테리아+델+오르사+라구"
      }
    },
    {
      name: "Tamburini",
      type: "Food",
      desc: "1932년부터 이어진 볼로냐 최고의 델리. 모르타델라와 생파스타의 천국.",
      links: { 
        official: "http://www.tamburini.com/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Tamburini+Bologna",
        search: "https://www.google.com/search?q=Tamburini+Bologna+review"
      }
    },
    {
      name: "Portico di San Luca",
      type: "Sightseeing",
      desc: "세계에서 가장 긴 3.8km의 회랑. 비를 맞지 않고 언덕 위 성당까지 걸어갈 수 있습니다.",
      links: { 
        maps: "https://www.google.com/maps/search/?api=1&query=Portico+di+San+Luca+Bologna", 
        blog: "https://search.naver.com/search.naver?query=볼로냐+산루카+회랑+하이킹"
      }
    }
  ],
  Florence: [
    {
      name: "Regina Bistecca",
      type: "Food",
      desc: "피렌체 최고의 티본 스테이크 평점을 보유한 곳. 분위기와 맛 모두 압도적입니다.",
      links: { 
        official: "https://www.reginabistecca.com/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Regina+Bistecca+Florence",
        blog: "https://search.naver.com/search.naver?query=피렌체+레지나+비스테카+예약"
      }
    },
    {
      name: "Trattoria Sostanza",
      type: "Food",
      desc: "예약 없이는 절대 못 가는 곳. 지글지글 끓는 버터 치킨은 피렌체 최고의 미식 경험입니다.",
      links: { 
        official: "https://www.tripadvisor.com/Restaurant_Review-g187895-d1102334-Reviews-Trattoria_Sostanza-Florence_Tuscany.html", 
        maps: "https://www.google.com/maps/search/?api=1&query=Trattoria+Sostanza+Florence",
        blog: "https://search.naver.com/search.naver?query=피렌체+소스타냐+버터치킨"
      }
    },
    {
      name: "Uffizi Gallery",
      type: "Sightseeing",
      desc: "르네상스 예술의 정수. 보티첼리의 '비너스의 탄생'을 직접 만날 수 있습니다.",
      links: { 
        official: "https://www.uffizi.it/en/the-uffizi", 
        maps: "https://www.google.com/maps/search/?api=1&query=Uffizi+Gallery+Florence",
        blog: "https://search.naver.com/search.naver?query=피렌체+우피치+미술관+예약"
      }
    }
  ],
  Rome: [
    {
      name: "Roscioli Salumeria",
      type: "Food",
      desc: "로마에서 단 한 끼를 먹는다면 이곳. 인생 카르보나라와 아마트리치아나를 만날 수 있습니다.",
      links: { 
        official: "https://www.salumeriaroscioli.com/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Roscioli+Salumeria+Rome",
        blog: "https://search.naver.com/search.naver?query=로마+로시올리+예약+방법"
      }
    },
    {
      name: "Bonci Pizzarium",
      type: "Food",
      desc: "넷플릭스 '셰프의 테이블' 주인공 가브리엘레 본치의 피자 성지. 로마식 조각 피자의 정점.",
      links: { 
        official: "https://www.bonci.it/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Bonci+Pizzarium+Rome",
        search: "https://www.google.com/search?q=Bonci+Pizzarium+review"
      }
    },
    {
      name: "Vatican Museums",
      type: "Sightseeing",
      desc: "인류 최고의 보물창고. 미켈란젤로의 천장화와 성 베드로 대성당의 웅장함을 느껴보세요.",
      links: { 
        official: "https://www.museivaticani.va/", 
        maps: "https://www.google.com/maps/search/?api=1&query=Vatican+Museums",
        blog: "https://search.naver.com/search.naver?query=바티칸+박물관+예약+팁"
      }
    }
  ]
};

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
  const [itinerary, setItinerary] = useState([]); // Current day events
  const [summary, setSummary] = useState(null); // Global metadata
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [mapConfig, setMapConfig] = useState({ center: [48.8566, 2.3522], zoom: 14, bounds: null, forceFly: false });
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [focusedEventIndex, setFocusedEventIndex] = useState(null);

  // 1. Initial Metadata Load
  useEffect(() => {
    fetch('/itinerary/summary.json')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Summary Load Error:', err);
        setLoading(false);
      });

    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. Dynamic Day Load
  useEffect(() => {
    if (!summary) return;
    setDayLoading(true);
    Papa.parse(`/itinerary/day${selectedDay}.csv`, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.filter(row => row.Activity);
        setItinerary(data);
        setDayLoading(false);
      },
      error: (err) => {
        console.error('Day Load Error:', err);
        setDayLoading(false);
      }
    });
  }, [selectedDay, summary]);

  const goToSlide = (index) => {
    if (!summary || index < 0 || index >= summary.total_points.length) return;
    setSlideshowIndex(index);
    const point = summary.total_points[index];
    setMapConfig({ center: point.pos, zoom: 14, forceFly: true });
  };

  const handleNext = () => goToSlide(slideshowIndex + 1);
  const handlePrev = () => goToSlide(slideshowIndex - 1);

  const currentStatus = useMemo(() => {
    if (!summary) return { isTripDay: false, currentDay: null };
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // Check if any point in total_points matches today
    const todayInfo = summary.total_points.find(item => item.date === todayStr); 
    // Note: If date is not in summary points, we'd need another check.
    // For now, keep it simple using the first event of the current day.
    const activeEvent = itinerary.find(item => item.Date === todayStr && timeStr >= (item.StartTime || '') && timeStr < (item.EndTime || ''));
    
    return { isTripDay: !!todayInfo, currentDay: todayInfo ? Number(todayInfo.day) : null, activeEvent, todayStr, timeStr };
  }, [itinerary, summary, now]);

  useEffect(() => {
    if (currentStatus.currentDay && summary) {
      setSelectedDay(currentStatus.currentDay);
    }
  }, [currentStatus.currentDay, summary]);

  const days = useMemo(() => summary?.days || [], [summary]);

  const currentDayEvents = useMemo(() => {
    return itinerary.sort((a, b) => (a.StartTime || '').localeCompare(b.StartTime || ''));
  }, [itinerary]);

  const stats = useMemo(() => {
    if (!summary) return { summary: [], total: 0 };
    return { summary: summary.summary, total: summary.total_cost };
  }, [summary]);

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
  }, [selectedDay, itinerary]); // Reset map when day or itinerary changes

  const stayGroups = useMemo(() => summary?.stay_groups || [], [summary]);

  const dayPathPoints = useMemo(() => {
    return currentDayEvents.filter(e => e.Lat && e.Lng).map(e => [e.Lat, e.Lng]);
  }, [currentDayEvents]);

  const allTripPoints = useMemo(() => summary?.total_points || [], [summary]);

  const currentCityEssentials = useMemo(() => {
    if (!summary || !selectedDay) return [];
    const group = summary.stay_groups.find(g => g.days.includes(selectedDay));
    return group ? (CITY_ESSENTIALS[group.city] || []) : [];
  }, [summary, selectedDay]);

  const currentCityName = useMemo(() => {
    if (!summary || !selectedDay) return "";
    const group = summary.stay_groups.find(g => g.days.includes(selectedDay));
    return group ? group.city : "";
  }, [summary, selectedDay]);

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[9px] text-slate-400 font-black shrink-0"><MapPin className="w-2.5 h-2.5 text-red-400" />{event.Location}</span>
                            <p className="text-slate-500 text-[10px] font-medium truncate italic opacity-80">{event.Description}</p>
                          </div>
                          
                          {/* Transit & Plan B Row */}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {event.Transit && (
                              <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md border border-blue-100/50">
                                <Train className="w-2.5 h-2.5 text-blue-600" />
                                <p className="text-[9px] text-blue-700 font-bold uppercase tracking-tight">{event.Transit}</p>
                              </div>
                            )}
                            {event.PlanB && event.PlanB !== '현지 기상/상황에 따른 유동적 휴식 및 인근 카페 미식' && (
                              <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-100/50">
                                <RotateCcw className="w-2.5 h-2.5 text-amber-600" />
                                <p className="text-[9px] text-amber-700 font-bold leading-tight"><span className="opacity-70 mr-0.5">Plan B:</span> {event.PlanB}</p>
                              </div>
                            )}
                          </div>
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
            <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black flex items-center gap-2 text-slate-900 text-base"><MapIcon className="w-4 h-4 text-blue-600" />실시간 위치 가이드</h3>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all group"
                    title="전체 여정 지도 보기"
                  >
                    <Globe className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  </button>
                  <button 
                    onClick={resetToDailyView}
                    className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all group"
                    title="하루 동선 한눈에 보기"
                  >
                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
                  </button>
                </div>
              </div>
              <div style={{ height: '300px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
                <MapContainer center={mapConfig.center} zoom={mapConfig.zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController center={mapConfig.center} zoom={mapConfig.zoom} bounds={mapConfig.bounds} forceFly={mapConfig.forceFly} />
                  {currentDayEvents.filter(e => e.Lat && e.Lng).map((event, i, arr) => {
                    const isLive = currentStatus.activeEvent?.Activity === event.Activity && Number(currentStatus.currentDay) === selectedDay;
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
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-amber-200 pb-3">
                <h3 className="text-lg font-black text-amber-900 flex items-center gap-2">
                  ⭐ {currentCityName} Must-Go
                </h3>
                <span className="text-[9px] font-black bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-tighter">{currentCityEssentials.length} Items</span>
              </div>
              
              <div className="space-y-5 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                {currentCityEssentials.length > 0 ? (
                  currentCityEssentials.map((item, i) => (
                    <div key={i} className="bg-white/60 hover:bg-white transition-all rounded-2xl p-4 border border-amber-100 shadow-sm group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-amber-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h4>
                        <span className={cn(
                          "text-[7px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ml-2",
                          item.type === 'Food' ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                        )}>{item.type}</span>
                      </div>
                      <p className="text-[10px] text-amber-800/70 leading-relaxed mb-4 font-medium">{item.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.links.maps && (
                          <a href={item.links.maps} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[8px] font-black bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                            <MapIcon className="w-2.5 h-2.5" /> Google Maps
                          </a>
                        )}
                        {item.links.blog && (
                          <a href={item.links.blog} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[8px] font-black bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
                            <ExternalLink className="w-2.5 h-2.5" /> Naver Blog
                          </a>
                        )}
                        {item.links.official && (
                          <a href={item.links.official} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[8px] font-black bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                            <Globe className="w-2.5 h-2.5" /> Official
                          </a>
                        )}
                        {item.links.search && (
                          <a href={item.links.search} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[8px] font-black bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all">
                            <LinkIcon className="w-2.5 h-2.5" /> More Info
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Info className="w-8 h-8 text-amber-200 mx-auto mb-2" />
                    <p className="text-[11px] text-amber-700 italic font-bold">이 지역의 필수 정보가<br/>곧 업데이트될 예정입니다.</p>
                  </div>
                )}
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
