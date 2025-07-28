import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import "./App.css";
import 'leaflet/dist/leaflet.css';

// --- (الخطوة 1): إضافة بيانات الترجمة ---
const translations = {
  en: {
    galleryTitle: "Jordan's Wonders Gallery",
    smartTourJo: "SmartTour.jo",
    navHome: "Home",
    navFeatures: "Features",
    navExplore: "Explore",
    navAR: "AR Guide",
    navMap: "Map",
    navInsights: "Insights",
    heroTitle: "Explore Jordan Smarter",
    heroSubtitle: "Unlock Jordan's hidden treasures with AI-powered recommendations, AR experiences, and real-time insights that transform your journey into an unforgettable adventure.",
    heroBtnStart: "Start Your Smart Journey",
    heroBtnMap: "View Interactive Map",
    featuresTitle: "Smart Features for Smart Travelers",
    featuresSubtitle: "Experience Jordan like never before with AI-powered recommendations and real-time insights.",
    feature1Title: "AI Itinerary Suggestions",
    feature1Desc: "Get personalized travel plans based on your preferences, time, and interests.",
    feature2Title: "AR Views",
    feature2Desc: "Augmented reality experiences that bring historical sites to life.",
    feature3Title: "IoT Sensors",
    feature3Desc: "Real-time data on weather, crowds, and optimal visiting times.",
    exploreTitle: "Discover Jordan Your Way",
    exploreSubtitle: "Find experiences that match your interests, from ancient wonders to breathtaking nature.",
    arTitle: "AR Experience",
    arSubtitle: "Bring Jordan's history to life with our Augmented Reality guide.",
    arBtnLaunch: "Launch AR Guide",
    mapTitle: "More interactive with Featured Destinations",
    mapSubtitle: "Discover Jordan's magnificent destinations with our interactive map featuring all major tourist attractions.",
    mapLegend: "Legend",
    mapDestinations: "Featured Destinations",
    insightsTitle: "Live Smart Insights",
    insightsSubtitle: "Real-time data to help you plan the perfect visit.",
    temp: "Temperature",
    humidity: "Humidity",
    crowd: "Crowd Level",
    air: "Air Quality",
    footerTitle: "SmartTour.jo",
    footerDesc: "Your intelligent companion for exploring Jordan's wonders. Experience the future of travel with AI-powered insights and real-time data.",
    quickLinks: "Quick Links",
    rightsReserved: "© 2025 SmartTour.jo. All rights reserved.",
    chatbotAsk: "Ask our AI Guide!",
    chatbotTitle: "SmartTour.jo AI",
    chatbotPlaceholder: "Ask me anything...",
  },
  ar: {
    galleryTitle: "معرض عجائب الأردن",
    smartTourJo: "سمارت تور.جو",
    navHome: "الرئيسية",
    navFeatures: "الميزات",
    navExplore: "استكشف",
    navAR: "دليل الواقع المعزز",
    navMap: "الخريطة",
    navInsights: "بيانات حية",
    heroTitle: "استكشف الأردن بذكاء",
    heroSubtitle: "اكتشف كنوز الأردن الخفية مع توصيات الذكاء الاصطناعي، تجارب الواقع المعزز، والبيانات الحية التي تحول رحلتك إلى مغامرة لا تُنسى.",
    heroBtnStart: "ابدأ رحلتك الذكية",
    heroBtnMap: "عرض الخريطة التفاعلية",
    featuresTitle: "ميزات ذكية لمسافرين أذكياء",
    featuresSubtitle: "عش تجربة الأردن كما لم يحدث من قبل مع توصيات الذكاء الاصطناعي والبيانات الحية.",
    feature1Title: "اقتراحات خطة الرحلة",
    feature1Desc: "احصل على خطط سفر مخصصة بناءً على تفضيلاتك ووقتك واهتماماتك.",
    feature2Title: "مشاهد الواقع المعزز",
    feature2Desc: "تجارب واقع معزز تعيد إحياء المواقع التاريخية.",
    feature3Title: "حساسات إنترنت الأشياء",
    feature3Desc: "بيانات حية عن الطقس والازدحام وأفضل أوقات الزيارة.",
    exploreTitle: "اكتشف الأردن على طريقتك",
    exploreSubtitle: "ابحث عن تجارب تناسب اهتماماتك، من العجائب القديمة إلى الطبيعة الخلابة.",
    arTitle: "تجربة الواقع المعزز",
    arSubtitle: "أعد تاريخ الأردن إلى الحياة مع دليل الواقع المعزز الخاص بنا.",
    arBtnLaunch: "شغّل دليل الـ AR",
    mapTitle: "أكثر تفاعلية مع الوجهات المميزة",
    mapSubtitle: "اكتشف وجهات الأردن الرائعة مع خريطتنا التفاعلية التي تضم جميع مناطق الجذب السياحي الرئيسية.",
    mapLegend: "مفتاح الخريطة",
    mapDestinations: "الوجهات المميزة",
    insightsTitle: "بيانات ذكية حية",
    insightsSubtitle: "بيانات محدّثة لمساعدتك في التخطيط للزيارة المثالية.",
    temp: "درجة الحرارة",
    humidity: "الرطوبة",
    crowd: "مستوى الازدحام",
    air: "جودة الهواء",
    footerTitle: "سمارت تور.جو",
    footerDesc: "رفيقك الذكي لاستكشاف عجائب الأردن. عش تجربة مستقبل السفر مع رؤى مدعومة بالذكاء الاصطناعي وبيانات حية.",
    quickLinks: "روابط سريعة",
    rightsReserved: "© 2025 سمارت تور.جو. جميع الحقوق محفوظة.",
    chatbotAsk: "اسأل دليلنا الذكي!",
    chatbotTitle: "SmartTour.jo AI",
    chatbotPlaceholder: "اسألني أي شيء...",
  }
};


const GalleryModal = ({ isOpen, onClose, images, lang }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-900/80 border border-purple-500/30 rounded-2xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white font-poppins">{translations[lang].galleryTitle}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl">&times;</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="rounded-lg overflow-hidden group relative">
                            <img src={img.src} alt={img.alt} className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                                <p className="text-white text-sm font-semibold">{img.alt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const App = () => {
    const [language, setLanguage] = useState('en');
    const t = (key) => translations[language][key] || key;

    const [sensorData, setSensorData] = useState({ temperature: 28, humidity: 45, crowdLevel: 'Medium', airQuality: 'Good' });
    const [previousSensorData, setPreviousSensorData] = useState({ temperature: 28, humidity: 45, crowdLevel: 'Medium', airQuality: 'Good' });
    const [isDataUpdating, setIsDataUpdating] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [chatbotLoaded, setChatbotLoaded] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVisible, setIsVisible] = useState({});
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLegendOpen, setIsLegendOpen] = useState(true);

    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const exploreRef = useRef(null);
    const mapRef = useRef(null);
    const insightsRef = useRef(null);
    const chatEndRef = useRef(null);
    const arRef = useRef(null);

    useEffect(() => {
        document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });
    }, []);

    const jordanDestinations = [
        { id: 'petra', name: 'Petra', position: [30.3285, 35.4444], description: 'The ancient rose-red city...', type: 'historical', icon: '🏛️', details: 'UNESCO World Heritage Site...' },
        { id: 'wadi-rum', name: 'Wadi Rum', position: [29.5759, 35.4208], description: 'Valley of the Moon', type: 'nature', icon: '🏜️', details: 'Protected desert wilderness...' },
        { id: 'dead-sea', name: 'Dead Sea', position: [31.5553, 35.4732], description: 'Lowest point on Earth', type: 'nature', icon: '🌊', details: 'Effortless floating...' },
        { id: 'jerash', name: 'Jerash', position: [32.2814, 35.8936], description: 'Preserved Roman ruins', type: 'historical', icon: '🏛️', details: 'Best-preserved Roman town' },
        { id: 'amman', name: 'Amman', position: [31.9454, 35.9284], description: 'The capital city', type: 'city', icon: '🏙️', details: 'Ancient citadel...' },
        { id: 'irbid', name: 'Irbid', position: [32.5555, 35.8500], description: 'A city in northern Jordan', type: 'city', icon: '🏙️', details: 'Known for its cultural heritage...' },
        { id: 'aqaba', name: 'Aqaba', position: [29.5328, 35.0076], description: 'Red Sea resort', type: 'nature', icon: '🏖️', details: 'Diving and coral reefs' },
        { id: 'mount-nebo', name: 'Mount Nebo', position: [31.7690, 35.7272], description: 'Sacred biblical site...', type: 'religious', icon: '⛰️', details: 'Panoramic views...' },
        { id: 'dana-reserve', name: 'Dana Biosphere Reserve', position: [30.6774, 35.6270], description: 'Jordan\'s largest nature reserve...', type: 'nature', icon: '🌿', details: 'Rare wildlife...' },
        { id: 'wadi-mujib', name: 'Wadi Mujib', position: [31.5000, 35.6000], description: 'Canyon with stunning views', type: 'nature', icon: '🏞️', details: 'Adventure activities like canyoning...' },
        { id: 'baptism-site', name: 'Baptism Site', position: [31.7000, 35.5000], description: 'Religious significance', type: 'religious', icon: '🕌', details: 'Where Jesus was baptized...' },
        { id: 'ajloun-castle', name: 'Ajloun Castle', position: [32.3333, 35.7333], description: 'Medieval Islamic castle', type: 'historical', icon: '🏰', details: 'Strategic hilltop location...' },
        { id: 'mafraq', name: 'Mafraq', position: [32.3400, 36.2100], description: 'Gateway to northern Jordan', type: 'city', icon: '🏙️', details: 'Known for its historical significance...' },
        { id: 'karak-castle', name: 'Karak Castle', position: [31.1833, 35.7000], description: 'Crusader castle', type: 'historical', icon: '🏰', details: 'One of the largest castles in the Levant...' },
        { id: 'salt', name: 'Salt', position: [32.0000, 35.7500], description: 'Historical city with Ottoman architecture', type: 'city', icon: '🏙️', details: 'Known for its unique architecture...' },
        { id: 'azraq-oasis', name: 'Azraq Oasis', position: [31.9000, 36.8000], description: 'Desert oasis with rich biodiversity', type: 'nature', icon: '🌵', details: 'Home to migratory birds...' },
        { id: 'um-qaes', name: 'Um Qais', position: [32.6000, 35.7000], description: 'Ancient Greco-Roman city', type: 'historical', icon: '🏛️', details: 'Stunning views of the Golan Heights...' }
    ];

    const galleryImages = [
        { src: 'https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg', alt: 'Petra Treasury' },
        { src: 'https://images.pexels.com/photos/3258242/pexels-photo-3258242.jpeg', alt: 'Wadi Rum Desert' },
        { src: 'https://images.pexels.com/photos/30129079/pexels-photo-30129079.png', alt: 'Dead Sea Salt Formations' },
        { src: 'https://images.pexels.com/photos/18717602/pexels-photo-18717602.jpeg', alt: 'Jerash Colonnaded Street' },
        { src: 'https://images.pexels.com/photos/31159570/pexels-photo-31159570.jpeg', alt: 'Wadi Mujib Canyon' },
        { src: 'https://images.pexels.com/photos/14986348/pexels-photo-14986348.jpeg', alt: 'Baptism Site' },
    ];

    const exploreData = [
        { title: '🏛️ Petra: The Rose City', description: 'Explore the Treasury, the Monastery, and the ancient tombs of this UNESCO World Heritage wonder.', image: 'https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg' },
        { title: '🏜️ Wadi Rum: The Martian Desert', description: 'Experience Bedouin culture, stunning sunsets, and Jeep tours in this vast desert landscape.', image: 'https://images.pexels.com/photos/3258242/pexels-photo-3258242.jpeg' },
        { title: '🌊 Dead Sea: The Lowest Point on Earth', description: 'Float effortlessly in its hypersaline waters and benefit from its therapeutic mineral-rich mud.', image: 'https://images.pexels.com/photos/30129079/pexels-photo-30129079.png' },
        { title: '🧗 Adventure in Canyons', description: 'Experience thrilling adventures like Canyoning in Wadi Mujib and diving in the Red Sea at Aqaba.', image: 'https://images.pexels.com/photos/31159570/pexels-photo-31159570.jpeg' }
    ];

    const createCustomIcon = (type, emoji) => {
        return L.divIcon({
            html: `<span class="marker-emoji">${emoji}</span>`,
            className: 'custom-styled-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
    };

   const sendMessage = async (e) => {
    e.preventDefault();
    const inputElement = e.target.elements.message;
    const userInput = inputElement.value.trim();
    if (!userInput) return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    inputElement.value = '';
    setIsTyping(true);

    const webhookUrl = "https://eoqcut7650b0pp6.m.pipedream.net";

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
        });

        if (!response.ok) throw new Error(`Network error: ${response.status}`);
        
        const data = await response.json();
        const botResponse = data.reply || "عذرًا، لم أتمكن من الحصول على رد.";

        setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
        console.error("Chat API Error:", error);
        setMessages(prev => [
            ...prev,
            { sender: 'bot', text: "❌ فشل الاتصال بالخادم، تأكد من رابط الـ Webhook." }
        ]);
    } finally {
        setIsTyping(false);
    }
};

useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);


    const updateInsights = async () => {
        const apiKey = '91859b46e4ef01b5415a2f8b1ddbfac1';
        const updateUI = (data) => {
            setSensorData(prev => ({ ...prev, temperature: Math.round(data.main.temp), humidity: data.main.humidity }));
        };
        try {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error('Weather API error');
                    const data = await response.json();
                    updateUI(data);
                },
                async () => {
                    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=Amman&appid=${apiKey}&units=metric`;
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error('Default weather API error');
                    const data = await response.json();
                    updateUI(data);
                }
            );
        } catch (error) { console.error('Fetch weather error:', error); }
    };

    useEffect(() => {
        updateInsights();
        const interval = setInterval(() => {
            setIsDataUpdating(true);
            setPreviousSensorData(sensorData);
            setTimeout(() => {
                updateInsights();
                setSensorData(prev => ({
                    ...prev,
                    crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                    airQuality: ['Good', 'Moderate', 'Excellent'][Math.floor(Math.random() * 3)]
                }));
                setIsDataUpdating(false);
            }, 300);
        }, 300000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollPercentage = (scrollY / documentHeight) * 100;
            setScrollProgress(scrollPercentage);
            setShowBackToTop(scrollY > 300);
            const sections = [
                { id: 'home', ref: heroRef }, { id: 'features', ref: featuresRef },
                { id: 'explore', ref: exploreRef }, { id: 'map', ref: mapRef },
                { id: 'ar', ref: arRef }, { id: 'insights', ref: insightsRef }
            ];
            for (let section of sections) {
                if (section.ref.current) {
                    const rect = section.ref.current.getBoundingClientRect();
                    const isInViewport = rect.top < windowHeight * 0.8 && rect.bottom > 0;
                    setIsVisible(prev => ({ ...prev, [section.id]: isInViewport }));
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        setActiveSection(section.id);
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const refs = { home: heroRef, features: featuresRef, explore: exploreRef, map: mapRef, ar: arRef, insights: insightsRef };
        if (refs[sectionId]?.current) {
            refs[sectionId].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="min-h-screen bg-gray-900 text-white" style={{ fontFamily: language === 'ar' ? "'Tajawal', sans-serif" : "'Inter', sans-serif" }}>
            <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-xl z-50 border-b border-gray-800/50 transition-all duration-300 shadow-xl">
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 via-purple-400 to-blue-600 transition-all duration-300 ease-out shadow-lg shadow-purple-500/50" style={{ width: `${scrollProgress}%` }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-white hover:text-purple-400 transition-all duration-300 cursor-pointer font-poppins tracking-tight transform hover:scale-105" onClick={() => scrollToSection('home')}>
                                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow">Smart</span>
                                <span className="text-white ml-1">Tour.jo</span>
                            </h1>
                        </div>

                        <div className={`absolute md:static top-16 left-0 w-full md:w-auto bg-gray-900/95 md:bg-transparent shadow-lg md:shadow-none transition-all duration-300 ease-in-out ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
                            <div className="flex flex-col md:flex-row items-baseline space-y-4 md:space-y-0 md:space-x-1 p-4 md:p-0">
                                {[
                                    { id: 'home', label: t('navHome'), icon: '🏠' },
                                    { id: 'features', label: t('navFeatures'), icon: '⚡' },
                                    { id: 'explore', label: t('navExplore'), icon: '🗺️' },
                                    { id: 'ar', label: t('navAR'), icon: '🥽' },
                                    { id: 'map', label: t('navMap'), icon: '📍' },
                                    { id: 'insights', label: t('navInsights'), icon: '📊' }
                                ].map((item) => (
                                    <button key={item.id} onClick={() => { scrollToSection(item.id); setIsMenuOpen(false); }}
                                        className={`group w-full md:w-auto px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden font-inter transform hover:scale-105 ${activeSection === item.id ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-600/25 scale-105' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>
                                        <span className="relative z-10 flex items-center justify-center md:justify-start">
                                            <span className="mr-1 text-xs">{item.icon}</span>
                                            {item.label}
                                        </span>
                                        {activeSection !== item.id && (
                                            <><div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div></>
                                        )}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                                    className="group w-full md:w-auto px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden font-inter transform hover:scale-105 text-gray-300 hover:text-white hover:bg-gray-800/50"
                                >
                                    <span className="relative z-10 flex items-center justify-center md:justify-start">
                                        <span className="mr-1 text-xs">🌐</span>
                                        {language === 'en' ? 'العربية' : 'English'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-110">
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <section ref={heroRef} id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-indigo-900/60 z-10 animate-pulse"></div>
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000 parallax" style={{ backgroundImage: `url(https://images.pexels.com/photos/1631665/pexels-photo-1631665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`, transform: `translateY(${scrollProgress * 0.5}px) scale(1.1)` }}></div>
                    <div className="absolute inset-0 z-15">
                        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-float"></div>
                        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
                    </div>
                    <div className={`relative z-20 text-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible.home ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
                        <div className="animate-fade-in-up">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight font-poppins tracking-tight animate-glow">{t('heroTitle')}</h1>
                            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 max-w-4xl mx-auto leading-relaxed font-inter font-light">{t('heroSubtitle')}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button onClick={() => scrollToSection('features')} className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/30 font-inter relative overflow-hidden">
                                    <span className="relative z-10 flex items-center"><svg className="w-5 h-5 mx-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>{t('heroBtnStart')}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                </button>
                                <button onClick={() => scrollToSection('map')} className="group border-2 border-white/30 hover:border-white/60 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:bg-white/10 font-inter relative overflow-hidden">
                                    <span className="relative z-10 flex items-center"><svg className="w-5 h-5 mx-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{t('heroBtnMap')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"><div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div></div>
                    </div>
                </section>

                <section ref={featuresRef} id="features" className="py-20 bg-gray-900 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-poppins">{t('featuresTitle')}</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-inter">{t('featuresSubtitle')}</p>
                        </div>
                        <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{ animationDelay: '0.3s' }}>
                            {[{ icon: "🤖", title: t('feature1Title'), description: t('feature1Desc'), gradient: "from-purple-500/20 to-purple-700/20", borderColor: "border-purple-500/30", hoverGlow: "hover:shadow-purple-500/20" }, { icon: "🥽", title: t('feature2Title'), description: t('feature2Desc'), gradient: "from-blue-500/20 to-blue-700/20", borderColor: "border-blue-500/30", hoverGlow: "hover:shadow-blue-500/20" }, { icon: "📊", title: t('feature3Title'), description: t('feature3Desc'), gradient: "from-indigo-500/20 to-indigo-700/20", borderColor: "border-indigo-500/30", hoverGlow: "hover:shadow-indigo-500/20" }].map((feature, index) => (
                                <div key={index} className={`group bg-gradient-to-br ${feature.gradient} backdrop-blur-sm rounded-2xl p-8 hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border ${feature.borderColor} ${feature.hoverGlow} hover:shadow-2xl relative overflow-hidden animate-fade-in-up`} style={{ animationDelay: `${0.1 * index}s` }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">{feature.icon}</div>
                                        <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-purple-300 transition-colors font-poppins">{feature.title}</h3>
                                        <p className="text-gray-300 leading-relaxed font-inter group-hover:text-gray-200 transition-colors">{feature.description}</p>
                                        <div className="mt-6 w-full bg-gray-700/50 rounded-full h-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className={`h-full bg-gradient-to-r ${feature.gradient.replace('/20', '')} transition-all duration-1000 ease-out group-hover:w-full`} style={{ width: '0%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section ref={exploreRef} id="explore" className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-poppins">{t('exploreTitle')}</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-inter">{t('exploreSubtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {exploreData.map((item, index) => (
                                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
                                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-white mb-2 font-poppins">{item.title}</h3>
                                        <p className="text-gray-300 text-sm mb-4 font-inter">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section ref={arRef} id="ar" className="py-20 bg-gray-800/50 flex flex-col justify-center items-center">
                    <div className="container text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-poppins">{t('arTitle')}</h2>
                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">{t('arSubtitle')}</p>
                        <a href="ar.html" target="_blank" rel="noopener noreferrer" className="btn btn-primary">🥽 {t('arBtnLaunch')}</a>
                    </div>
                </section>

                <section ref={mapRef} id="map" className={`py-20 bg-gray-900 relative overflow-hidden transition-all duration-1000 ${isVisible.map ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-poppins">{t('mapTitle')}</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-inter">{t('mapSubtitle')}</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 shadow-2xl hover:shadow-purple-500/10">
                                    <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden">
                                        <MapContainer center={[31.2397, 36.2305]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: '12px' }} className="z-10" scrollWheelZoom={false}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                            {jordanDestinations.map((destination) => (
                                                <Marker key={destination.id} position={destination.position} icon={createCustomIcon(destination.type, destination.icon)}>
                                                    <Popup className="custom-popup">
                                                        <div className="p-2 min-w-[250px]">
                                                            <div className="flex items-center mb-2"><span className="text-2xl mr-2">{destination.icon}</span><h3 className="font-bold text-lg text-gray-800">{destination.name}</h3></div>
                                                            <p className="text-gray-600 mb-2 font-medium">{destination.description}</p>
                                                            <p className="text-sm text-gray-500 mb-3">{destination.details}</p>
                                                            <div className="flex items-center justify-between"><span className={`px-2 py-1 rounded-full text-xs font-medium ${destination.type === 'historical' ? 'bg-amber-100 text-amber-800' : destination.type === 'nature' ? 'bg-green-100 text-green-800' : destination.type === 'religious' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{destination.type.charAt(0).toUpperCase() + destination.type.slice(1)}</span><button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300">Learn More</button></div>
                                                        </div>
                                                    </Popup>
                                                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9}><div className="text-center"><div className="text-lg mb-1">{destination.icon}</div><div className="font-semibold">{destination.name}</div></div></Tooltip>
                                                </Marker>
                                            ))}
                                        </MapContainer>
                                        <div className="absolute top-4 right-4 z-[1000]">
                                            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20">
                                                <button onClick={() => setIsLegendOpen(!isLegendOpen)} className="w-full flex justify-between items-center p-2 text-white font-semibold focus:outline-none">
                                                    <span>{t('mapLegend')}</span>
                                                    <svg className={`w-5 h-5 transition-transform duration-300 ${isLegendOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isLegendOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="p-2 pt-0 text-xs text-gray-200 space-y-1 border-t border-white/10 mt-1">
                                                        <div className="flex items-center"><span className="mr-2">🏛️</span> Historical</div>
                                                        <div className="flex items-center"><span className="mr-2">🌊</span> Nature</div>
                                                        <div className="flex items-center"><span className="mr-2">🕌</span> Religious</div>
                                                        <div className="flex items-center"><span className="mr-2">🏙️</span> Cities</div>
                                                        <div className="flex items-center"><span className="mr-2">🏖️</span> Beaches</div>
                                                        <div className="flex items-center"><span className="mr-2">⛰️</span> Mountains</div>
                                                        <div className="flex items-center"><span className="mr-2">🌿</span> Forests</div>
                                                        <div className="flex items-center"><span className="mr-2">🏜️</span> Deserts</div>
                                                        <div className="flex items-center"><span className="mr-2">🏞️</span> Parks</div>
                                                        <div className="flex items-center"><span className="mr-2">🏰</span> Castles</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-white mb-4 font-poppins">{t('mapDestinations')}</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {jordanDestinations.map((destination, index) => (
                                        <div key={destination.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <div className="flex items-center mb-2">
                                                <span className="text-2xl mx-3">{destination.icon}</span>
                                                <div>
                                                    <h4 className="text-white font-semibold">{destination.name}</h4>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${destination.type === 'historical' ? 'bg-amber-600/20 text-amber-400' : destination.type === 'nature' ? 'bg-green-600/20 text-green-400' : destination.type === 'religious' ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'}`}>{destination.type}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">{destination.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section ref={insightsRef} id="insights" className="py-20 bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t('insightsTitle')}</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('insightsSubtitle')}</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[{ label: t('temp'), value: `${sensorData.temperature}°C`, icon: '🌡️', color: 'text-red-400', bgColor: 'from-red-500/20 to-orange-500/20', borderColor: 'border-red-500/30', unit: '°C', rawValue: sensorData.temperature, previousValue: previousSensorData.temperature }, { label: t('humidity'), value: `${sensorData.humidity}%`, icon: '💧', color: 'text-blue-400', bgColor: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-500/30', unit: '%', rawValue: sensorData.humidity, previousValue: previousSensorData.humidity }, { label: t('crowd'), value: sensorData.crowdLevel, icon: '👥', color: 'text-yellow-400', bgColor: 'from-yellow-500/20 to-orange-500/20', borderColor: 'border-yellow-500/30', unit: '', rawValue: sensorData.crowdLevel, previousValue: previousSensorData.crowdLevel }, { label: t('air'), value: sensorData.airQuality, icon: '🌬️', color: 'text-green-400', bgColor: 'from-green-500/20 to-emerald-500/20', borderColor: 'border-green-500/30', unit: '', rawValue: sensorData.airQuality, previousValue: previousSensorData.airQuality }].map((insight, index) => (
                                <div key={index} className={`bg-gradient-to-br ${insight.bgColor} backdrop-blur-sm rounded-2xl p-6 text-center border ${insight.borderColor} hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 relative overflow-hidden group`}>
                                    <div className="relative z-10">
                                        <div className={`text-4xl mb-4`}>{insight.icon}</div>
                                        <div className={`text-2xl font-bold mb-2 ${insight.color}`}><span className="font-mono tracking-wider">{insight.value}</span></div>
                                        <div className="text-gray-300 text-sm font-medium tracking-wide uppercase">{insight.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="relative bg-gray-900 border-t border-gray-800">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.pexels.com/photos/3250591/pexels-photo-3250591.jpeg')` }}></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="col-span-1">
                            <h3 className="text-2xl font-bold mb-4 text-white">{t('footerTitle')}</h3>
                            <p className="text-gray-300 mb-6 max-w-md">{t('footerDesc')}</p>
                            <button onClick={() => scrollToSection('home')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">{t('heroBtnStart')}</button>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">{t('quickLinks')}</h4>
                            <ul className="space-y-2">
                                {[{ id: 'home', label: t('navHome') }, { id: 'features', label: t('navFeatures') }, { id: 'map', label: t('navMap') }, { id: 'insights', label: t('navInsights') }].map((item) => (
                                    <li key={item.id}><button onClick={() => scrollToSection(item.id)} className="text-gray-300 hover:text-white transition-colors">{item.label}</button></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">{t('rightsReserved')}</p>
                    </div>
                </div>
            </footer>

            <div className={`fixed bottom-6 right-6 z-50 group transition-all duration-500 ${chatbotLoaded ? 'w-full max-w-sm h-[70vh] md:h-[60vh]' : 'w-auto'}`}>
                {chatbotLoaded ? (
                    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 h-full flex flex-col animate-fade-in-up">
                        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 p-4 flex items-center justify-between rounded-t-3xl">
                            <h3 className="text-white font-semibold text-lg">{t('chatbotTitle')}</h3>
                            <button onClick={() => setChatbotLoaded(false)} className="text-white text-2xl leading-none">&times;</button>
                        </div>
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 px-4 py-2 rounded-2xl">
                                        <span className="animate-pulse">●</span><span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span><span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-4 bg-gray-800/80 border-t border-white/10 rounded-b-3xl">
                            <div className="flex items-center">
                                <input name="message" type="text" placeholder={t('chatbotPlaceholder')} className="w-full bg-white/10 border-white/20 rounded-full px-4 py-2 text-white focus:ring-purple-500" />
                                <button type="submit" className="ml-2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div onClick={() => setChatbotLoaded(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl h-20 flex items-center justify-center p-4 cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="text-white font-semibold text-lg">{t('chatbotAsk')}</h3>
                    </div>
                )}
            </div>

            <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} images={galleryImages} lang={language} />
            {showBackToTop && (
                <button onClick={scrollToTop} className="fixed bottom-6 left-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110 z-40 animate-fade-in">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            )}
        </div>
    );
};

export default App;