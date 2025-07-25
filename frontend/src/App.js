import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import "./App.css";
import 'leaflet/dist/leaflet.css';
import ARGuide from './ARGuide'; // --- استيراد المكون الجديد

// --- دالة التحقق من دعم الحساسات ---
const checkSensorSupport = () => {
    return new Promise((resolve, reject) => {
        if (!window.DeviceOrientationEvent) {
            return reject(new Error("جهازك لا يدعم حساسات الحركة (الجيروسكوب)."));
        }
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        resolve();
                    } else {
                        reject(new Error("تم رفض إذن الوصول إلى حساسات الحركة."));
                    }
                }).catch(err => reject(err));
        } else {
            const handleOrientation = (event) => {
                if (event.alpha !== null || event.webkitCompassHeading !== undefined) {
                    window.removeEventListener('deviceorientation', handleOrientation);
                    resolve();
                }
            };
            window.addEventListener('deviceorientation', handleOrientation);
            setTimeout(() => {
                window.removeEventListener('deviceorientation', handleOrientation);
                reject(new Error("لم يتمكن من كشف حساسات الحركة. يرجى التأكد من تفعيلها في إعدادات المتصفح."));
            }, 3000);
        }
    });
};


const translations = {
  en: {
    galleryTitle: "Jordan's Wonders Gallery",
    smartTourJo: "SmartTour.jo",
    navHome: "Home",
    navFeatures: "Features",
    navAR: "AR Guide",
    navMap: "Map",
    navExplore: "Explore",
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
    navAR: "دليل الواقع المعزز",
    navMap: "الخريطة",
    navExplore: "استكشف",
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
    const [showAR, setShowAR] = useState(false);
    const [language, setLanguage] = useState('en');
    const t = (key) => translations[language][key] || key;
    const [sensorData, setSensorData] = useState({ temperature: 28, humidity: 45, crowdLevel: 'Medium', airQuality: 'Good' });
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
    ];

    const galleryImages = [
        { src: 'https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg', alt: 'Petra Treasury' },
        { src: 'https://images.pexels.com/photos/3258242/pexels-photo-3258242.jpeg', alt: 'Wadi Rum Desert' },
        { src: 'https://images.pexels.com/photos/30129079/pexels-photo-30129079.png', alt: 'Dead Sea Salt Formations' },
        { src: 'https://images.pexels.com/photos/18717602/pexels-photo-18717602.jpeg', alt: 'Jerash Colonnaded Street' },
    ];

    const exploreData = [
        { title: '🏛️ Petra: The Rose City', description: 'Explore the Treasury, the Monastery, and the ancient tombs of this UNESCO World Heritage wonder.', image: 'https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg' },
        { title: '🏜️ Wadi Rum: The Martian Desert', description: 'Experience Bedouin culture, stunning sunsets, and Jeep tours in this vast desert landscape.', image: 'https://images.pexels.com/photos/3258242/pexels-photo-3258242.jpeg' },
        { title: '🌊 Dead Sea: The Lowest Point on Earth', description: 'Float effortlessly in its hypersaline waters and benefit from its therapeutic mineral-rich mud.', image: 'https://images.pexels.com/photos/30129079/pexels-photo-30129079.png' },
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
        const workerUrl = "https://white-frost-8014.karam200566.workers.dev/";
        try {
            const response = await fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: newMessages.map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }]
                    }))
                })
            });
            if (!response.ok) throw new Error(`Network error: ${response.status}`);
            const data = await response.json();
            const botResponse = data.response || "Sorry, I couldn't get a response.";
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        } catch (error) {
            console.error("Chat API Error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: `❌ Sorry, connection failed.` }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleLaunchAR = async () => {
        try {
            await checkSensorSupport();
            navigator.geolocation.getCurrentPosition(
                () => setShowAR(true),
                (err) => { throw new Error(err.message); },
                { enableHighAccuracy: true }
            );
        } catch (error) {
            alert(`خطأ: ${error.message}\n\nسيتم تحديث الصفحة الآن.`);
            window.location.reload();
        }
    };

    const scrollToSection = (sectionId) => {
        const refs = { home: heroRef, features: featuresRef, explore: exploreRef, map: mapRef, ar: arRef, insights: insightsRef };
        if (refs[sectionId]?.current) {
            refs[sectionId].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (showAR) {
        return <ARGuide onExit={() => setShowAR(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white" style={{ fontFamily: language === 'ar' ? "'Tajawal', sans-serif" : "'Inter', sans-serif" }}>
            <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-xl z-50 border-b border-gray-800/50 transition-all duration-300 shadow-xl">
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 via-purple-400 to-blue-600 transition-all duration-300 ease-out" style={{ width: `${scrollProgress}%` }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-white hover:text-purple-400 transition-all duration-300 cursor-pointer font-poppins" onClick={() => scrollToSection('home')}>
                                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow">Smart</span>
                                <span className="text-white ml-1">Tour.jo</span>
                            </h1>
                        </div>
                        <div className={`absolute md:static top-16 left-0 w-full md:w-auto bg-gray-900/95 md:bg-transparent shadow-lg md:shadow-none transition-all duration-300 ease-in-out ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
                            <div className="flex flex-col md:flex-row items-baseline space-y-4 md:space-y-0 md:space-x-1 p-4 md:p-0">
                                {[
                                    { id: 'home', label: t('navHome'), icon: '🏠' },
                                    { id: 'features', label: t('navFeatures'), icon: '⚡' },
                                    { id: 'ar', label: t('navAR'), icon: '🥽' },
                                    { id: 'map', label: t('navMap'), icon: '📍' },
                                    { id: 'explore', label: t('navExplore'), icon: '🗺️' },
                                    { id: 'insights', label: t('navInsights'), icon: '📊' }
                                ].map((item) => (
                                    <button key={item.id} onClick={() => { scrollToSection(item.id); setIsMenuOpen(false); }}
                                        className={`group w-full md:w-auto px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden ${activeSection === item.id ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>
                                        <span className="relative z-10 flex items-center justify-center md:justify-start">
                                            <span className="mr-1 text-xs">{item.icon}</span>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                                    className="group w-full md:w-auto px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden text-gray-300 hover:text-white hover:bg-gray-800/50"
                                >
                                    <span className="relative z-10 flex items-center justify-center md:justify-start">
                                        <span className="mr-1 text-xs">🌐</span>
                                        {language === 'en' ? 'العربية' : 'English'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50">
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
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-blue-900/40 to-indigo-900/60 z-10"></div>
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(https://images.pexels.com/photos/1631665/pexels-photo-1631665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)` }}></div>
                    <div className={`relative z-20 text-center px-4 sm:px-6 lg:px-8`}>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">{t('heroTitle')}</h1>
                        <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 max-w-4xl mx-auto">{t('heroSubtitle')}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button onClick={() => scrollToSection('features')} className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg">
                                {t('heroBtnStart')}
                            </button>
                            <button onClick={() => scrollToSection('map')} className="group border-2 border-white/30 hover:border-white/60 text-white font-semibold py-4 px-8 rounded-full text-lg">
                                {t('heroBtnMap')}
                            </button>
                        </div>
                    </div>
                </section>
                <section ref={featuresRef} id="features" className="py-20 bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t('featuresTitle')}</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('featuresSubtitle')}</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[{ icon: "🤖", title: t('feature1Title'), description: t('feature1Desc') }, { icon: "🥽", title: t('feature2Title'), description: t('feature2Desc') }, { icon: "📊", title: t('feature3Title'), description: t('feature3Desc') }].map((feature, index) => (
                                <div key={index} className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8">
                                    <div className="text-5xl mb-6">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                                    <p className="text-gray-300">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section ref={exploreRef} id="explore" className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t('exploreTitle')}</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('exploreSubtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {exploreData.map((item, index) => (
                                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                        <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section ref={arRef} id="ar" className="py-20 bg-gray-800/50 flex flex-col justify-center items-center">
                    <div className="container text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t('arTitle')}</h2>
                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">{t('arSubtitle')}</p>
                        <button onClick={handleLaunchAR} className="btn btn-primary">🥽 {t('arBtnLaunch')}</button>
                    </div>
                </section>
                <section ref={mapRef} id="map" className="py-20 bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t('mapTitle')}</h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('mapSubtitle')}</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden">
                                        <MapContainer center={[31.2397, 36.2305]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                            {jordanDestinations.map((destination) => (
                                                <Marker key={destination.id} position={destination.position} icon={createCustomIcon(destination.type, destination.icon)}>
                                                    <Popup>{destination.name}</Popup>
                                                    <Tooltip>{destination.name}</Tooltip>
                                                </Marker>
                                            ))}
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-white mb-4">{t('mapDestinations')}</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {jordanDestinations.map((destination) => (
                                        <div key={destination.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                                            <h4 className="text-white font-semibold">{destination.name}</h4>
                                            <p className="text-gray-300 text-sm">{destination.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="bg-gray-900 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="text-gray-400 text-center">{t('rightsReserved')}</p>
                </div>
            </footer>
            {showBackToTop && (
                <button onClick={scrollToTop} className="fixed bottom-6 left-6 bg-purple-600 text-white p-3 rounded-full">
                    ↑
                </button>
            )}
        </div>
    );
};

export default App;
