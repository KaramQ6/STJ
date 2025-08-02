import React from 'react';

const FeaturesSection = () => {
    return (
        <section className="py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Key Features</h2>
                <p className="text-lg md:text-xl text-gray-300 mb-12">Discover the amazing features that make our application unique.</p>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Feature 1</h3>
                        <p className="text-gray-300">Description of feature 1.</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Feature 2</h3>
                        <p className="text-gray-300">Description of feature 2.</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Feature 3</h3>
                        <p className="text-gray-300">Description of feature 3.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;