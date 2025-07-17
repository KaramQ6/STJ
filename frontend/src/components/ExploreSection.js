import React, { useState } from 'react';

const ExploreSection = ({ exploreRef, isVisible }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const categories = [
        {
            id: 'nature',
            title: 'Nature',
            description: 'Explore Jordan\'s breathtaking natural wonders.',
            image: 'https://images.pexels.com/photos/17645580/pexels-photo-17645580.jpeg',
            fullDescription: 'From the otherworldly red sands of Wadi Rum to the therapeutic waters of the Dead Sea, Jordan\'s natural landscapes offer some of the world\'s most breathtaking experiences.',
            highlights: ['Stargazing in Wadi Rum', 'Floating in the Dead Sea', 'Hiking in Dana Reserve', 'Bird watching at Azraq']
        },
        {
            id: 'culture',
            title: 'Culture',
            description: 'Discover Jordan\'s rich cultural heritage.',
            image: 'https://images.pexels.com/photos/3214958/pexels-photo-3214958.jpeg',
            fullDescription: 'Jordan\'s cultural treasures span millennia, from the rose-red city of Petra to the remarkably preserved Roman ruins of Jerash.',
            highlights: ['Petra\'s Treasury & Monastery', 'Jerash\'s Colonnaded Streets', 'Bedouin Hospitality', 'Amman Citadel']
        },
        {
            id: 'religious',
            title: 'Religious',
            description: 'Follow in the footsteps of prophets.',
            image: 'https://images.unsplash.com/photo-1750357445390-264bfe3b6db2',
            fullDescription: 'Jordan holds deep spiritual significance for three major world religions. Experience profound spiritual journeys in breathtaking natural settings.',
            highlights: ['Mount Nebo', 'Baptism Site of Jesus', 'Madaba Map Mosaic', 'Fortress of Machaerus']
        },
        {
            id: 'adventure',
            title: 'Adventure',
            description: 'Experience thrilling adventures.',
            image: 'https://images.unsplash.com/photo-1750357437870-5b4ef7f03df8',
            fullDescription: 'Jordan offers world-class adventure experiences for thrill-seekers. Soar over Martian landscapes, dive into coral-rich waters, and explore hidden canyons.',
            highlights: ['Hot Air Balloon over Wadi Rum', 'Desert Camping', 'Red Sea Diving', 'Canyoning Adventures']
        }
    ];

    return (
        <section ref={exploreRef} id="explore" className="py-20 bg-gray-800">
            <div className="container">
                <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.explore ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <h2 className="section-title">Discover Jordan Your Way</h2>
                    <p className="section-subtitle">Choose your adventure and let our smart guide customize your perfect Jordan experience.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <div key={category.id} className="card hover-lift" onClick={() => setSelectedCategory(category)}>
                            <div className="h-48 bg-cover bg-center rounded-t-lg" style={{ backgroundImage: `url(${category.image})` }}></div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                                <p className="text-gray-400 text-sm">{category.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedCategory && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="modal-close" onClick={() => setSelectedCategory(null)}>&times;</span>
                        <h2 className="section-title">{selectedCategory.title}</h2>
                        <p className="section-subtitle">{selectedCategory.fullDescription}</p>
                        <ul className="list-disc list-inside text-gray-300">
                            {selectedCategory.highlights.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ExploreSection;