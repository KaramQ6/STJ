import React from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ExploreSection from './components/ExploreSection';
import ARSection from './components/ARSection';
import MapSection from './components/MapSection';
import InsightsSection from './components/InsightsSection';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import GalleryModal from './components/GalleryModal';
import './styles/index.css';

const App = () => {
    return (
        <div className="App">
            <Navigation />
            <HeroSection />
            <FeaturesSection />
            <ExploreSection />
            <ARSection />
            <MapSection />
            <InsightsSection />
            <Footer />
            <Chatbot />
            <GalleryModal />
        </div>
    );
};

export default App;