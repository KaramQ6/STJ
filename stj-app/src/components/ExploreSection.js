import React from 'react';
import destinations from '../data/destinations';

const ExploreSection = () => {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-poppins">Explore Destinations</h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-inter">Discover the beauty and culture of various destinations.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((destination, index) => (
                        <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                            <img src={destination.image} alt={destination.name} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-2 font-poppins">{destination.name}</h3>
                                <p className="text-gray-300 text-sm mb-4 font-inter">{destination.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExploreSection;