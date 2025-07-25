from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.requests import Request
from fastapi.staticfiles import StaticFiles
import speedtest
import httpx
import platform
import socket
import os
import subprocess
import psutil
import re
from dotenv import load_dotenv

load_dotenv()  # Load .env file (optional, overridden by Render env vars)
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Get IPGeolocation API key from environment or use default
IPGEOLOCATION_API_KEY = os.getenv("IPGEOLOCATION_API_KEY", "1e061448f1b346749ba9bcccdfb5eb63")

# Helper function to convert dBm to percentage (for macOS Wi-Fi signal strength)
def dbm_to_percentage(rssi, min_rssi=-100, max_rssi=-30):
    try:
        percentage = max(0, min(100, int((rssi - min_rssi) / (max_rssi - min_rssi) * 100)))
        return f"{percentage}%"
    except Exception:
        return "Unknown"

# Platform-specific Wi-Fi information retrieval (simplified for compatibility)
def get_wifi_info():
    try:
        system = platform.system().lower()
        if system == "windows":
            output = subprocess.check_output("netsh wlan show interfaces", shell=True, text=True)
            ssid = re.search(r"SSID\s+:\s+(.+)", output)
            signal = re.search(r"Signal\s+:\s+(.+)", output)
            security = re.search(r"Authentication\s+:\s+(.+)", output)
            if ssid and signal and security:
                return {
                    "network_name": ssid.group(1).strip(),
                    "signal_strength": signal.group(1).strip(),
                    "secured": security.group(1).strip()
                }
        elif system == "linux":
            output = subprocess.check_output("nmcli -t -f IN-USE,SSID,SIGNAL,SECURITY device wifi list", shell=True, text=True)
            for line in output.splitlines():
                if line.startswith("*"):
                    fields = line.split(":")
                    if len(fields) >= 4:
                        return {
                            "network_name": fields[1].strip(),
                            "signal_strength": f"{fields[2].strip()}%",
                            "secured": fields[3].strip() or "None"
                        }
        elif system == "darwin":
            airport_path = "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport"
            output = subprocess.check_output(f"{airport_path} -I", shell=True, text=True)
            ssid = re.search(r"SSID: (.+)", output)
            rssi = re.search(r"agrCtlRSSI: (-?\d+)", output)
            security = re.search(r"security: (.+)", output)
            if ssid and rssi:
                return {
                    "network_name": ssid.group(1).strip(),
                    "signal_strength": dbm_to_percentage(int(rssi.group(1).strip())),
                    "secured": security.group(1).strip() if security else "Unknown"
                }
        return {"error": "Wi-Fi info not available on this platform"}
    except subprocess.CalledProcessError:
        return {"error": "No active Wi-Fi connection or command failed"}

# Serve the index HTML page
@app.get("/", response_class=HTMLResponse)
async def serve_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Speed test endpoint with mock fallback
@app.get("/api/speed")
async def get_speed():
    # Use mock data by default on Render or if configured
    if os.getenv("RUNNING_ON_RENDER", "False").lower() == "true" or os.getenv("MOCK_SPEED_TEST", "False").lower() == "true":
        return {
            "download_mbps": 25.5,
            "upload_mbps": 10.2,
            "ping_ms": 42,
            "isp": "Mock ISP",
            "host": "mock.speedtest.com",
            "server_location": "Virtual City",
            "latency": 35,
            "packet_loss": 0.1
        }

    try:
        # Check internet connectivity
        async with httpx.AsyncClient() as client:
            await client.get("https://www.google.com", timeout=5)
    except httpx.RequestError:
        return {"error": "No internet connection. Please check your network."}, 503

    try:
        st = speedtest.Speedtest()
        st.get_servers()
        best_server = None
        for _ in range(3):
            try:
                best_server = st.get_best_server()
                break
            except speedtest.SpeedtestException as e:
                if "No servers found" in str(e):
                    continue
                raise e
        if not best_server:
            return {"error": "Unable to select a speed test server"}, 500

        download = st.download() / 1_000_000
        upload = st.upload() / 1_000_000
        ping = st.results.ping
        isp = st.config.get("client", {}).get("isp", "Unknown")
        server_host = st.results.server.get("host", "Unknown") if st.results.server else "Unknown"
        server_location = st.results.server.get("location", "Unknown") if st.results.server else "Unknown"
        packet_loss = st.results.packetloss if hasattr(st.results, "packetloss") else None

        return {
            "download_mbps": round(download, 2),
            "upload_mbps": round(upload, 2),
            "ping_ms": round(ping, 2),
            "isp": isp,
            "host": server_host,
            "server_location": server_location,
            "latency": round(ping, 2),
            "packet_loss": packet_loss
        }
    except speedtest.SpeedtestException as e:
        return {"error": f"Speed test failed: {str(e)}"}, 403
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}, 500

# IP geolocation endpoint
@app.get("/api/ip")
async def get_ip():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.ipgeolocation.io/ipgeo?apiKey={IPGEOLOCATION_API_KEY}")
            response.raise_for_status()
            data = response.json()
            return {
                "ip": data.get("ip"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude")
            }
    except httpx.HTTPError as e:
        return {"error": f"IP geolocation failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

# Device information endpoint
@app.get("/api/device")
async def get_device():
    try:
        return {
            "device_name": socket.gethostname(),
            "platform": platform.system(),
            "release": platform.release()
        }
    except Exception as e:
        return {"error": f"Device info retrieval failed: {str(e)}"}

# Network type detection endpoint
@app.get("/api/network")
async def get_network():
    try:
        interfaces = psutil.net_if_addrs()
        for interface, addrs in interfaces.items():
            if "loopback" in interface.lower():
                continue
            for addr in addrs:
                if addr.family == socket.AF_INET and addr.address != "127.0.0.1":
                    return {"network_type": "Wired" if "wi-fi" not in interface.lower() else "Wireless"}
        return {"network_type": "No connection"}
    except Exception as e:
        return {"error": f"Network type detection failed: {str(e)}"}

# Wi-Fi details endpoint
@app.get("/api/wifi")
async def get_wifi():
    return get_wifi_info()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)