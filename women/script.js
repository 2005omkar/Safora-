// Initialize map
let userMap = null;
let userMarker = null;
let currentLocation = null;
let currentAreaType = 'auto';

// Area safety modifiers based on location type
const areaModifier = {
    'Downtown': 8,
    'City Center': 10,
    'Residential Zone': 12,
    'Industrial Area': -5,
    'Commercial District': 6,
    'Suburban': 14,
    'auto': 0
};

// Real-time crime data simulation based on coordinates
// In production, this would call a real crime API
function getLocationBasedData(lat, lng) {
    // Simulate different safety parameters based on location
    // This is a demo - in real app, you'd fetch from crime databases
    
    // Use lat/lng to generate deterministic but varied values
    const seed = (Math.abs(lat) * 100 + Math.abs(lng) * 100) % 100;
    
    // Street lighting tends to be better in city centers
    let lighting = 5 + (seed % 6);
    let policePresence = 4 + ((seed * 2) % 7);
    let crimeRate = 3 + ((seed * 3) % 8);
    let cctvCoverage = 4 + ((seed * 2) % 7);
    
    // Area type detection based on coordinates (simplified)
    // In reality, you'd use reverse geocoding or map APIs
    let areaType = detectAreaType(lat, lng);
    
    // Adjust based on detected area
    if (areaType === 'City Center') {
        lighting = Math.min(10, lighting + 2);
        policePresence = Math.min(10, policePresence + 3);
        cctvCoverage = Math.min(10, cctvCoverage + 3);
    } else if (areaType === 'Residential Zone') {
        lighting = Math.min(10, lighting + 1);
        crimeRate = Math.max(0, crimeRate - 2);
    } else if (areaType === 'Industrial Area') {
        lighting = Math.max(0, lighting - 2);
        policePresence = Math.max(0, policePresence - 2);
        cctvCoverage = Math.max(0, cctvCoverage - 2);
    } else if (areaType === 'Suburban') {
        lighting = Math.max(0, lighting - 1);
        crimeRate = Math.max(0, crimeRate - 3);
        cctvCoverage = Math.max(0, cctvCoverage - 1);
    }
    
    return {
        lighting: Math.round(lighting),
        police: Math.round(policePresence),
        crime: Math.round(crimeRate),
        cctv: Math.round(cctvCoverage),
        areaType: areaType
    };
}

// Simple area detection based on coordinates (demo only)
// In production, use Google Places API or similar
function detectAreaType(lat, lng) {
    // This is a demo simulation
    // In reality, you'd use reverse geocoding to get area type
    
    // Simulate different areas based on coordinates
    const hash = (Math.abs(lat) * 1000 + Math.abs(lng) * 1000) % 100;
    
    if (hash < 15) return 'Downtown';
    if (hash < 30) return 'City Center';
    if (hash < 55) return 'Residential Zone';
    if (hash < 70) return 'Commercial District';
    if (hash < 85) return 'Suburban';
    return 'Industrial Area';
}

// Get area display name
function getAreaDisplayName(areaType) {
    const names = {
        'Downtown': '🏙️ Downtown',
        'City Center': '🌆 City Center',
        'Residential Zone': '🏘️ Residential Zone',
        'Industrial Area': '🏭 Industrial Area',
        'Commercial District': '🛍️ Commercial District',
        'Suburban': '🌳 Suburban Area',
        'auto': '📍 Live Location'
    };
    return names[areaType] || areaType;
}

// Compute safety score based on all parameters
function computeSafetyScore(lighting, police, crimeRisk, cctv, areaKey) {
    // Weighted calculation
    const lightingContribution = (lighting / 10) * 30;
    const policeContribution = (police / 10) * 30;
    const crimeSafetyContrib = ((10 - crimeRisk) / 10) * 25;
    const cctvContribution = (cctv / 10) * 15;
    
    let baseScore = lightingContribution + policeContribution + crimeSafetyContrib + cctvContribution;
    
    const modifier = areaModifier[areaKey] || 0;
    let finalScore = baseScore + modifier;
    
    finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));
    return finalScore;
}

// Get safety level description
function getSafetyLevel(score) {
    if (score >= 85) {
        return { 
            text: "🟢 Very Safe", 
            badge: "✅ Excellent! This area has good safety infrastructure. Well-lit streets, active patrols, and low crime rates.", 
            icon: "🌟"
        };
    }
    if (score >= 70) {
        return { 
            text: "🟡 Moderately Safe", 
            badge: "⚠️ Generally safe, but stay aware especially at night. Consider well-lit routes.", 
            icon: "🟡"
        };
    }
    if (score >= 50) {
        return { 
            text: "🟠 Caution Needed", 
            badge: "⚠️ Exercise caution. Avoid isolated areas, especially after dark. Stay in groups when possible.", 
            icon: "⚠️"
        };
    }
    return { 
        text: "🔴 High Alert", 
        badge: "❗ High risk area. Avoid walking alone, especially at night. Use ride-sharing services when possible.", 
        icon: "🚨"
    };
}

// Update circle gradient
function updateCircleGradient(score) {
    const angle = (score / 100) * 360;
    const progressCircle = document.getElementById('progressCircle');
    progressCircle.style.background = `conic-gradient(#ffb347 0deg ${angle}deg, #e2e8f0 ${angle}deg 360deg)`;
}

// Update all UI elements
function refreshSafetyDisplay() {
    const lighting = parseInt(document.getElementById('lightingSlider').value, 10);
    const police = parseInt(document.getElementById('policeSlider').value, 10);
    const crimeRisk = parseInt(document.getElementById('crimeSlider').value, 10);
    const cctv = parseInt(document.getElementById('cctvSlider').value, 10);
    let areaSelect = document.getElementById('areaSelect').value;
    
    // If auto is selected and we have location data, use that area type
    let areaKey = areaSelect;
    let displayArea = getAreaDisplayName(areaKey);
    
    if (areaSelect === 'auto' && currentAreaType && currentAreaType !== 'auto') {
        areaKey = currentAreaType;
        displayArea = getAreaDisplayName(currentAreaType) + " (Auto-detected)";
    }
    
    const safetyScore = computeSafetyScore(lighting, police, crimeRisk, cctv, areaKey);
    const safetyMeta = getSafetyLevel(safetyScore);
    
    // Update displays
    document.getElementById('scoreNumber').innerText = safetyScore;
    document.getElementById('safetyStatusText').innerHTML = `${safetyMeta.icon} ${safetyMeta.text}`;
    document.getElementById('recommendBadge').innerHTML = safetyMeta.badge;
    document.getElementById('currentArea').innerHTML = displayArea;
    document.getElementById('detailLighting').innerHTML = `${lighting}.0/10`;
    document.getElementById('detailPolice').innerHTML = `${police}.0/10`;
    document.getElementById('detailCCTV').innerHTML = `${cctv}.0/10`;
    
    const crimeImpactPercent = ((10 - crimeRisk) / 10) * 100;
    document.getElementById('detailCrimeImpact').innerHTML = `${crimeRisk}.0/10 risk → ${Math.round(crimeImpactPercent)}% safety factor`;
    
    let areaBonusText = displayArea;
    const modVal = areaModifier[areaKey];
    if (modVal > 0) {
        areaBonusText += ` (+${modVal} safety bonus)`;
    } else if (modVal < 0) {
        areaBonusText += ` (${modVal} penalty)`;
    }
    document.getElementById('detailAreaBonus').innerHTML = areaBonusText;
    
    updateCircleGradient(safetyScore);
    
    // Update badge color
    const badge = document.getElementById('recommendBadge');
    if (safetyScore >= 85) {
        badge.style.background = "#dff9e6";
        badge.style.color = "#1f6e43";
    } else if (safetyScore >= 70) {
        badge.style.background = "#fff1e0";
        badge.style.color = "#b45f06";
    } else if (safetyScore >= 50) {
        badge.style.background = "#ffe4e0";
        badge.style.color = "#b13e3e";
    } else {
        badge.style.background = "#ffe1e6";
        badge.style.color = "#a1222a";
    }
    
    // Update slider value displays
    document.getElementById('lightingValue').innerText = lighting;
    document.getElementById('policeValue').innerText = police;
    document.getElementById('crimeValue').innerText = crimeRisk;
    document.getElementById('cctvValue').innerText = cctv;
    
    // Update last updated timestamp
    const now = new Date();
    document.getElementById('lastUpdated').innerHTML = `Last updated: ${now.toLocaleTimeString()}`;
}

// Initialize map
function initMap(lat, lng) {
    if (userMap) {
        userMap.remove();
    }
    
    userMap = L.map('miniMap').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(userMap);
    
    if (userMarker) {
        userMarker.remove();
    }
    
    userMarker = L.marker([lat, lng]).addTo(userMap);
    userMarker.bindPopup('<b>Your Location</b><br>Safety analysis active').openPopup();
}

// Get user's live location
function getLiveLocation() {
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const locationDetails = document.getElementById('locationDetails');
    
    statusText.innerHTML = "Getting your location...";
    statusIndicator.className = "status-indicator";
    
    if (!navigator.geolocation) {
        statusText.innerHTML = "❌ Geolocation is not supported by your browser";
        statusIndicator.className = "status-indicator error";
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            currentLocation = { lat, lng };
            
            statusText.innerHTML = "✅ Location acquired!";
            statusIndicator.className = "status-indicator active";
            
            // Display location details
            document.getElementById('latValue').innerHTML = lat.toFixed(6);
            document.getElementById('lngValue').innerHTML = lng.toFixed(6);
            locationDetails.style.display = "block";
            
            // Get location-based safety data
            const locationData = getLocationBasedData(lat, lng);
            currentAreaType = locationData.areaType;
            document.getElementById('areaTypeValue').innerHTML = getAreaDisplayName(currentAreaType);
            
            // Update sliders with location-based data
            document.getElementById('lightingSlider').value = locationData.lighting;
            document.getElementById('policeSlider').value = locationData.police;
            document.getElementById('crimeSlider').value = locationData.crime;
            document.getElementById('cctvSlider').value = locationData.cctv;
            
            // Initialize map
            initMap(lat, lng);
            
            // Update safety display
            refreshSafetyDisplay();
            
            // Show success message
            showToast("Location detected! Safety parameters updated for your area.", "success");
            
            // Auto-set area select to auto if not manually changed
            const areaSelect = document.getElementById('areaSelect');
            if (areaSelect.value !== 'auto') {
                // User can keep manual selection
            }
            
        },
        (error) => {
            let errorMsg = "";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = "Location access denied. Please enable location services.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = "Location information unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMsg = "Location request timed out.";
                    break;
                default:
                    errorMsg = "An unknown error occurred.";
            }
            statusText.innerHTML = `❌ ${errorMsg}`;
            statusIndicator.className = "status-indicator error";
            showToast(errorMsg, "error");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Show toast notification
function showToast(message, type = "info") {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: #1e3a4d;
            color: white;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
        
        // Add animation style
        if (!document.getElementById('toastStyle')) {
            const style = document.createElement('style');
            style.id = 'toastStyle';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    toast.style.background = type === 'error' ? '#dc2626' : (type === 'success' ? '#10b981' : '#1e3a4d');
    toast.innerHTML = message;
    toast.style.display = 'block';
    toast.style.animation = 'slideIn 0.3s ease';
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

// Bind all event listeners
function bindEvents() {
    document.getElementById('getLocationBtn').addEventListener('click', getLiveLocation);
    document.getElementById('calcBtn').addEventListener('click', () => {
        refreshSafetyDisplay();
        showToast("Safety score updated!", "success");
    });
    
    // Add event listeners to all sliders
    const sliders = ['lightingSlider', 'policeSlider', 'crimeSlider', 'cctvSlider'];
    sliders.forEach(sliderId => {
        document.getElementById(sliderId).addEventListener('input', refreshSafetyDisplay);
    });
    
    document.getElementById('areaSelect').addEventListener('change', () => {
        refreshSafetyDisplay();
        showToast("Area type updated", "info");
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    refreshSafetyDisplay();
    
    // Optional: Auto-request location on load
    setTimeout(() => {
        if (confirm("Allow location access to get real-time safety data for your area?")) {
            getLiveLocation();
        }
    }, 1000);
});