// src/ARGuide.js

import React, { useEffect } from 'react';

// --- دالة التحقق من دعم الحساسات ---
const checkSensorSupport = () => {
    return new Promise((resolve, reject) => {
        if (!window.DeviceOrientationEvent) {
            return reject(new Error("جهازك لا يدعم حساسات الحركة (الجيروسكوب)."));
        }
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') resolve();
                    else reject(new Error("تم رفض إذن الوصول إلى حساسات الحركة."));
                }).catch(err => reject(err));
        } else {
            const handleOrientation = (event) => {
                if (event.alpha !== null || event.webkitCompassHeading !== undefined) {
                    window.removeEventListener('deviceorientation', handleOrientation);
                    resolve();
                }
            };
            window.addEventListener('deviceorientation', handleOrientation);
            setTimeout(() => {
                window.removeEventListener('deviceorientation', handleOrientation);
                reject(new Error("لم يتمكن من كشف حساسات الحركة. يرجى التأكد من تفعيلها في إعدادات المتصفح."));
            }, 3000);
        }
    });
};

const ARGuide = ({ onExit }) => {

    useEffect(() => {
        // تسجيل مكون A-Frame عند تحميل هذا المكون
        window.AFRAME.registerComponent('ar-handler', {
            init: function () {
                this.userLat = 0;
                this.userLon = 0;
                this.activeTarget = null;
                this.locations = [
                    { name: 'Jadara Uni. - Building A', lat: 32.4841, lon: 35.8890, desc: "Main administration building." },
                    { name: 'Irbid Clock Tower', lat: 32.5539, lon: 35.8587, desc: "A prominent landmark." },
                    { name: 'Amman Citadel', lat: 31.9545, lon: 35.9344, desc: "A famous historical site." },
                    { name: 'Calma Space', lat: 32.5400, lon: 35.8500, desc: "A popular spot in Irbid." }
                ];

                window.addEventListener('gps-camera-update-position', (e) => {
                    this.userLat = e.detail.position.latitude;
                    this.userLon = e.detail.position.longitude;
                });
            },

            tick: function () {
                if (this.userLat === 0) return;

                if (!this.activeTarget) {
                    const nearbyPlaces = this.findNearbyPlaces(2000);
                    this.updateLocationList(nearbyPlaces);
                    this.hideAllUI();
                } else {
                    const distance = this.getDistance(this.userLat, this.userLon, this.activeTarget.lat, this.activeTarget.lon);
                    this.updateUIVisibility(distance);
                    this.updateBottomPanel(this.activeTarget.name, distance);

                    const arrowContainer = document.getElementById('arrow-container');
                    if(arrowContainer.getAttribute('visible')) {
                        const targetPoi = document.getElementById('target-poi');
                        targetPoi.setAttribute('gps-new-entity-place', `latitude: ${this.activeTarget.lat}; longitude: ${this.activeTarget.lon};`);
                        document.getElementById('arrow-distance').setAttribute('value', `${distance.toFixed(0)}m`);
                        arrowContainer.object3D.lookAt(targetPoi.object3D.position);
                    }
                }
            },
            // ... باقي دوال المكون (getDistance, findNearbyPlaces, etc.)
            updateLocationList: function(places) {
                const listContainer = document.getElementById('location-list');
                const buttonsContainer = document.getElementById('buttons-container');

                if (this.activeTarget || !listContainer) return;

                if (places.length === 0) {
                    listContainer.style.display = 'none';
                } else if (places.length === 1) {
                    this.setActiveTarget(places[0]);
                } else {
                    listContainer.style.display = 'block';
                    buttonsContainer.innerHTML = '';
                    places.forEach(place => {
                        const button = document.createElement('button');
                        const distance = this.getDistance(this.userLat, this.userLon, place.lat, place.lon);
                        button.innerHTML = `${place.name} (${distance.toFixed(0)}m)`;
                        button.className = 'location-button';
                        button.onclick = () => this.setActiveTarget(place);
                        buttonsContainer.appendChild(button);
                    });
                }
            },
            setActiveTarget: function(place) { this.activeTarget = place; document.getElementById('location-list').style.display = 'none'; },
            updateUIVisibility: function(distance) {
                const distanceThreshold = 75;
                const infoCard = document.getElementById('info-card');
                const arrowContainer = document.getElementById('arrow-container');
                if (distance < distanceThreshold) {
                    infoCard.setAttribute('visible', true); arrowContainer.setAttribute('visible', false);
                    document.getElementById('card-title').setAttribute('value', this.activeTarget.name);
                    document.getElementById('card-description').setAttribute('value', this.activeTarget.desc);
                } else {
                    infoCard.setAttribute('visible', false); arrowContainer.setAttribute('visible', true);
                }
            },
            hideAllUI: function() {
                const infoCard = document.getElementById('info-card');
                const arrowContainer = document.getElementById('arrow-container');
                const infoPanel = document.getElementById('info-panel');
                if (infoCard) infoCard.setAttribute('visible', false);
                if (arrowContainer) arrowContainer.setAttribute('visible', false);
                if (infoPanel) infoPanel.style.display = 'none';
            },
            findNearbyPlaces: function(radius) { return this.locations.filter(place => this.getDistance(this.userLat, this.userLon, place.lat, place.lon) < radius); },
            getDistance: (lat1, lon1, lat2, lon2) => {
                const R = 6371000; const toRad = (deg) => deg * Math.PI / 180;
                const dLat = toRad(lat2 - lat1); const dLon = toRad(lon2 - lon1);
                const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c;
            },
            updateBottomPanel: (name, distance) => {
                const infoPanel = document.getElementById('info-panel');
                if(infoPanel) {
                    infoPanel.innerHTML = `الوجهة: <strong>${name}</strong> | المسافة: <span>${distance.toFixed(0)}</span> متر`;
                    infoPanel.style.display = 'block';
                }
            }
        });
    }, []);


    return (
        <div className="ar-container">
            <div id="location-list" className="ui-panel">
                <h4>اختر وجهة:</h4>
                <div id="buttons-container"></div>
            </div>

            <a-scene
                vr-mode-ui="enabled: false"
                arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false; trackingMethod: best;"
                renderer="antialias: true; alpha: true;"
                embedded
                ar-handler>

                {/* الحل لمشكلة حركة السهم (الجيروسكوب) */}
                <a-camera gps-new-camera="gpsMinDistance: 5" rotation-reader>
                    <a-entity id="info-card" position="0 -0.8 -2.5" visible="false">
                         <a-plane width="1.8" height="0.8" color="#8B5CF6" material="transparent: true; opacity: 0.9" rounded="radius: 0.05"></a-plane>
                         <a-text id="card-title" value="" color="#FFFFFF" align="center" width="3" position="0 0.2 0.01"></a-text>
                         <a-text id="card-description" value="" color="#E0E0E0" align="center" width="1.7" position="0 -0.1 0.01"></a-text>
                    </a-entity>

                    <a-entity id="arrow-container" position="0 0 -4" visible="false">
                        <a-cone id="arrow-cone" color="yellow" radius-bottom="0.3" radius-top="0" height="0.5" rotation="-90 0 0"></a-cone>
                        <a-text id="arrow-distance" value="" color="white" align="center" position="0 0.8 0" width="8"></a-text>
                    </a-entity>
                </a-camera>
                <a-entity id="target-poi"></a-entity>
            </a-scene>

            <div id="info-panel" className="info-panel ui-panel"></div>

            <button onClick={onExit} className="exit-ar-button">Exit AR</button>
        </div>
    );
};

// قم بتصدير المكون الجديد
export { ARGuide, checkSensorSupport };