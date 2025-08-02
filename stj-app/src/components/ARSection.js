import React from 'react';

const ARSection = () => {
    return (
        <section className="py-20 bg-gray-800/50 flex flex-col justify-center items-center">
            <div className="container text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Augmented Reality Experience
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                    Discover the wonders of augmented reality and explore interactive content that brings your experience to life.
                </p>
                <a href="ar.html" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    🥽 Launch AR Experience
                </a>
            </div>
        </section>
    );
};

export default ARSection;