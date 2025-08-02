# 🌐 Network Dashboard

**Network Dashboard** is my final project for Harvard’s [CS50x](https://cs50.harvard.edu/x/). It’s a simple, cosmic-themed web tool that displays your internet speed, IP address, device info, network type, and Wi-Fi details — all in one place.

---

## 🚀 Features

- Run real-time internet speed tests (download, upload, ping)
- Display your public IP address and approximate location
- Show your device's OS and platform info
- Detect whether you're on Wi-Fi or Ethernet
- Pull Wi-Fi name, signal strength, and encryption type
- Summarize your overall network health

---

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **APIs & Libraries**: Speedtest, IPGeolocation, Leaflet.js

---

## 💻 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/Arba2021/network-dashboard
cd network-dashboard

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app:app --reload
