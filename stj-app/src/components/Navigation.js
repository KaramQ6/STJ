import React from 'react';

const Navigation = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">STJ App</h1>
                <ul className="flex space-x-4">
                    <li><a href="#home" className="text-white hover:text-purple-400">Home</a></li>
                    <li><a href="#features" className="text-white hover:text-purple-400">Features</a></li>
                    <li><a href="#explore" className="text-white hover:text-purple-400">Explore</a></li>
                    <li><a href="#map" className="text-white hover:text-purple-400">Map</a></li>
                    <li><a href="#insights" className="text-white hover:text-purple-400">Insights</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;