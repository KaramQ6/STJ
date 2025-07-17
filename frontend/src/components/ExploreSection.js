import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- هذا الجزء ضروري لإصلاح أيقونات الخريطة ---
// يقوم بتحديد مسار صور الأيقونات بشكل يدوي
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


const ExploreSection = ({ exploreRef, isVisible }) => {
  // --- كل الـ state variables من الكود الأصلي الذي أرسلته ---
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedAccessibility, setSelectedAccessibility] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // --- الـ state variables الجديدة الخاصة بالشات بوت ---
  const [history, setHistory] = useState([
    { role: "model", parts: [{ text: "Hello! I am your Jordan travel assistant. How can I help you plan your trip?" }] }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // useEffect لتمرير الشات للأسفل عند إضافة رسالة جديدة
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);
    
  // --- دالة إرسال الرسائل الفعّالة مع مهلة زمنية ---
  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;
    const newUserMessage = { role: "user", parts: [{ text: input }] };
    const updatedHistory = [...history, newUserMessage];
    setHistory(updatedHistory);
    setInput("");
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // مهلة 15 ثانية

    try {
      // !!! هام جداً: تأكد من وضع رابط الـ Worker الصحيح هنا
      const cloudflareWorkerUrl = 'https://your-worker-name.your-subdomain.workers.dev';
      const response = await fetch(cloudflareWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: updatedHistory }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      const modelResponse = { role: "model", parts: [{ text: data.response }] };
      setHistory(prevHistory => [...prevHistory, modelResponse]);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Failed to send message:", error);
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error.name === 'AbortError') {
        errorMessage = "The request timed out. Please check your connection or the server status.";
      }
      const errorResponse = { role: "model", parts: [{ text: errorMessage }] };
      setHistory(prevHistory => [...prevHistory, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };
    
  // --- كل بياناتك ودوالك الأصلية تبقى كما هي ---
  const mockWeatherData = { 'petra': { temp: 28, condition: 'Sunny', humidity: 45, windSpeed: 12 }, 'wadi-rum': { temp: 32, condition: 'Clear', humidity: 30, windSpeed: 18 }, 'dead-sea': { temp: 35, condition: 'Hot', humidity: 60, windSpeed: 8 }, 'jerash': { temp: 26, condition: 'Partly Cloudy', humidity: 50, windSpeed: 10 }, 'amman': { temp: 24, condition: 'Cloudy', humidity: 55, windSpeed: 15 }, 'aqaba': { temp: 30, condition: 'Sunny', humidity: 65, windSpeed: 20 }, 'mount-nebo': { temp: 22, condition: 'Misty', humidity: 70, windSpeed: 5 }, 'dana-reserve': { temp: 18, condition: 'Cool', humidity: 45, windSpeed: 12 } };
  const mockCrowdData = { 'petra': { level: 'High', percentage: 85, busyHours: ['9AM-11AM', '2PM-4PM'] }, 'wadi-rum': { level: 'Medium', percentage: 60, busyHours: ['6AM-8AM', '6PM-7PM'] }, 'dead-sea': { level: 'High', percentage: 75, busyHours: ['10AM-2PM'] }, 'jerash': { level: 'Low', percentage: 35, busyHours: ['11AM-1PM'] }, 'amman': { level: 'Medium', percentage: 55, busyHours: ['8AM-10AM', '5PM-7PM'] }, 'aqaba': { level: 'Medium', percentage: 50, busyHours: ['10AM-12PM', '3PM-5PM'] }, 'mount-nebo': { level: 'Low', percentage: 25, busyHours: ['10AM-12PM'] }, 'dana-reserve': { level: 'Low', percentage: 20, busyHours: ['8AM-10AM'] } };
  const destinations = [ { id: 'petra', name: 'Petra', category: 'historical', difficulty: 'moderate', duration: '6-8 hours', budget: 'high', accessibility: 'limited', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', virtualTour: 'https://petra-virtual-tour.com', shortDescription: 'Ancient rose-red city carved into cliffs', fullDescription: 'Petra is an archaeological wonder and UNESCO World Heritage Site. This ancient city, carved directly into vibrant red, white, pink, and sandstone cliff faces, was the capital of the Nabataean Kingdom from around the 6th century BC to the 1st century AD.', highlights: ['Treasury (Al-Khazneh)', 'Monastery (Ad-Deir)', 'Royal Tombs', 'Siq Canyon'], bestTimeToVisit: { months: ['October', 'November', 'March', 'April'], hours: 'Early morning (6AM-9AM) or late afternoon (4PM-6PM)', season: 'Spring and Fall for comfortable temperatures' }, transportation: { from_amman: 'Private car (3 hours), Tourist bus (3.5 hours)', from_aqaba: 'Private car (2 hours), Taxi (2 hours)', parking: 'Available at visitor center', local_transport: 'Horse rides and donkey rides available inside' }, averageRating: 4.7, tips: [ 'Wear comfortable hiking shoes', 'Bring plenty of water and sun protection', 'Consider hiring a local guide for deeper insights', 'Visit during golden hour for best photography' ] }, { id: 'wadi-rum', name: 'Wadi Rum', category: 'nature', difficulty: 'easy', duration: '4-6 hours', budget: 'medium', accessibility: 'moderate', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', virtualTour: 'https://wadi-rum-virtual-tour.com', shortDescription: 'Valley of the Moon desert landscape', fullDescription: 'Wadi Rum, also known as the Valley of the Moon, is a protected desert wilderness featuring dramatic sandstone mountains, narrow canyons, and ancient inscriptions. This UNESCO World Heritage Site offers otherworldly landscapes that have served as the backdrop for numerous films.', highlights: ['Lawrence\'s Spring', 'Khazali Canyon', 'Sand Dunes', 'Rock Bridges'], bestTimeToVisit: { months: ['October', 'November', 'December', 'January', 'February', 'March', 'April'], hours: 'Early morning (sunrise) or late afternoon (sunset)', season: 'Winter months for comfortable temperatures' }, transportation: { from_amman: 'Private car (4 hours), Bus to Aqaba then taxi (5 hours total)', from_aqaba: 'Private car (1 hour), Taxi (1 hour)', parking: 'Available at visitor center', local_transport: '4WD jeep tours, camel rides, hot air balloon rides' }, averageRating: 4.8, tips: [ 'Book overnight camping for the full experience', 'Bring warm clothes for desert nights', 'Don\'t miss the sunrise and sunset', 'Try traditional Bedouin cuisine' ] }, { id: 'dead-sea', name: 'Dead Sea', category: 'nature', difficulty: 'easy', duration: '2-4 hours', budget: 'medium', accessibility: 'good', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', virtualTour: 'https://dead-sea-virtual-tour.com', shortDescription: 'Lowest point on Earth with healing waters', fullDescription: 'The Dead Sea is a salt lake bordered by Jordan to the east and Israel to the west. At 430 meters below sea level, it\'s the lowest point on Earth\'s surface. The hypersaline water makes floating effortless and is renowned for its therapeutic properties.', highlights: ['Effortless floating', 'Mud therapy', 'Salt formations', 'Spa treatments'], bestTimeToVisit: { months: ['October', 'November', 'December', 'January', 'February', 'March', 'April'], hours: 'Morning (8AM-11AM) or late afternoon (4PM-6PM)', season: 'Cooler months to avoid extreme heat' }, transportation: { from_amman: 'Private car (1 hour), Bus (1.5 hours)', from_petra: 'Private car (2.5 hours), Tour bus (3 hours)', parking: 'Available at resorts and public beaches', local_transport: 'Resort shuttles, private taxis' }, averageRating: 4.6, tips: [ 'Don\'t shave before visiting', 'Avoid getting water in eyes or mouth', 'Bring fresh water for rinsing', 'Try the therapeutic mud treatments' ] }, { id: 'jerash', name: 'Jerash', category: 'historical', difficulty: 'easy', duration: '3-4 hours', budget: 'low', accessibility: 'good', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', virtualTour: 'https://jerash-virtual-tour.com', shortDescription: 'Best-preserved Roman ruins outside Italy', fullDescription: 'Jerash is home to one of the best-preserved Roman provincial towns in the world. Hidden for centuries under sand, the city has been excavated and restored over 70 years, revealing a remarkable Roman urban planning example.', highlights: ['Hadrian\'s Arch', 'Oval Plaza', 'Roman Theatre', 'Colonnaded Street'], bestTimeToVisit: { months: ['October', 'November', 'December', 'January', 'February', 'March', 'April'], hours: 'Morning (8AM-11AM) or late afternoon (3PM-5PM)', season: 'Spring and fall for comfortable walking' }, transportation: { from_amman: 'Private car (1 hour), Bus (1.5 hours)', from_petra: 'Private car (4 hours), Tour bus (4.5 hours)', parking: 'Available at site entrance', local_transport: 'Walking tour, horse-drawn carriages' }, averageRating: 4.7, tips: [ 'Hire a guide for detailed historical context', 'Comfortable walking shoes essential', 'Visit during the annual festival if possible', 'Don\'t miss the sound and light show' ] }, { id: 'amman', name: 'Amman', category: 'urban', difficulty: 'easy', duration: '6-8 hours', budget: 'medium', accessibility: 'excellent', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', virtualTour: 'https://amman-virtual-tour.com', shortDescription: 'Modern capital with ancient history', fullDescription: 'Amman is a fascinating city of contrasts – a unique blend of old and new, where ancient traditions meet modern life. The city is built on seven hills and offers a mix of ancient ruins, traditional markets, and modern amenities.', highlights: ['Citadel', 'Roman Theatre', 'Rainbow Street', 'King Abdullah Mosque'], bestTimeToVisit: { months: ['March', 'April', 'May', 'September', 'October', 'November'], hours: 'All day - city activities', season: 'Spring and fall for pleasant weather' }, transportation: { from_petra: 'Private car (3 hours), Bus (3.5 hours)', from_aqaba: 'Private car (4 hours), Flight (1 hour)', parking: 'Available in city center and malls', local_transport: 'Taxis, buses, ride-sharing apps' }, averageRating: 4.4, tips: [ 'Try traditional Jordanian cuisine', 'Visit local markets for authentic shopping', 'Explore both modern and old parts of the city', 'Use official taxis or ride-sharing apps' ] }, { id: 'aqaba', name: 'Aqaba', category: 'nature', difficulty: 'easy', duration: '4-6 hours', budget: 'medium', accessibility: 'good', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', virtualTour: 'https://aqaba-virtual-tour.com', shortDescription: 'Red Sea diving and coral reef paradise', fullDescription: 'Aqaba is Jordan\'s window to the sea, offering world-class diving and snorkeling in the Red Sea. The city combines beach relaxation with water sports and serves as the gateway to Wadi Rum desert.', highlights: ['Coral reefs', 'Diving spots', 'Beach resorts', 'Marine life'], bestTimeToVisit: { months: ['October', 'November', 'December', 'January', 'February', 'March', 'April'], hours: 'Morning dives (8AM-11AM) or afternoon (2PM-5PM)', season: 'Winter months for comfortable temperatures' }, transportation: { from_amman: 'Private car (4 hours), Flight (1 hour), Bus (4.5 hours)', from_petra: 'Private car (2 hours), Bus (2.5 hours)', parking: 'Available at hotels and diving centers', 'local_transport': 'Taxis, hotel shuttles, boat trips' }, averageRating: 4.7, tips: [ 'Book diving trips in advance', 'Bring reef-safe sunscreen', 'Try fresh seafood at local restaurants', 'Consider combining with Wadi Rum visit' ] }, { id: 'mount-nebo', name: 'Mount Nebo', category: 'religious', difficulty: 'easy', duration: '2-3 hours', budget: 'low', accessibility: 'good', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', virtualTour: 'https://mount-nebo-virtual-tour.com', shortDescription: 'Sacred biblical site with panoramic views', fullDescription: 'Mount Nebo is a biblical and spiritual site where Moses is said to have viewed the Promised Land before his death. The site offers panoramic views of the Jordan Valley, Dead Sea, and on clear days, Jerusalem.', highlights: ['Moses Memorial', 'Byzantine mosaics', 'Panoramic views', 'Serpentine Cross'], bestTimeToVisit: { months: ['March', 'April', 'May', 'September', 'October', 'November'], hours: 'Morning (8AM-11AM) or late afternoon (4PM-6PM)', season: 'Spring and fall for clear visibility' }, transportation: { from_amman: 'Private car (1 hour), Tour bus (1.5 hours)', from_dead_sea: 'Private car (30 minutes), Tour bus (45 minutes)', parking: 'Available at site entrance', local_transport: 'Walking paths, guided tours' }, averageRating: 4.6, tips: [ 'Visit during clear weather for best views', 'Respect the religious significance of the site', 'Combine with Madaba mosaic visits', 'Bring a camera for the stunning vistas' ] }, { id: 'dana-reserve', name: 'Dana Biosphere Reserve', category: 'nature', difficulty: 'moderate', duration: '4-8 hours', budget: 'medium', accessibility: 'limited', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop', image360: 'https://images.unsplash.com/photo-1539650116574-75c0c6d57d8b?w=400&h=250&fit=crop', virtualTour: 'https://dana-reserve-virtual-tour.com', shortDescription: 'Jordan\'s largest nature reserve', fullDescription: 'Dana Biosphere Reserve is Jordan\'s largest nature reserve, spanning four bio-geographical zones. It\'s home to diverse wildlife and plant species, offering excellent hiking trails and eco-tourism experiences.', highlights: ['Hiking trails', 'Wildlife viewing', 'Ancient copper mines', 'Traditional villages'], bestTimeToVisit: { months: ['March', 'April', 'May', 'September', 'October', 'November'], hours: 'Early morning (6AM-10AM) or late afternoon (3PM-6PM)', season: 'Spring and fall for wildlife activity' }, transportation: { from_amman: 'Private car (3 hours), Bus to Tafila then taxi (4 hours total)', from_petra: 'Private car (1.5 hours), Tour bus (2 hours)', parking: 'Available at visitor center', local_transport: 'Hiking trails, guided nature walks' }, averageRating: 4.8, tips: [ 'Book eco-lodge accommodation in advance', 'Bring sturdy hiking boots', 'Hire local guides for best experience', 'Respect wildlife and stay on marked trails' ] } ];
  const filteredDestinations = destinations.filter(dest => { const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory; const matchesDifficulty = selectedDifficulty === 'all' || dest.difficulty === selectedDifficulty; const matchesDuration = selectedDuration === 'all' || dest.duration.includes(selectedDuration); const matchesBudget = selectedBudget === 'all' || dest.budget === selectedBudget; const matchesAccessibility = selectedAccessibility === 'all' || dest.accessibility === selectedAccessibility; const matchesSearch = searchTerm === '' || dest.name.toLowerCase().includes(searchTerm.toLowerCase()) || dest.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()); return matchesCategory && matchesDifficulty && matchesDuration && matchesBudget && matchesAccessibility && matchesSearch; });
  const toggleCard = (cardId) => setExpandedCard(expandedCard === cardId ? null : cardId);
  const getCrowdColor = (level) => { switch (level) { case 'Low': return 'text-green-400'; case 'Medium': return 'text-yellow-400'; case 'High': return 'text-red-400'; default: return 'text-gray-400'; } };
  const getWeatherIcon = (condition) => { switch (condition) { case 'Sunny': return '☀️'; case 'Clear': return '🌞'; case 'Partly Cloudy': return '⛅'; case 'Cloudy': return '☁️'; case 'Hot': return '🔥'; case 'Cool': return '🌤️'; case 'Misty': return '🌫️'; default: return '🌡️'; } };
  const getBudgetColor = (budget) => { switch (budget) { case 'low': return 'text-green-400'; case 'medium': return 'text-yellow-400'; case 'high': return 'text-red-400'; default: return 'text-gray-400'; } };
  const getDifficultyColor = (difficulty) => { switch (difficulty) { case 'easy': return 'text-green-400'; case 'moderate': return 'text-yellow-400'; case 'hard': return 'text-red-400'; default: return 'text-gray-400'; } };
  const renderStars = (rating) => { const fullStars = Math.floor(rating); const hasHalfStar = rating % 1 !== 0; const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); return ( <div className="flex items-center"> {[...Array(fullStars)].map((_, i) => ( <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> ))} {hasHalfStar && <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>} {[...Array(emptyStars)].map((_, i) => ( <svg key={i} className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> ))} <span className="ml-2 text-sm text-gray-300">{rating}</span> </div> ); };
  
  return (
    <section ref={exploreRef} id="explore" className="py-20 bg-gray-800 relative overflow-hidden">
      {/* --- هذا هو الهيكل العام الذي حافظت عليه --- */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible?.explore ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-poppins">Explore Jordan's Treasures</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-inter">Discover Jordan's most captivating destinations with real-time insights, personalized recommendations, and expert local guidance</p>
        </div>
        
        {/* --- قمت بدمج الخريطة والشات بوت هنا --- */}
        {/* --- هذا القسم الجديد تم وضعه قبل قسم الفلاتر والبطاقات --- */}
        <div className="mb-16 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 lg:p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center font-poppins">AI Trip Planner & Interactive Map</h3>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* --- 1. الشات بوت الوظيفي --- */}
                <div className="lg:w-1/2 flex flex-col h-[500px] bg-gray-800 rounded-xl border border-gray-700">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {history.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                    <p className="text-sm" style={{whiteSpace: "pre-wrap"}}>{msg.parts[0].text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                           <div className="flex justify-start">
                             <div className="bg-gray-700 text-gray-200 rounded-2xl p-3 rounded-bl-none inline-flex items-center">
                               <span className="animate-pulse">●</span><span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span><span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                             </div>
                           </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center space-x-2">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about your trip..." className="w-full bg-gray-700 border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <button onClick={handleSendMessage} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Send</button>
                        </div>
                    </div>
                </div>
                {/* --- 2. الخريطة الوظيفية --- */}
                <div className="lg:w-1/2 h-96 lg:h-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                    <MapContainer center={[31.2, 36.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
                         <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {destinations.map(dest => {
                            const position = {'petra': [30.3285, 35.4444],'wadi-rum': [29.5732, 35.4211],'dead-sea': [31.5592, 35.5869],'jerash': [32.2736, 35.8931],'amman': [31.9454, 35.9284],'aqaba': [29.5266, 35.0076],'mount-nebo': [31.7686, 35.7256],'dana-reserve': [30.6789, 35.6111]}[dest.id];
                            return position ? (<Marker key={dest.id} position={position}><Popup><b>{dest.name}</b><br/>{dest.shortDescription}</Popup></Marker>) : null;
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
        
        {/* --- بقية الكود الخاص بك (الفلاتر والبطاقات) يبقى كما هو بدون تغيير --- */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <input type="text" placeholder="Search destinations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"/>
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="text-center">
            <button onClick={() => setShowFilters(!showFilters)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              <svg className={`w-5 h-5 mr-2 inline-block transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" /></svg>
              Filters
            </button>
          </div>
          {showFilters && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 animate-slide-in-top">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Category</label><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="all">All Categories</option><option value="nature">Nature</option><option value="historical">Historical</option><option value="religious">Religious</option><option value="urban">Urban</option></select></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label><select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="all">All Levels</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Duration</label><select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="all">Any Duration</option><option value="2">2-3 hours</option><option value="4">4-6 hours</option><option value="6">6-8 hours</option></select></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Budget</label><select value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="all">Any Budget</option><option value="low">Low Budget</option><option value="medium">Medium Budget</option><option value="high">High Budget</option></select></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Accessibility</label><select value={selectedAccessibility} onChange={(e) => setSelectedAccessibility(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="all">All Levels</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="moderate">Moderate</option><option value="limited">Limited</option></select></div>
              </div>
              <div className="mt-4 text-center"><button onClick={() => { setSelectedCategory('all'); setSelectedDifficulty('all'); setSelectedDuration('all'); setSelectedBudget('all'); setSelectedAccessibility('all'); setSearchTerm(''); }} className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300">Clear All Filters</button></div>
            </div>
          )}
        </div>
        <div className="text-center mb-8"><p className="text-gray-400">Showing {filteredDestinations.length} of {destinations.length} destinations</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination, index) => (
                <div key={destination.id} className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 animate-fade-in-up overflow-hidden`} style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="relative"><img src={destination.image} alt={destination.name} className="w-full h-48 object-cover" /><div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">{renderStars(destination.averageRating)}</div><div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1"><span className="text-white text-sm font-medium capitalize">{destination.category}</span></div></div>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">{destination.name}</h3>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{destination.shortDescription}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-sm"><span className="text-gray-400">Duration:</span><span className="text-white ml-2">{destination.duration}</span></div>
                            <div className="flex items-center text-sm"><span className="text-gray-400">Budget:</span><span className={`ml-2 font-medium ${getBudgetColor(destination.budget)}`}>{destination.budget.charAt(0).toUpperCase() + destination.budget.slice(1)}</span></div>
                            <div className="flex items-center text-sm"><span className="text-gray-400">Difficulty:</span><span className={`ml-2 font-medium ${getDifficultyColor(destination.difficulty)}`}>{destination.difficulty.charAt(0).toUpperCase() + destination.difficulty.slice(1)}</span></div>
                            <div className="flex items-center text-sm"><span className="text-gray-400">Access:</span><span className="text-white ml-2">{destination.accessibility}</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-800/50 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-gray-400 text-sm">Weather</span><span className="text-2xl">{getWeatherIcon(mockWeatherData[destination.id]?.condition)}</span></div><div className="text-white font-semibold">{mockWeatherData[destination.id]?.temp}°C</div><div className="text-gray-400 text-sm">{mockWeatherData[destination.id]?.condition}</div></div>
                            <div className="bg-gray-800/50 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-gray-400 text-sm">Crowd</span><span className="text-2xl">👥</span></div><div className={`font-semibold ${getCrowdColor(mockCrowdData[destination.id]?.level)}`}>{mockCrowdData[destination.id]?.level}</div><div className="text-gray-400 text-sm">{mockCrowdData[destination.id]?.percentage}% full</div></div>
                        </div>
                        <button onClick={() => toggleCard(destination.id)} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">{expandedCard === destination.id ? 'Show Less' : 'Show More Details'}<svg className={`w-5 h-5 ml-2 inline-block transition-transform duration-300 ${expandedCard === destination.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                    </div>
                    {expandedCard === destination.id && (<div className="px-6 pb-6 animate-slide-in-top"><div className="border-t border-gray-700 pt-6"><div className="mb-6"><h4 className="text-lg font-semibold text-white mb-3">About {destination.name}</h4><p className="text-gray-300 text-sm leading-relaxed">{destination.fullDescription}</p></div><div className="mb-6"><h4 className="text-lg font-semibold text-white mb-3">Highlights</h4><div className="grid grid-cols-2 gap-2">{destination.highlights.map((highlight, idx) => (<div key={idx} className="flex items-center text-sm text-gray-300"><span className="text-purple-400 mr-2">•</span>{highlight}</div>))}</div></div><div className="mb-6"><h4 className="text-lg font-semibold text-white mb-3">Best Time to Visit</h4><div className="bg-gray-800/50 rounded-lg p-4 space-y-2"><div className="flex items-center text-sm"><span className="text-gray-400 w-20">Months:</span><span className="text-white">{destination.bestTimeToVisit.months.join(', ')}</span></div><div className="flex items-center text-sm"><span className="text-gray-400 w-20">Hours:</span><span className="text-white">{destination.bestTimeToVisit.hours}</span></div><div className="flex items-center text-sm"><span className="text-gray-400 w-20">Season:</span><span className="text-white">{destination.bestTimeToVisit.season}</span></div></div></div><div className="mb-6"><h4 className="text-lg font-semibold text-white mb-3">Transportation</h4><div className="space-y-2">{Object.entries(destination.transportation).map(([key, value]) => (<div key={key} className="flex items-start text-sm"><span className="text-gray-400 w-24 capitalize flex-shrink-0">{key.replace('_', ' ')}:</span><span className="text-white">{value}</span></div>))}</div></div><div className="mb-6"><h4 className="text-lg font-semibold text-white mb-3">Local Tips</h4><div className="space-y-2">{destination.tips.map((tip, idx) => (<div key={idx} className="flex items-start text-sm text-gray-300"><span className="text-purple-400 mr-2 flex-shrink-0">💡</span>{tip}</div>))}</div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-sm"><span className="mr-2">📸</span>View Gallery</button><button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-sm"><span className="mr-2">🌍</span>360° View</button><button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-sm"><span className="mr-2">🎥</span>Virtual Tour</button></div></div></div>)}
                </div>
            ))}
        </div>
        {filteredDestinations.length === 0 && (<div className="text-center py-12"><div className="text-6xl mb-4">🔍</div><h3 className="text-xl font-semibold text-white mb-2">No destinations found</h3><p className="text-gray-400">Try adjusting your filters or search terms</p></div>)}
      </div>
    </section>
  );
};

export default ExploreSection;