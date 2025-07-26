import React, { useEffect, useRef } from 'react';

// هذا المكون يحتوي على كل ما يتعلق بتجربة الواقع المعزز
const ARGuide = ({ onExit }) => {
    const sceneRef = useRef(null);

    useEffect(() => {
        // --- هذا الجزء يحل مشكلة واجهة الجوال والـ PC ديناميكيًا ---
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const originalViewport = viewportMeta.getAttribute('content');
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

        // --- تسجيل مكون A-Frame ---
        if (!window.AFRAME.components['ar-handler']) {
            window.AFRAME.registerComponent('ar-handler', {
                init: function () {
                    this.userLat = 0; this.userLon = 0; this.activeTarget = null;
                    this.locations = [
                        { name: 'Jadara Uni. - Building A', lat: 32.4841, lon: 35.8890, desc: "Main administration building." },
                        { name: 'Irbid Clock Tower', lat: 32.5539, lon: 35.8587, desc: "A prominent landmark." },
                        { name: 'Amman Citadel', lat: 31.9545, lon: 35.9344, desc: "A famous historical site." },
                        { name: 'Calma Space', lat: 32.5400, lon: 35.8500, desc: "A popular spot in Irbid." }
                    ];
                    window.addEventListener('gps-camera-update-position', (e) => {
                        this.userLat = e.detail.position.latitude; this.userLon = e.detail.position.longitude;
                    });
                },
                tick: function () {
                    if (this.userLat === 0) return;
                    const targetPoi = document.getElementById('target-poi');
                    if (!this.activeTarget) {
                        const nearbyPlaces = this.findNearbyPlaces(2000); this.updateLocationList(nearbyPlaces); this.hideAllUI();
                    } else {
                        const distance = this.getDistance(this.userLat, this.userLon, this.activeTarget.lat, this.activeTarget.lon);
                        this.updateUIVisibility(distance); this.updateBottomPanel(this.activeTarget.name, distance);
                        const arrowContainer = document.getElementById('arrow-container');
                        if (arrowContainer && arrowContainer.getAttribute('visible')) {
                            targetPoi.setAttribute('gps-new-entity-place', `latitude: ${this.activeTarget.lat}; longitude: ${this.activeTarget.lon};`);
                            document.getElementById('arrow-distance').setAttribute('value', `${distance.toFixed(0)}m`);
                            // الحل النهائي لمشكلة اتجاه السهم
                            arrowContainer.object3D.lookAt(targetPoi.object3D.getWorldPosition(new window.THREE.Vector3()));
                        }
                    }
                },
                updateLocationList: function(places) { const list = document.getElementById('location-list'); const btns = document.getElementById('buttons-container'); if(this.activeTarget||!list) return; if(places.length===0){list.style.display='none';}else if(places.length===1){this.setActiveTarget(places[0]);}else{list.style.display='block';btns.innerHTML='';places.forEach(p=>{const btn=document.createElement('button');const d=this.getDistance(this.userLat,this.userLon,p.lat,p.lon);btn.innerHTML=`${p.name} (${d.toFixed(0)}m)`;btn.className='location-button';btn.onclick=()=>this.setActiveTarget(p);btns.appendChild(btn);});}},
                setActiveTarget: function(p){this.activeTarget=p;document.getElementById('location-list').style.display='none';},
                updateUIVisibility: function(d){const dt=75;const ic=document.getElementById('info-card');const ac=document.getElementById('arrow-container');if(!ic||!ac)return;if(d<dt){ic.setAttribute('visible',true);ac.setAttribute('visible',false);document.getElementById('card-title').setAttribute('value',this.activeTarget.name);document.getElementById('card-description').setAttribute('value',this.activeTarget.desc);}else{ic.setAttribute('visible',false);ac.setAttribute('visible',true);}},
                hideAllUI: function(){const els=['info-card','arrow-container','info-panel'];els.forEach(id=>{const el=document.getElementById(id);if(id!=='info-panel'&&el)el.setAttribute('visible',false);else if(el)el.style.display='none';});},
                findNearbyPlaces: function(r){return this.locations.filter(p=>this.getDistance(this.userLat,this.userLon,p.lat,p.lon)<r);},
                getDistance: (lat1,lon1,lat2,lon2)=>{const R=6371e3;const p1=lat1*Math.PI/180;const p2=lat2*Math.PI/180;const dP=(lat2-lat1)*Math.PI/180;const dL=(lon2-lon1)*Math.PI/180;const a=Math.sin(dP/2)*Math.sin(dP/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dL/2)*Math.sin(dL/2);const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));return R*c;},
                updateBottomPanel: (n,d)=>{const ip=document.getElementById('info-panel');if(ip){ip.innerHTML=`الوجهة: <strong>${n}</strong> | المسافة: <span>${d.toFixed(0)}</span> متر`;ip.style.display='block';}}
            });
        }
        
        return () => {
            // عند الخروج من وضع الـ AR، أعد إعدادات الصفحة الأصلية
            viewportMeta.setAttribute('content', originalViewport);
            const scene = sceneRef.current;
            if (scene && scene.parentNode) {
                scene.parentNode.removeChild(scene);
            }
        };
    }, []);

    return (
        <div className="ar-container">
            <div id="location-list" className="ui-panel"><h4>اختر وجهة:</h4><div id="buttons-container"></div></div>
            <a-scene
                ref={sceneRef}
                vr-mode-ui="enabled: false"
                arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false; trackingMethod: best;"
                renderer="antialias: true; alpha: true;"
                embedded
                ar-handler
            >
                {/* الحل النهائي لحركة الجيروسكوب */}
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
            <button onClick={onExit} className="exit-ar-button">خروج</button>
        </div>
    );
};

export default ARGuide;
