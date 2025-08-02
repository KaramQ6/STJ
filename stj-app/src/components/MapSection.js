import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import destinations from '../data/destinations';

const MapSection = () => {
    return (
        <section className="py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Explore Our Destinations</h2>
                <MapContainer center={[31.2397, 36.2305]} zoom={7} style={{ height: '500px', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {destinations.map(destination => (
                        <Marker key={destination.id} position={destination.position}>
                            <Popup>
                                <div>
                                    <h3 className="font-bold">{destination.name}</h3>
                                    <p>{destination.description}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </section>
    );
};

export default MapSection;