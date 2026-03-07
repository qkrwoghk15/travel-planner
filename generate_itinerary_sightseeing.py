import csv
import os

base_dir = '/Users/user/temp/my-travel-planner/public/itinerary/'
os.makedirs(base_dir, exist_ok=True)

def gmap(q):
    return f"https://www.google.com/maps/search/?api=1&query={q.replace(' ', '+')}"

# High-Density Sightseeing & Epicurean Itinerary (Restored City Flow)
days_data = [
    # Day 1: Paris Arrival & Landmarks
    [
        ["00:00", "18:10", "파리행 비행", "Paris (CDG)", "Transport", 0, gmap("Paris CDG Airport"), "", "", "1회 경유 항공편 이용", 49.0097, 2.5479, "비행기", "연착 시 우버"],
        ["18:10", "19:10", "입국 심사", "Paris (CDG)", "Transport", 0, gmap("Paris CDG Airport"), "", "", "수하물 수령", 49.0097, 2.5479, "도보", ""],
        ["19:10", "20:30", "시내 이동", "Cler Hôtel", "Transport", 15, gmap("Cler Hotel Paris"), "https://www.clerhotel.com/", "", "RER B ➔ Metro 환승", 48.8575, 2.3055, "기차: CDG ➔ École Militaire", "택시 (€60)"],
        ["20:30", "21:30", "체크인", "Cler Hôtel", "Accommodation", 180, gmap("Cler Hotel Paris"), "", "", "숙소 위생 확인", 48.8575, 2.3055, "도보", ""],
        ["21:30", "23:59", "에펠탑 야경", "Champ de Mars", "Sightseeing", 0, gmap("Champ de Mars"), "", "", "정각 화이트 에펠 감상", 48.8584, 2.2945, "도보 (10분)", "숙소 휴식"]
    ],
    # Day 2: Paris Art & Mural (Art Day)
    [
        ["00:00", "08:30", "수면", "Cler Hôtel", "Accommodation", 0, gmap("Cler Hotel Paris"), "", "", "", 48.8575, 2.3055, "", ""],
        ["08:30", "12:30", "루브르 박물관", "Musée du Louvre", "Sightseeing", 17, gmap("Louvre Museum"), "https://www.louvre.fr/en", "", "핵심 3대 대작 관람", 48.8606, 2.3376, "메트로: École Militaire ➔ Palais Royal", "오르세 미술관"],
        ["12:30", "14:00", "점심: 셉팀", "Septime", "Food", 85, gmap("Septime Paris"), "https://www.septime-charonne.fr/", "", "현대 프랑스 미식", 48.8515, 2.3775, "메트로: Palais Royal ➔ Charonne", "Clamato"],
        ["14:00", "17:00", "13구 벽화 투어", "Boulevard Vincent Auriol", "Sightseeing", 0, gmap("Street Art 13th Paris"), "", "", "거대 현대 벽화 단지 탐방", 48.8321, 2.3665, "메트로: Charonne ➔ Place d'Italie", "룩셈부르크 공원"],
        ["17:00", "19:00", "뱅센 동물원", "Parc Zoologique", "Sightseeing", 20, gmap("Parc Zoologique de Paris"), "https://www.parczoologiquedeparis.fr/en", "", "뱅센 숲 현대적 동물원", 48.8315, 2.4165, "메트로: Place d'Italie ➔ Porte Dorée", "생트 샤펠 관람"],
        ["19:00", "21:30", "저녁: 폴 베르", "Bistrot Paul Bert", "Food", 60, gmap("Bistrot Paul Bert Paris"), "", "", "정통 스테이크 프릿츠", 48.8505, 2.3845, "메트로: Porte Dorée ➔ Faidherbe", "Chez Dumonet"],
        ["21:30", "23:59", "오페라 공연", "Palais Garnier", "Sightseeing", 120, gmap("Palais Garnier"), "https://www.operadeparis.fr/en", "", "발레 또는 클래식 공연", 48.8719, 2.3316, "메트로: Faidherbe ➔ Opéra", "센강 유람선"]
    ],
    # Day 3: Paris Lifestyle & Butter
    [
        ["00:00", "08:30", "수면", "Cler Hôtel", "Accommodation", 0, gmap("Cler Hotel Paris"), "", "", "", 48.8575, 2.3055, "", ""],
        ["08:30", "10:30", "마레 지구 산책", "Le Marais", "Sightseeing", 0, gmap("Le Marais"), "", "", "보헤미안 감성 골목 투어", 48.8575, 2.3594, "메트로", "튈르리 정원"],
        ["10:30", "12:30", "디올 갤러리", "La Galerie Dior", "Sightseeing", 12, gmap("La Galerie Dior"), "https://www.galeriedior.com/", "", "패션과 건축의 예술 전시", 48.8665, 2.3025, "메트로: Saint-Paul ➔ Franklin Roosevelt", "이브 생 로랑 박물관"],
        ["12:30", "14:30", "점심: 뒤모네", "Chez Dumonet", "Food", 75, gmap("Chez Dumonet Paris"), "", "", "최고의 비프 부르기뇽", 48.8495, 2.3275, "메트로: Roosevelt ➔ Vaneau", "Le Bon Marché 미식홀"],
        ["14:30", "17:30", "버터 쇼핑", "La Grande Épicerie", "Shopping", 50, gmap("La Grande Epicerie de Paris"), "", "", "보르디예 버터 대량 구매", 48.8515, 2.3245, "도보", "Lafayette Le Gourmet"],
        ["17:30", "20:00", "몽마르트르 일몰", "Sacré-Cœur", "Sightseeing", 0, gmap("Sacre-Coeur"), "", "", "테르트르 광장 화가 관람", 48.8867, 2.3431, "메트로: Sèvres ➔ Anvers", "개선문 야경"],
        ["20:00", "22:00", "저녁: 마담 브라세리", "Madame Brasserie", "Food", 90, gmap("Madame Brasserie"), "https://www.restaurants-toureiffel.com/", "", "에펠탑 내부 전망 식사", 48.8584, 2.2945, "메트로: Anvers ➔ École Militaire", "호텔 인근 비스트로"],
        ["22:00", "23:59", "휴식", "Cler Hôtel", "Accommodation", 0, gmap("Cler Hotel Paris"), "", "", "취침", 48.8575, 2.3055, "도보", "에펠탑 야간 산책"]
    ],
    # Day 4: Lyon History & Mural
    [
        ["00:00", "07:30", "수면", "Cler Hôtel", "Accommodation", 0, gmap("Cler Hotel Paris"), "", "", "", 48.8575, 2.3055, "", ""],
        ["07:30", "09:30", "리옹행 TGV", "Lyon Part-Dieu", "Transport", 55, gmap("Lyon Part-Dieu"), "", "", "리옹 파르디외역 도착", 45.7606, 4.8597, "TGV: Paris ➔ Lyon", "다음 열차"],
        ["09:30", "12:00", "푸르비에르 언덕", "Fourvière Basilique", "Sightseeing", 0, gmap("Fourviere Basilica"), "", "", "로마 원형 극장 및 대성당", 45.7621, 4.8221, "푸니쿨라: Vieux Lyon ➔ Fourvière", "뤼미에르 박물관"],
        ["12:00", "14:00", "점심: 카페 로뷔", "Café Lobut", "Food", 45, gmap("Cafe Lobut Lyon"), "", "", "2025 올해의 부숑 선정 맛집", 45.7715, 4.8785, "메트로: Vieux Lyon ➔ Gratte-Ciel", "Daniel & Denise"],
        ["14:00", "16:30", "비외 리옹 트라불", "Vieux Lyon", "Sightseeing", 0, gmap("Vieux Lyon"), "", "", "비밀 통로 보물찾기 투어", 45.7625, 4.8275, "메트로", "리옹 인형 박물관"],
        ["16:30", "18:30", "강변 대형 벽화", "Fresque des Lyonnais", "Sightseeing", 0, gmap("Fresque des Lyonnais"), "", "", "리옹 유명인 30인 벽화 감상", 45.7675, 4.8285, "도보", "책장 벽화 (Bibliothèque)"],
        ["18:30", "21:30", "저녁: 라 뫼니에르", "La Meunière", "Food", 60, gmap("La Meuniere Lyon"), "", "", "전채 요리 카트가 풍성한 저녁", 45.7655, 4.8355, "도보", "Bouchon Tupin"],
        ["21:30", "23:59", "휴식", "Hôtel La Résidence", "Accommodation", 120, gmap("Hotel La Residence Lyon"), "", "", "취침", 45.7555, 4.8325, "도보", "강변 선상 바(Péniche)"]
    ],
    # Day 5: Lyon Nature & Zoo
    [
        ["00:00", "08:30", "수면", "Hôtel La Résidence", "Accommodation", 0, gmap("Hotel La Residence Lyon"), "", "", "", 45.7555, 4.8325, "", ""],
        ["08:30", "11:30", "테트 도르 공원", "Parc de la Tête d'Or", "Sightseeing", 0, gmap("Parc de la Tete d'Or"), "", "", "무료 동물원 및 식물원 산책", 45.7775, 4.8555, "버스/트램", "실크 직공 벽화 단지"],
        ["11:30", "14:00", "점심: 폴 보퀴즈", "Les Halles de Lyon", "Food", 45, gmap("Les Halles de Lyon Paul Bocuse"), "", "", "미식 시장 투어 및 점심", 45.7621, 4.8511, "트램: T1 Massena ➔ Halles", "Marché Saint-Antoine"],
        ["14:00", "16:30", "크루아-루스 벽화", "Mur des Canuts", "Sightseeing", 0, gmap("Mur des Canuts"), "", "", "유럽 최대 규모 착시 벽화", 45.7771, 4.8275, "메트로: Part-Dieu ➔ Henon", "오페라 하우스 투어"],
        ["16:30", "18:30", "뤼미에르 박물관", "Musée Lumière", "Sightseeing", 10, gmap("Musee Lumiere"), "https://www.institut-lumiere.org/", "", "영화의 발상지 기념관", 45.7455, 4.8695, "메트로: Henon ➔ Monplaisir", "현대 미술관"],
        ["18:30", "21:00", "저녁: 투팽", "Bouchon Tupin", "Food", 55, gmap("Bouchon Tupin Lyon"), "", "", "현대적 감각의 부숑 체험", 45.7615, 4.8325, "메트로", "Brasserie Georges"],
        ["21:00", "23:59", "휴식", "Hôtel La Résidence", "Accommodation", 0, gmap("Hotel La Residence Lyon"), "", "", "취침", 45.7555, 4.8325, "도보", "벨쿠르 광장 야경"]
    ],
    # Day 6: Zermatt Nature Focus
    [
        ["00:00", "08:00", "수면", "Hôtel La Résidence", "Accommodation", 0, gmap("Hotel La Residence Lyon"), "", "", "", 45.7555, 4.8325, "", ""],
        ["08:00", "13:00", "체르마트행 기차", "Zermatt Station", "Transport", 85, gmap("Zermatt Station"), "", "", "제네바/비스프 환승 이동", 46.0236, 7.7487, "기차: Lyon ➔ Zermatt", "지연 시 다음 열차"],
        ["13:00", "14:30", "체크인", "Zermatt Boutique Chalet", "Accommodation", 200, gmap("Zermatt Village"), "", "", "친환경 차량 금지 마을", 46.0236, 7.7487, "전기 택시", ""],
        ["14:30", "18:00", "고르너그라트", "Gornergrat", "Sightseeing", 65, gmap("Gornergrat"), "https://www.gornergrat.ch/", "", "마테호른 360도 절경 관람", 45.9833, 7.7833, "산악열차 (33분)", "수네가 전망대"],
        ["18:00", "19:30", "마을 역사 투어", "Hinterdorf", "Sightseeing", 0, gmap("Hinterdorf Zermatt"), "", "", "16세기 목조 가옥 보존 구역", 46.0236, 7.7487, "도보", "마테호른 박물관"],
        ["19:30", "21:30", "저녁: 세이치즈", "Saycheese!", "Food", 55, gmap("Saycheese Zermatt"), "", "", "2025 블로그 1위 퐁뒤 성지", 46.0215, 7.7485, "도보", "Whymper-Stube"],
        ["21:30", "23:59", "휴식", "Zermatt Chalet", "Accommodation", 0, gmap("Zermatt Village"), "", "", "취침", 46.0236, 7.7487, "도보", "알프스 별 관측"]
    ],
    # Day 7: Zermatt Glacier & Hike
    [
        ["00:00", "08:30", "수면", "Zermatt Chalet", "Accommodation", 0, gmap("Zermatt Village"), "", "", "", 46.0236, 7.7487, "", ""],
        ["08:30", "12:00", "글래시어 파라다이스", "Matterhorn Paradise", "Sightseeing", 75, gmap("Matterhorn Glacier Paradise"), "", "", "유럽 최고 높이 전망대 관람", 45.9383, 7.7283, "케이블카", "수네가 하이킹"],
        ["12:00", "14:30", "점심: 쉐 브로니", "Chez Vrony", "Food", 70, gmap("Chez Vrony Zermatt"), "", "", "마테호른 보며 럭셔리 다이닝", 46.0155, 7.7685, "케이블카+도보", "Findlerhof"],
        ["14:30", "17:00", "5개 호수 하이킹", "Stellisee", "Sightseeing", 0, gmap("Stellisee"), "", "", "반영이 아름다운 호수 산책", 46.0175, 7.8015, "도보 하이킹", "고르너 협곡 투어"],
        ["17:00", "18:30", "고르너 협곡", "Gorner Gorge", "Sightseeing", 5, gmap("Gorner Gorge"), "", "", "역동적인 빙하 물줄기 탐험", 46.0115, 7.7415, "도보 (15분)", "박물관 관람"],
        ["18:30", "21:00", "저녁: 윔퍼", "Whymper-Stube", "Food", 60, gmap("Whymper-Stube Zermatt"), "", "", "전통 샬레 분위기 정식", 46.0211, 7.7481, "도보", "Schäferstube"],
        ["21:00", "23:59", "휴식", "Zermatt Chalet", "Accommodation", 0, gmap("Zermatt Village"), "", "", "취침", 46.0236, 7.7487, "도보", "마을 온천"]
    ],
    # Day 8: Interlaken Lakes & Falls
    [
        ["00:00", "08:00", "수면", "Zermatt Chalet", "Accommodation", 0, gmap("Zermatt Village"), "", "", "", 46.0236, 7.7487, "", ""],
        ["08:00", "11:00", "인터라켄 이동", "Interlaken Ost", "Transport", 45, gmap("Interlaken Ost Station"), "", "", "툰 호수 풍경 감상", 46.6904, 7.8692, "기차: Zermatt ➔ Interlaken", "연착 시 West역"],
        ["11:00", "12:30", "체크인", "Hotel Interlaken", "Accommodation", 160, gmap("Hotel Interlaken"), "", "", "중심가 안전 숙소", 46.6865, 7.8635, "도보", ""],
        ["12:30", "15:30", "브리엔츠 유람선", "Lake Brienz", "Sightseeing", 35, gmap("Lake Brienz Cruise"), "", "", "에메랄드빛 호수 체험", 46.6904, 7.8692, "유람선", "툰 호수 유람선"],
        ["15:30", "18:00", "발렌베르크 박물관", "Ballenberg", "Sightseeing", 25, gmap("Ballenberg Museum"), "https://www.ballenberg.ch/en/", "", "스위스 전통 가옥 박물관", 46.7511, 8.0835, "기차+버스", "라우터브루넨 투어"],
        ["18:00", "20:30", "하더쿨름 일몰", "Harder Kulm", "Food", 55, gmap("Harder Kulm"), "", "", "일몰 전망 민속 공연 감상", 46.6975, 7.8555, "푸니쿨라", "마을 내 레스토랑"],
        ["20:30", "23:59", "휴식", "Hotel Interlaken", "Accommodation", 0, gmap("Hotel Interlaken"), "", "", "취침", 46.6865, 7.8635, "도보", "호수변 산책"]
    ],
    # Day 9: Interlaken Jungfrau
    [
        ["00:00", "08:00", "수면", "Hotel Interlaken", "Accommodation", 0, gmap("Hotel Interlaken"), "", "", "", 46.6865, 7.8635, "", ""],
        ["08:00", "13:30", "융프라우요흐", "Top of Europe", "Sightseeing", 130, gmap("Jungfraujoch"), "", "", "만년설과 얼음궁전 투어", 46.5475, 7.9821, "아이거 익스프레스", "쉴트호른"],
        ["13:30", "15:30", "점심: 그린델발트", "Grindelwald First", "Food", 40, gmap("Grindelwald First"), "", "", "클리프 워크 및 점심", 46.6241, 8.0315, "기차", "라우터브루넨 미식"],
        ["15:30", "18:30", "라우터브루넨", "Staubbach Falls", "Sightseeing", 0, gmap("Lauterbrunnen"), "", "", "72개 폭포 마을 탐방", 46.5955, 7.9075, "기차 (20분)", "인터라켄 서역 쇼핑"],
        ["18:30", "21:30", "저녁: 퐁뒤 빌라", "Fondue Villa", "Food", 65, gmap("Fondue Villa Interlaken"), "", "", "무제한 퐁뒤 & 정원 다이닝", 46.6835, 7.8515, "도보", "Taverne"],
        ["21:30", "23:59", "휴식", "Hotel Interlaken", "Accommodation", 0, gmap("Hotel Interlaken"), "", "", "취침", 46.6865, 7.8635, "도보", "호수변 야경"]
    ],
    # Day 10: Milan Fashion & Murals
    [
        ["00:00", "08:30", "수면", "Hotel Interlaken", "Accommodation", 0, gmap("Hotel Interlaken"), "", "", "", 46.6865, 7.8635, "", ""],
        ["08:30", "14:00", "밀라노행 기차", "Milan Centrale", "Transport", 70, gmap("Milano Centrale"), "", "", "EC 직행 열차 이용", 45.4862, 9.2041, "유로시티: Spiez ➔ Milano", "버스 이용"],
        ["14:00", "15:00", "체크인", "iQ Hotel Milano", "Accommodation", 170, gmap("iQ Hotel Milano"), "", "", "현대적 시스템 숙소", 45.4845, 9.2025, "도보", ""],
        ["15:00", "17:00", "Ortica 벽화 지구", "Ortica District", "Sightseeing", 0, gmap("Street Art Ortica Milan"), "", "", "밀라노 역사 담은 벽화 마을", 45.4715, 9.2385, "트램 5번 (20분)", "브레라 지구"],
        ["17:00", "19:00", "꼬르소 꼬모 10", "10 Corso Como", "Shopping", 0, gmap("10 Corso Como"), "", "", "[유튜브] 패션/갤러리 성지", 45.4831, 9.1885, "메트로: Dateo ➔ Garibaldi", "명품 거리 투어"],
        ["19:30", "21:30", "저녁: 라 스페셜리타", "La Specialità", "Food", 45, gmap("Ristorante La Specialita Milan"), "", "", "[유튜브] 1인 1판 얇은 피자", 45.4615, 9.2145, "택시", "Paper Moon"],
        ["21:30", "23:59", "나빌리 아페리티보", "Navigli", "Food", 25, gmap("Navigli District"), "", "", "운하변 식전주 문화", 45.4515, 9.1755, "메트로", "Bar Basso"]
    ],
    # Day 11: Milan Art & Opera
    [
        ["00:00", "08:30", "수면", "iQ Hotel Milano", "Accommodation", 0, gmap("iQ Hotel Milano"), "", "", "", 45.4845, 9.2025, "", ""],
        ["08:30", "10:30", "포트레이트 조식", "Portrait Milano", "Food", 50, gmap("Portrait Milano"), "", "", "[유튜브] 2024 최고 조식", 45.4685, 9.1945, "메트로", "Marchesi 1824"],
        ["10:30", "12:30", "두오모 루프탑", "Duomo di Milano", "Sightseeing", 20, gmap("Duomo di Milano"), "", "", "첨탑 위 걷기 체험 필수", 45.4641, 9.1919, "도보", "갤러리아 투어"],
        ["12:30", "14:30", "최후의 만찬", "Cenacolo Vinciano", "Sightseeing", 15, gmap("The Last Supper Milan"), "https://cenacolovinciano.org/", "", "다빈치 걸작 관람 (예약 필수)", 45.4659, 9.1709, "메트로: Duomo ➔ Cadorna", "브레라 미술관"],
        ["14:30", "16:30", "점심: 루바르", "LùBar", "Food", 45, gmap("LuBar Milan"), "", "", "[유튜브] 온실 속 시칠리아 미식", 45.4725, 9.2015, "메트로", "Ratanà"],
        ["16:30", "18:30", "브레라 미술관", "Pinacoteca di Brera", "Sightseeing", 15, gmap("Pinacoteca di Brera"), "", "", "이탈리아 회화의 정수 관람", 45.4719, 9.1879, "도보", "쇼핑 거리 투어"],
        ["18:30", "21:30", "라 스칼라 공연", "Teatro alla Scala", "Sightseeing", 100, gmap("Teatro alla Scala"), "https://www.teatroallascala.org/en/", "", "세계 최고 오페라 하우스 공연", 45.4675, 9.1895, "도보", "나빌리 야경 투어"],
        ["21:30", "23:59", "저녁: 페이퍼 문", "Paper Moon", "Food", 80, gmap("Paper Moon Giardino"), "", "", "[유튜브] 30년 단골 피날레", 45.4695, 9.1955, "도보", "iQ Hotel 바"]
    ],
    # Day 12: Venice Biennale & Canal
    [
        ["00:00", "08:30", "수면", "iQ Hotel Milano", "Accommodation", 0, gmap("iQ Hotel Milano"), "", "", "", 45.4845, 9.2025, "", ""],
        ["08:30", "11:30", "베네치아 이동", "Venice S. Lucia", "Transport", 40, gmap("Venezia Santa Lucia"), "", "", "이탈리아 동부 열차 여행", 45.4411, 12.3211, "프레차로사: Milano ➔ Venice", "Italo"],
        ["11:30", "13:00", "체크인", "Hotel Giovanelli", "Accommodation", 230, gmap("Hotel Palazzo Giovanelli"), "", "", "운하 위 고풍 숙소", 45.4415, 12.3285, "바포레토", ""],
        ["13:00", "16:30", "베네치아 비엔날레", "Giardini Biennale", "Sightseeing", 30, gmap("Giardini della Biennale"), "https://www.labiennale.org/en", "", "2026 현대 미술의 정수", 45.4285, 12.3575, "바포레토 Line 1", "두칼레 궁전"],
        ["16:30", "18:30", "침수 지하 묘지", "San Zaccaria", "Sightseeing", 5, gmap("San Zaccaria Venice"), "", "", "신비로운 물속 지하 공간", 45.4345, 12.3425, "도보", "리알토 다리"],
        ["18:30", "21:00", "저녁: 알 티몬", "Al Timon", "Food", 50, gmap("Al Timon Venice"), "", "", "배 위에서 즐기는 치케티", 45.4451, 12.3311, "도보", "Antiche Carampane"],
        ["21:00", "23:59", "곤돌라 야경", "Grand Canal", "Sightseeing", 80, gmap("Grand Canal Venice"), "", "", "낭만적인 곤돌라 마무리", 45.4345, 12.3385, "곤돌라", "산 마르코 야경"]
    ],
    # Day 13: Bologna Mural & Market
    [
        ["00:00", "08:30", "수면", "Hotel Giovanelli", "Accommodation", 0, gmap("Hotel Palazzo Giovanelli"), "", "", "", 45.4415, 12.3285, "", ""],
        ["08:30", "11:00", "볼로냐 이동", "Bologna Centrale", "Transport", 30, gmap("Bologna Centrale"), "", "", "미식의 수도 이동", 44.5058, 11.3418, "프레차로사: Venice ➔ Bologna", "Italo"],
        ["11:00", "12:30", "체크인", "I Portici Hotel", "Accommodation", 150, gmap("I Portici Hotel Bologna"), "", "", "회랑 아래 숙소", 44.5015, 11.3445, "도보", ""],
        ["12:30", "16:30", "벽화 마을 도차", "Dozza Village", "Sightseeing", 15, gmap("Dozza Imolese Mural Village"), "", "", "마을 전체가 갤러리인 벽화 마을", 44.3591, 11.6285, "기차+버스 (1시간)", "아르키진나시오 투어"],
        ["16:30", "18:30", "콰드릴라테로 시장", "Quadrilatero", "Food", 35, gmap("Quadrilatero Bologna"), "", "", "중세 미식 시장 골목 탐방", 44.4935, 11.3445, "도보", "메르카토 디 메조"],
        ["18:30", "21:30", "저녁: 보테가", "All'Osteria Bottega", "Food", 65, gmap("All'Osteria Bottega Bologna"), "", "", "에밀리아 로마냐 정수", 44.4915, 11.3345, "도보", "Osteria dell'Orsa"],
        ["21:30", "23:59", "휴식", "I Portici Hotel", "Accommodation", 0, gmap("I Portici Hotel Bologna"), "", "", "취침", 44.5015, 11.3445, "도보", "마조레 광장"]
    ],
    # Day 14: Bologna Towers & Parks
    [
        ["00:00", "08:30", "수면", "I Portici Hotel", "Accommodation", 0, gmap("I Portici Hotel Bologna"), "", "", "", 44.5015, 11.3445, "", ""],
        ["08:30", "12:00", "산 루카 하이킹", "Sanctuary of San Luca", "Sightseeing", 0, gmap("Sanctuary of San Luca"), "", "", "세계 최장 3.8km 회랑 걷기", 44.4795, 11.2975, "도보/버스", "San Luca Express"],
        ["12:00", "14:00", "점심: 스폴리아 리나", "Sfoglia Rina", "Food", 35, gmap("Sfoglia Rina Bologna"), "", "", "최고 평점 생면 파스타", 44.4945, 11.3445, "도보", "Mercato delle Erbe"],
        ["14:00", "16:30", "시계탑 전망대", "Torre dell'Orologio", "Sightseeing", 10, gmap("Torre dell'Orologio Bologna"), "", "", "볼로냐 시내 파노라마 조망", 44.4935, 11.3425, "도보", "아시넬리 타워 (재개장시)"],
        ["16:30", "18:30", "살라보르사 고대 유적", "Salaborsa", "Sightseeing", 0, gmap("Biblioteca Salaborsa"), "", "", "도서관 바닥 유리 아래 고대 로마 유적", 44.4945, 11.3425, "도보", "현대 미술관"],
        ["18:30", "21:30", "저녁: 비아 세라", "Trattoria Via Serra", "Food", 60, gmap("Trattoria di Via Serra"), "", "", "슬로푸드 예약 필수 맛집", 44.5055, 11.3415, "도보", "Trattoria da Me"],
        ["21:30", "23:59", "휴식", "I Portici Hotel", "Accommodation", 0, gmap("I Portici Hotel Bologna"), "", "", "취침", 44.5015, 11.3445, "도보", "넵투누스 분수"]
    ],
    # Day 15: Florence Renaissance & Fashion
    [
        ["00:00", "08:30", "수면", "I Portici Hotel", "Accommodation", 0, gmap("I Portici Hotel Bologna"), "", "", "", 44.5015, 11.3445, "", ""],
        ["08:30", "10:30", "피렌체 이동", "Florence S.M.N", "Transport", 25, gmap("Firenze Santa Maria Novella"), "", "", "30분 고속열차 이동", 43.7765, 11.2478, "프레차로사", "Italo"],
        ["10:30", "12:00", "체크인", "Hotel Spadai", "Accommodation", 220, gmap("Hotel Spadai"), "", "", "두오모 도보 2분 안전 숙소", 43.7735, 11.2555, "도보", ""],
        ["12:00", "14:00", "점심: 카살링가", "Trattoria Casalinga", "Food", 40, gmap("Trattoria Casalinga Florence"), "", "", "현지인 1위 토스카나 가정식", 43.7675, 11.2485, "도보", "Trattoria Mario"],
        ["14:00", "17:30", "우피치 미술관", "Uffizi Gallery", "Sightseeing", 30, gmap("Uffizi Gallery"), "", "", "르네상스 걸작 핵심 투어", 43.7677, 11.2553, "도보", "베키오 궁전"],
        ["17:30", "19:00", "구찌 가든 투어", "Gucci Garden", "Sightseeing", 15, gmap("Gucci Garden Florence"), "", "", "럭셔리 아트 및 박물관 투어", 43.7695, 11.2561, "도보", "베키오 다리 산책"],
        ["19:00", "21:30", "저녁: 부카 라피", "Buca Lapi", "Food", 95, gmap("Buca Lapi Florence"), "", "", "피렌체 최고 스테이크 명소", 43.7725, 11.2515, "도보", "Regina Bistecca"],
        ["21:30", "23:59", "와인 윈도우 보물찾기", "Wine Windows", "Sightseeing", 10, gmap("Babae Florence"), "", "", "구멍을 통해 와인 받는 이색 체험", 43.7675, 11.2485, "도보", "시뇨리아 광장 야경"]
    ],
    # Day 16: Florence Gardens & David
    [
        ["00:00", "08:30", "수면", "Hotel Spadai", "Accommodation", 0, gmap("Hotel Spadai"), "", "", "", 43.7735, 11.2555, "", ""],
        ["08:30", "11:30", "아카데미아 다비드", "David Statue", "Sightseeing", 20, gmap("Accademia Gallery David"), "", "", "미켈란젤로 다비드상 실물 관람", 43.7769, 11.2585, "도보", "두오모 등정"],
        ["11:30", "13:30", "보볼리 정원", "Boboli Gardens", "Sightseeing", 15, gmap("Boboli Gardens"), "", "", "메디치 가문의 대규모 정원 산책", 43.7651, 11.2501, "도보", "피티 궁전"],
        ["13:30", "15:00", "점심: 중앙시장", "Mercato Centrale", "Food", 35, gmap("Mercato Centrale Florence"), "", "", "2층 푸드홀 로컬 미식", 43.7765, 11.2515, "도보", "샌드위치 (Vinaio)"],
        ["15:00", "17:30", "올트라르노 투어", "Oltrarno Art", "Sightseeing", 0, gmap("Oltrarno Street Art Florence"), "", "", "장인 공방과 거리 예술 탐방", 43.7675, 11.2485, "도보", "산타 마리아 노벨라 약국"],
        ["17:30", "19:30", "미켈란젤로 광장", "Piazzale Michelangelo", "Sightseeing", 0, gmap("Piazzale Michelangelo"), "", "", "피렌체 전체가 보이는 일몰", 43.7629, 11.2651, "버스 (12번/13번)", "바르디니 정원"],
        ["19:30", "22:00", "저녁: 레지나", "Regina Bistecca", "Food", 90, gmap("Regina Bistecca"), "", "", "품격 있는 스테이크 다이닝", 43.7731, 11.2565, "도보", "La Giostra"],
        ["22:00", "23:59", "휴식", "Hotel Spadai", "Accommodation", 0, gmap("Hotel Spadai"), "", "", "취침", 43.7735, 11.2555, "도보", "베키오 다리 산책"]
    ],
    # Day 17: Rome YouTube & Murals
    [
        ["00:00", "08:30", "수면", "Hotel Spadai", "Accommodation", 0, gmap("Hotel Spadai"), "", "", "", 43.7735, 11.2555, "", ""],
        ["08:30", "11:30", "로마 이동", "Rome Termini", "Transport", 50, gmap("Roma Termini"), "", "", "이탈리아 남북 종단 열차", 41.9014, 12.5020, "프레차로사: Florence ➔ Rome", "Italo"],
        ["11:30", "12:30", "체크인", "The RomeHello", "Accommodation", 110, gmap("The RomeHello"), "", "", "청결 점수 9.5 검증 숙소", 41.9035, 12.4945, "메트로: Termini ➔ Repubblica", ""],
        ["12:30", "15:00", "Tor Marancia 벽화", "Tor Marancia Mural", "Sightseeing", 0, gmap("Tor Marancia Street Art"), "", "", "거대 예술 벽화 단지 투어", 41.8585, 12.4955, "버스 160번 (30분)", "트레비 분수 투어"],
        ["15:00", "17:30", "스페인 계단 & 조올리띠", "Giolitti", "Food", 10, gmap("Giolitti Rome"), "", "", "[유튜브] 럭셔리 산책과 쌀맛 젤라또", 41.9015, 12.4775, "메트로", "스페인 광장 쇼핑"],
        ["17:30", "19:30", "저녁: 로스치올리", "Roscioli", "Food", 75, gmap("Roscioli Salumeria Rome"), "", "", "인생 카르보나라 성지 (예약 필수)", 41.8942, 12.4743, "도보", "Tonnarello"],
        ["19:30", "21:30", "산타 루치아 저녁", "Santa Lucia", "Food", 80, gmap("Ristorante Santa Lucia Rome"), "", "", "[유튜브] 영화 촬영지 테라스", 41.8995, 12.4725, "도보", "나보나 광장"],
        ["21:30", "23:59", "나보나 야경 투어", "Piazza Navona", "Sightseeing", 0, gmap("Piazza Navona"), "", "", "밤에 더 화려한 광장 산책", 41.8992, 12.4731, "도보", "트레비 분수"]
    ],
    # Day 18: Rome Vatican & Finale
    [
        ["00:00", "08:30", "수면", "The RomeHello", "Accommodation", 0, gmap("The RomeHello"), "", "", "", 41.9035, 12.4945, "", ""],
        ["08:30", "12:30", "바티칸 박물관", "Vatican City", "Sightseeing", 30, gmap("Vatican Museums"), "", "", "인류 최고의 보물창고 관람", 41.9065, 12.4535, "메트로: Repubblica ➔ Ottaviano", "보르게세 미술관"],
        ["12:30", "14:30", "점심: 본치 피자", "Bonci Pizzarium", "Food", 25, gmap("Bonci Pizzarium"), "", "", "최고의 로마식 조각 피자", 41.9075, 12.4511, "도보", "Armando al Pantheon"],
        ["14:30", "17:00", "보르게세 동물원", "Bioparco di Roma", "Sightseeing", 25, gmap("Bioparco di Roma"), "https://www.bioparco.it/en/", "", "보르게세 공원 내 역사적 동물원", 41.9175, 12.4855, "트램 19번", "천사의 성 관람"],
        ["17:00", "19:00", "괴물의 집", "Palazzo Zuccari", "Sightseeing", 0, gmap("Palazzo Zuccari Rome"), "", "", "기괴한 조각의 숨은 명소", 41.9055, 12.4835, "도보", "트라스테베레 산책"],
        ["19:00", "21:30", "저녁: 다 엔조", "Da Enzo al 29", "Food", 50, gmap("Da Enzo al 29 Rome"), "", "", "예약 불가 오픈런 미식 마무리", 41.8885, 12.4775, "도보/트램", "Tonnarello"],
        ["21:30", "23:59", "공항 이동", "Fiumicino Airport", "Transport", 14, gmap("Rome Fiumicino Airport"), "", "", "무사 귀국 수속 시작", 41.8003, 12.2389, "레오나르도 익스프레스", "우버 (€50)"]
    ]
]

header = ["Date", "Day", "StartTime", "EndTime", "Activity", "Location", "Category", "Cost", "MapLink", "BookingLink", "OfficialLink", "Description", "Lat", "Lng", "Transit", "PlanB"]

for i, day_events in enumerate(days_data):
    file_path = os.path.join(base_dir, f'day{i+1}.csv')
    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        day_num = i + 1
        if day_num <= 14:
            date_str = f"2026-05-{17+day_num:02d}"
        else:
            date_str = f"2026-06-{day_num-14:02d}"
        for e in day_events:
            writer.writerow([date_str, day_num] + e)

print("18 CSV files with reinforced sightseeing data generated successfully.")
