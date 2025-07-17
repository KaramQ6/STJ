import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import "./App.css";
import 'leaflet/dist/leaflet.css';

// GalleryModal يبقى كما هو
const GalleryModal = ({ isOpen, onClose, images }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-900/80 border border-purple-500/30 rounded-2xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white font-poppins">Jordan's Wonders Gallery</h2>
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
    // ======== STATE MANAGEMENT ========
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

    // ======== REFS FOR SCROLLING ========
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const mapRef = useRef(null);
    const itineraryRef = useRef(null);
    const insightsRef = useRef(null);
    const chatEndRef = useRef(null);

    // ======== LEAFLET MARKER FIX ========
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
    }, []);
    
    // ======== DATA ========
    const jordanDestinations = [
        { id: 'petra', name: 'Petra', position: [30.3285, 35.4444], description: 'The ancient rose-red city...', type: 'historical', icon: '🏛️', details: 'UNESCO World Heritage Site...' },
        { id: 'wadi-rum', name: 'Wadi Rum', position: [29.5759, 35.4208], description: 'Valley of the Moon', type: 'nature', icon: '🏜️', details: 'Protected desert wilderness...' },
        { id: 'dead-sea', name: 'Dead Sea', position: [31.5553, 35.4732], description: 'Lowest point on Earth', type: 'nature', icon: '🌊', details: 'Effortless floating...' },
        { id: 'jerash', name: 'Jerash', position: [32.2814, 35.8936], description: 'Preserved Roman ruins', type: 'historical', icon: '🏛️', details: 'Best-preserved Roman town' },
        { id: 'amman', name: 'Amman', position: [31.9454, 35.9284], description: 'The capital city', type: 'city', icon: '🏙️', details: 'Ancient citadel...' },
        { id: 'aqaba', name: 'Aqaba', position: [29.5328, 35.0076], description: 'Red Sea resort', type: 'nature', icon: '🏖️', details: 'Diving and coral reefs' },
        { id: 'mount-nebo', name: 'Mount Nebo', position: [31.7690, 35.7272], description: 'Sacred biblical site...', type: 'religious', icon: '⛰️', details: 'Panoramic views...' },
        { id: 'dana-reserve', name: 'Dana Biosphere Reserve', position: [30.6774, 35.6270], description: 'Jordan\'s largest nature reserve...', type: 'nature', icon: '🌿', details: 'Rare wildlife...' }
    ];

    const galleryImages = [
        { src: 'https://images.pexels.com/photos/1587747/pexels-photo-1587747.jpeg', alt: 'Petra Treasury' },
        { src: 'https://images.pexels.com/photos/2440339/pexels-photo-2440339.jpeg', alt: 'Wadi Rum Desert' },
        { src: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg', alt: 'Dead Sea Salt Formations' },
        { src: 'https://images.pexels.com/photos/73910/jordan-petra-travel-73910.jpeg', alt: 'Jerash Colonnaded Street' },
        { src: 'https://images.pexels.com/photos/7989333/pexels-photo-7989333.jpeg', alt: 'Wadi Mujib Canyon' },
        { src: 'https://images.pexels.com/photos/14986348/pexels-photo-14986348.jpeg', alt: 'Baptism Site' },
    ];
    
    // ======== CUSTOM MARKER ICONS ========
    const createCustomIcon = (type, emoji) => {
        const iconHtml = `<div style="background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); width: 40px; height: 40px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); display: flex; align-items: center; justify-content: center; font-size: 18px; transform: rotate(-45deg); position: relative;"><span style="transform: rotate(45deg); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">${emoji}</span></div>`;
        return L.divIcon({ html: iconHtml, className: 'custom-marker', iconSize: [40, 40], iconAnchor: [20, 35], popupAnchor: [0, -35] });
    };

    // ======== CHATBOT LOGIC (FUNCTIONAL) ========
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
            setMessages(prev => [...prev, { sender: 'bot', text: `❌ Sorry, connection failed. Please check the worker URL.` }]);
        } finally {
            setIsTyping(false);
        }
    };
    
    // ======== SCROLL EFFECTS & SENSOR SIMULATION ========
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setIsDataUpdating(true);
            setPreviousSensorData(sensorData);
            setTimeout(() => {
                setSensorData({
                    temperature: Math.round(25 + Math.random() * 10),
                    humidity: Math.round(40 + Math.random() * 20),
                    crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                    airQuality: ['Good', 'Moderate', 'Excellent'][Math.floor(Math.random() * 3)]
                });
                setIsDataUpdating(false);
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, [sensorData]);

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
                { id: 'map', ref: mapRef }, { id: 'itinerary', ref: itineraryRef }, 
                { id: 'insights', ref: insightsRef }
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
        const refs = { home: heroRef, features: featuresRef, map: mapRef, itinerary: itineraryRef, insights: insightsRef };
        if (refs[sectionId]?.current) {
            refs[sectionId].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const itinerarySteps = [
        { time: '09:00 AM', title: 'Arrive at Hotel', description: 'Check-in and receive your smart travel kit...', icon: '🏨' },
        { time: '10:30 AM', title: 'Visit Downtown', description: 'Explore Amman\'s vibrant downtown...', icon: '🏙️' },
        { time: '02:00 PM', title: 'Archaeological Site', description: 'Petra exploration with AR visualization...', icon: '🏛️' },
        { time: '07:00 PM', title: 'Night Food Market', description: 'Traditional Jordanian cuisine experience...', icon: '🍽️' }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-xl z-50 border-b border-gray-800/50 transition-all duration-300 shadow-xl">
                 <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 via-purple-400 to-blue-600 transition-all duration-300 ease-out shadow-lg shadow-purple-500/50" style={{ width: `${scrollProgress}%` }}></div>
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center justify-between h-16">
                         <div className="flex items-center">
                             <h1 className="text-xl font-bold text-white hover:text-purple-400 transition-all duration-300 cursor-pointer font-poppins tracking-tight transform hover:scale-105" onClick={() => scrollToSection('home')}>
                                 <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow">Smart</span>
                                 <span className="text-white ml-1">Jordan</span>
                             </h1>
                         </div>
                         <div className="hidden md:block">
                             <div className="ml-10 flex items-baseline space-x-1">
                                 {[
                                     { id: 'home', label: 'Home', icon: '🏠' }, { id: 'features', label: 'Features', icon: '⚡' },
                                     { id: 'map', label: 'Map', icon: '📍' }, { id: 'itinerary', label: 'Itinerary', icon: '📋' }, 
                                     { id: 'insights', label: 'Insights', icon: '📊' }
                                 ].map((item) => (
                                     <button key={item.id} onClick={() => scrollToSection(item.id)}
                                         className={`group px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 relative overflow-hidden font-inter transform hover:scale-105 ${activeSection === item.id ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-600/25 scale-105' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>
                                         <span className="relative z-10 flex items-center">
                                             <span className="mr-1 text-xs transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
                                             {item.label}
                                         </span>
                                         {activeSection !== item.id && (
                                             <><div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                             <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div></>
                                         )}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         <div className="md:hidden">
                             <button className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-110">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                             </button>
                         </div>
                     </div>
                 </div>
            </nav>

            <main>
                <section ref={heroRef} id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
                    {/* ... Hero content ... */}
                </section>
                
                <section ref={featuresRef} id="features" className="py-20 bg-gray-900 relative overflow-hidden">
                    {/* ... Features content ... */}
                </section>
                
                <section ref={mapRef} id="map" className={`py-20 bg-gray-900 relative overflow-hidden transition-all duration-1000 ${isVisible.map ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-poppins">
                                More interactive with Featured Destinations
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-inter">
                                Discover Jordan's magnificent destinations with our interactive map featuring all major tourist attractions
                            </p>
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
                                        <div className="absolute top-4 right-4 z-[1000] space-y-2">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                                                <div className="text-xs font-medium text-gray-700 mb-1">Legend</div>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-center"><span className="mr-1">🏛️</span> Historical</div>
                                                    <div className="flex items-center"><span className="mr-1">🌊</span> Nature</div>
                                                    <div className="flex items-center"><span className="mr-1">⛰️</span> Religious</div>
                                                    <div className="flex items-center"><span className="mr-1">🏙️</span> Cities</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-white mb-4 font-poppins">Featured Destinations</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {jordanDestinations.map((destination, index) => (
                                        <div key={destination.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                                            <div className="flex items-center mb-2">
                                                <span className="text-2xl mr-3">{destination.icon}</span>
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

                <section ref={itineraryRef} id="itinerary" className="py-20 bg-gray-800">
                    {/* ... (Itinerary section remains unchanged) ... */}
                </section>
                
                <section ref={insightsRef} id="insights" className="py-20 bg-gray-800">
                     {/* ... (Insights section remains unchanged) ... */}
                </section>
            </main>
            
            <footer className="relative bg-gray-900 border-t border-gray-800">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.pexels.com/photos/3250591/pexels-photo-3250591.jpeg')` }}></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="col-span-2">
                            <h3 className="text-2xl font-bold mb-4 text-white">Smart Jordan</h3>
                            <p className="text-gray-300 mb-6 max-w-md">Your intelligent companion for exploring Jordan's wonders. Experience the future of travel with AI-powered insights and real-time data.</p>
                            <button onClick={() => scrollToSection('home')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">Start Your Smart Journey</button>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                            <ul className="space-y-2">
                                {[ { id: 'home', label: 'Home' }, { id: 'features', label: 'Features' }, { id: 'map', label: 'Map' }, { id: 'insights', label: 'Insights' } ].map((item) => (
                                    <li key={item.id}><button onClick={() => scrollToSection(item.id)} className="text-gray-300 hover:text-white transition-colors">{item.label}</button></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">&copy; 2025 Smart Jordan. All rights reserved. | Privacy Policy | Terms of Service</p>
                    </div>
                </div>
            </footer>
            
            <div className={`fixed bottom-6 right-6 z-50 group transition-all duration-500 ${chatbotLoaded ? 'w-full max-w-sm h-[70vh] md:h-[60vh]' : 'w-auto'}`}>
                {chatbotLoaded ? (
                    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 h-full flex flex-col animate-fade-in-up">
                        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 p-4 flex items-center justify-between rounded-t-3xl">
                             <h3 className="text-white font-semibold text-lg">Smart Jordan AI</h3>
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
                                        <span className="animate-pulse">●</span><span className="animate-pulse" style={{animationDelay: '0.2s'}}>●</span><span className="animate-pulse" style={{animationDelay: '0.4s'}}>●</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-4 bg-gray-800/80 border-t border-white/10 rounded-b-3xl">
                            <div className="flex items-center">
                                <input name="message" type="text" placeholder="Ask me anything..." className="w-full bg-white/10 border-white/20 rounded-full px-4 py-2 text-white focus:ring-purple-500"/>
                                <button type="submit" className="ml-2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div onClick={() => setChatbotLoaded(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl h-20 flex items-center justify-center p-4 cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        </div>
                        <h3 className="text-white font-semibold text-lg">Ask our AI Guide!</h3>
                    </div>
                )}
            </div>
            
            <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} images={galleryImages} />
            {showBackToTop && (
                <button onClick={scrollToTop} className="fixed bottom-6 left-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110 z-40 animate-fade-in">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            )}
        </div>
    );
};

export default App;