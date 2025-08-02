import React from 'react';

const InsightsSection = () => {
    return (
        <section className="py-20 bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Insights</h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">Discover valuable insights and analytics related to our application.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Insights data will be mapped here */}
                </div>
            </div>
        </section>
    );
};

export default InsightsSection;