// Starfield animation with enhanced cosmic effects
function initStarfield() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) {
        console.error('Canvas element with ID "starCanvas" not found. Check index.html for <canvas id="starCanvas">.');
        return;
    }
    console.log('Canvas element found:', canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context. Ensure browser supports canvas 2D.');
        return;
    }
    console.log('2D context acquired successfully.');

    const scanBtn = document.getElementById('scanBtn');
    if (!scanBtn) {
        console.warn('Scan button with ID "scanBtn" not found. Scanning effect will be disabled.');
    } else {
        console.log('Scan button found:', scanBtn);
    }

    // Set canvas size and update on resize
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(`Canvas resized to: ${canvas.width}x${canvas.height} pixels`);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star objects with glowing trails and color variation
    const stars = [];
    function spawnStar() {
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y, speedX, speedY;
        if (edge === 0) { x = Math.random() * canvas.width; y = -15; speedY = Math.random() * 0.7 + 0.2; speedX = (Math.random() - 0.5) * 0.3; }
        else if (edge === 1) { x = canvas.width + 15; y = Math.random() * canvas.height; speedX = -(Math.random() * 0.7 + 0.2); speedY = (Math.random() - 0.5) * 0.3; }
        else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + 15; speedY = -(Math.random() * 0.7 + 0.2); speedX = (Math.random() - 0.5) * 0.3; }
        else { x = -15; y = Math.random() * canvas.height; speedX = Math.random() * 0.7 + 0.2; speedY = (Math.random() - 0.5) * 0.3; }
        stars.push({
            x, y,
            radius: Math.random() * 3 + 1,
            baseSpeedX: speedX,
            baseSpeedY: speedY,
            fastSpeedX: speedX * 50,
            fastSpeedY: speedY * 50,
            color: `hsl(${Math.random() * 360}, 70%, 85%)`
        });
        if (stars.length < 200) setTimeout(spawnStar, Math.random() * 300);
    }
    spawnStar();

    // Meteor objects with fiery trails
    const meteors = [];
    function spawnMeteor() {
        const edge = Math.floor(Math.random() * 4);
        let x, y, speedX, speedY;
        if (edge === 0) { x = Math.random() * canvas.width; y = -25; speedY = Math.random() * 15 + 7; speedX = (Math.random() - 0.5) * 7; }
        else if (edge === 1) { x = canvas.width + 25; y = Math.random() * canvas.height; speedX = -(Math.random() * 15 + 7); speedY = (Math.random() - 0.5) * 7; }
        else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + 25; speedY = -(Math.random() * 15 + 7); speedX = (Math.random() - 0.5) * 7; }
        else { x = -25; y = Math.random() * canvas.height; speedX = Math.random() * 15 + 7; speedY = (Math.random() - 0.5) * 7; }
        meteors.push({
            x, y,
            radius: Math.random() * 3 + 2,
            speedX, speedY,
            trailLength: Math.random() * 30 + 20,
            color: `hsl(${Math.random() * 60 + 180}, 90%, 70%)`
        });
        if (meteors.length < 10) setTimeout(spawnMeteor, Math.random() * 1200);
    }
    spawnMeteor();

    // Particle explosions for scanning effect
    const particles = [];
    function spawnParticle(x, y) {
        for (let i = 0; i < 20; i++) {
            particles.push({
                x, y,
                radius: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 12,
                speedY: (Math.random() - 0.5) * 12,
                life: Math.random() * 60 + 40,
                color: `hsl(${Math.random() * 360}, 80%, 75%)`
            });
        }
    }

    let vortexAngle = 0;
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const isScanning = scanBtn && scanBtn.disabled && scanBtn.textContent === 'Scanning...';
        if (isScanning) {
            vortexAngle += 0.1;
            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 1.5);
            gradient.addColorStop(0, 'rgba(148, 0, 211, 0.8)');
            gradient.addColorStop(0.5, 'rgba(0, 191, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(vortexAngle);
            ctx.scale(1 + Math.sin(vortexAngle) * 0.3, 1 + Math.cos(vortexAngle) * 0.3);
            ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
            ctx.restore();

            spawnParticle(canvas.width / 2, canvas.height / 2);
        }

        ctx.fillStyle = '#ffffff';
        stars.forEach((star, index) => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            if (isScanning) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = star.color;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`;
            } else {
                ctx.shadowBlur = 5;
                ctx.fillStyle = star.color;
            }
            ctx.fill();
            const speedX = isScanning ? star.fastSpeedX : star.baseSpeedX;
            const speedY = isScanning ? star.fastSpeedY : star.baseSpeedY;
            star.x += speedX;
            star.y += speedY;
            if (star.x < -15 || star.x > canvas.width + 15 || star.y < -15 || star.y > canvas.height + 15) {
                stars.splice(index, 1);
                spawnStar();
            }
        });

        ctx.strokeStyle = '#ffffff';
        meteors.forEach((meteor, index) => {
            ctx.lineWidth = meteor.radius;
            ctx.beginPath();
            ctx.moveTo(meteor.x, meteor.y);
            ctx.lineTo(meteor.x - meteor.speedX * 3, meteor.y - meteor.speedY * 3);
            ctx.strokeStyle = meteor.color;
            if (isScanning) {
                ctx.shadowBlur = 30;
                ctx.shadowColor = meteor.color;
            } else {
                ctx.shadowBlur = 10;
            }
            ctx.stroke();
            meteor.x += meteor.speedX * (isScanning ? 3 : 1);
            meteor.y += meteor.speedY * (isScanning ? 3 : 1);
            if (meteor.x < -meteor.trailLength || meteor.x > canvas.width + meteor.trailLength || meteor.y < -meteor.trailLength || meteor.y > canvas.height + meteor.trailLength) {
                meteors.splice(index, 1);
                spawnMeteor();
            }
        });

        particles.forEach((particle, index) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life--;
            if (particle.life <= 0) particles.splice(index, 1);
        });

        requestAnimationFrame(animate);
    }
    console.log('Starting starfield animation loop.');
    animate();
}

// Fetch data from API with enhanced error handling
async function fetchData(endpoint) {
    console.log(`Attempting to fetch from /api/${endpoint}`);
    try {
        const response = await fetch(`/api/${endpoint}`, { timeout: 30000 });
        console.log(`Response for ${endpoint}:`, response);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log(`Data for ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        return { error: `Failed to fetch ${endpoint}: ${error.message}` };
    }
}

// Update status indicators with visual feedback
function updateStatus(elementId, status) {
    const statusElement = document.getElementById(elementId);
    if (!statusElement) {
        console.warn(`Status element with ID ${elementId} not found.`);
        return;
    }
    statusElement.classList.remove('status-standby', 'status-active', 'status-error');
    statusElement.classList.add(`status-${status.toLowerCase()}`);
    statusElement.textContent = status.toUpperCase();
}

// Initialize Leaflet map for IP Info
let map = null;
function initMap(latitude, longitude) {
    const mapDiv = document.getElementById('ip-map');
    if (!mapDiv) {
        console.warn('Map div with ID "ip-map" not found.');
        return;
    }
    mapDiv.style.display = 'block';
    mapDiv.style.height = '250px';
    if (map) map.remove();
    map = L.map('ip-map').setView([latitude, longitude], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([latitude, longitude]).addTo(map).bindPopup('Your Location').openPopup();
}

// Calculate overall network health with detailed feedback
function calculateHealth(speedData, wifiData) {
    let score = 0;
    let maxScore = 12;
    let summary = [];

    if (speedData.error) {
        summary.push('Speed test unavailable: Check connection');
    } else {
        if (speedData.download_mbps > 20) { score += 2; summary.push('Download: Excellent'); }
        else if (speedData.download_mbps > 5) { score += 1; summary.push('Download: Fair'); }
        else summary.push('Download: Poor');
        if (speedData.upload_mbps > 20) score += 2;
        else if (speedData.upload_mbps > 5) score += 1;
        if (speedData.ping_ms < 50) { score += 2; summary.push('Ping: Excellent'); }
        else if (speedData.ping_ms < 100) { score += 1; summary.push('Ping: Fair'); }
        else summary.push('Ping: Poor');
        if (speedData.packet_loss === 0) { score += 2; summary.push('Packet Loss: None'); }
        else if (speedData.packet_loss < 2) { score += 1; summary.push('Packet Loss: Low'); }
        else summary.push('Packet Loss: High');
    }

    if (wifiData.signal_strength) {
        const signal = parseInt(wifiData.signal_strength) || 0;
        if (signal > 80) { score += 2; summary.push('Signal: Strong'); }
        else if (signal > 50) { score += 1; summary.push('Signal: Moderate'); }
        else summary.push('Signal: Weak');
    } else summary.push('Signal: Unavailable');
    if (wifiData.secured) {
        if (wifiData.secured.includes('WPA2') || wifiData.secured.includes('WPA3')) { score += 2; summary.push('Security: High'); }
        else summary.push('Security: Low');
    } else summary.push('Security: Unknown');

    const scorePercentage = Math.round((score / maxScore) * 100);
    let status = scorePercentage >= 75 ? 'Excellent' : scorePercentage >= 50 ? 'Good' : scorePercentage >= 25 ? 'Fair' : 'Poor';
    return { status, summary: summary.join(', '), score: scorePercentage };
}

// Main scan function with enhanced visual feedback
async function initiateScan() {
    const scanBtn = document.getElementById('scanBtn');
    const loading = document.getElementById('loading');
    const loadingOverlay = document.getElementById('loading-overlay');
    if (!scanBtn || !loading) {
        console.error('Scan button or loading element not found.');
        return;
    }
    if (loadingOverlay) loadingOverlay.style.display = 'block';
    scanBtn.disabled = true;
    scanBtn.textContent = 'Scanning...';
    scanBtn.classList.add('scanning');
    loading.style.display = 'inline';

    try {
        const [speedData, ipData, deviceData, networkData, wifiData] = await Promise.all([
            fetchData('speed'),
            fetchData('ip'),
            fetchData('device'),
            fetchData('network'),
            fetchData('wifi')
        ]);

        // Update Speed Test card
        updateStatus('speed-status', speedData.error ? 'error' : 'active');
        if (!speedData.error) {
            document.getElementById('download-speed').textContent = speedData.download_mbps || '--';
            document.getElementById('upload-speed').textContent = speedData.upload_mbps || '--';
            document.getElementById('ping-time').textContent = speedData.ping_ms || '--';
            document.getElementById('speed-isp').textContent = speedData.isp || '--';
            document.getElementById('speed-host').textContent = speedData.host || '--';
            document.getElementById('speed-server-location').textContent = speedData.server_location || '--';
            document.getElementById('speed-latency').textContent = speedData.latency || '--';
            document.getElementById('speed-packet-loss').textContent = speedData.packet_loss !== null ? speedData.packet_loss : '--';
        } else {
            document.getElementById('speed-details').innerHTML = `<div class="text-red-500">Error: ${speedData.error}</div>`;
        }

        // Update IP Info card
        updateStatus('ip-status', ipData.error ? 'error' : 'active');
        if (!ipData.error && ipData.latitude && ipData.longitude) {
            document.getElementById('public-ip').textContent = ipData.ip || '--';
            initMap(parseFloat(ipData.latitude), parseFloat(ipData.longitude));
        } else {
            document.getElementById('ip-details').innerHTML = `<div class="text-red-500">Error: ${ipData.error || 'No location data'}</div>`;
        }

        // Update Device Info card
        updateStatus('device-status', deviceData.error ? 'error' : 'active');
        if (!deviceData.error) {
            document.getElementById('device-name').textContent = deviceData.device_name || '--';
            document.getElementById('os-name').textContent = deviceData.platform || '--';
            document.getElementById('platform-name').textContent = deviceData.release || '--';
        } else {
            document.getElementById('device-details').innerHTML = `<div class="text-red-500">Error: ${deviceData.error}</div>`;
        }

        // Update Network Type card
        updateStatus('network-status', networkData.error ? 'error' : 'active');
        if (!networkData.error) {
            document.getElementById('network-type').textContent = networkData.network_type || '--';
        } else {
            document.getElementById('network-details').innerHTML = `<div class="text-red-500">Error: ${networkData.error}</div>`;
        }
        if (!wifiData.error) {
            document.getElementById('wifi-name').textContent = wifiData.network_name || '--';
            document.getElementById('signal-strength').textContent = wifiData.signal_strength || '--';
        } else {
            document.getElementById('wifi-name').textContent = '--';
            document.getElementById('signal-strength').textContent = '--';
        }

        // Update Security card
        updateStatus('security-status', wifiData.error ? 'error' : 'active');
        if (!wifiData.error) {
            document.getElementById('encryption-type').textContent = wifiData.secured || '--';
            document.getElementById('security-level').textContent = wifiData.secured && (wifiData.secured.includes('WPA2') || wifiData.secured.includes('WPA3')) ? 'Secure' : 'Insecure';
        } else {
            document.getElementById('security-details').innerHTML = `<div class="text-red-500">Error: ${wifiData.error}</div>`;
        }

        // Update Overall Health card
        const health = calculateHealth(speedData, wifiData);
        updateStatus('health-status', health.status.toLowerCase());
        document.getElementById('health-summary').innerHTML = `Score: ${health.score}/100 - ${health.summary}`;
    } catch (error) {
        console.error('Scan failed:', error);
        updateStatus('speed-status', 'error');
        document.getElementById('speed-details').innerHTML = `<div class="text-red-500">Error: Scan failed</div>`;
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        scanBtn.disabled = false;
        scanBtn.textContent = 'ACTIVATE COSMIC SCAN';
        scanBtn.classList.remove('scanning');
        loading.style.display = 'none';
    }
}

// Attach scan event and initialize
document.getElementById('scanBtn')?.addEventListener('click', initiateScan);
window.onload = () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    initStarfield();
};