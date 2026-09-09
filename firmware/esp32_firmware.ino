/*
  AI Environmental Monitoring Network (SIH26178) - ESP32 Firmware
  Connects physical sensors to the FastAPI Backend & React Dashboard.

  Sensors:
  - DHT11 (Temperature & Humidity) -> Pin 4
  - Soil Moisture Sensor -> Pin 34
  - Rain Sensor -> Pin 35
  - Flame Sensor -> Pin 14
  - Buzzer -> Pin 27
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ================= USER CONFIGURATION =================
const char* WIFI_SSID     = "YOUR_WIFI_NAME";        // Replace with your Wi-Fi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // Replace with your Wi-Fi Password

// Backend Server IP & Port (Use your computer's local IP on the same Wi-Fi, e.g. 192.168.1.5)
const char* BACKEND_URL   = "http://192.168.1.100:8000/api/sensor-data";

// Unique Node Identifier
const char* NODE_ID       = "ENV-001";

// Node GPS Base Coordinates (Stored per node)
const float NODE_LATITUDE  = 25.2138;
const float NODE_LONGITUDE = 75.8648;

// Telemetry interval (ms)
const unsigned long SEND_INTERVAL = 5000; 
// =======================================================

// -------- PIN DEFINITIONS --------
#define DHT_PIN 4
#define DHT_TYPE DHT11

#define SOIL_PIN 34
#define RAIN_PIN 35
#define FLAME_PIN 14
#define BUZZER_PIN 27

DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastSendTime = 0;

void connectToWiFi() {
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Connection Failed! Will retry in background.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n================================================");
  Serial.println("  AI Environmental Monitoring Network (SIH26178)");
  Serial.println("  ESP32 Real-Time Sensor Node Firmware");
  Serial.println("================================================");

  dht.begin();

  pinMode(FLAME_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  connectToWiFi();
}

void sendTelemetryToBackend(float temp, float hum, int rain, int soil, int flame) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Wi-Fi not connected. Attempting reconnect...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  // Invert/map rain: sensor usually gives 4095 (dry) to 0 (submerged in water)
  // We map analog 0-4095 to rain intensity value 0 - 1000
  float rainValueMapped = (float)map(constrain(4095 - rain, 0, 4095), 0, 4095, 0, 1000);

  // Derive an air quality / combustion smoke proxy from flame & soil metrics
  float aqiProxy = (flame == LOW) ? 420.0 : map(soil, 0, 4095, 50, 200);

  // Build the JSON payload matching the backend API contract
  String payload = "{";
  payload += "\"node_id\":\"" + String(NODE_ID) + "\",";
  payload += "\"temperature\":" + String(temp, 1) + ",";
  payload += "\"humidity\":" + String(hum, 1) + ",";
  payload += "\"pressure\":1013.25,";
  payload += "\"rain_value\":" + String(rainValueMapped, 1) + ",";
  payload += "\"air_quality\":" + String(aqiProxy, 1) + ",";
  payload += "\"latitude\":" + String(NODE_LATITUDE, 6) + ",";
  payload += "\"longitude\":" + String(NODE_LONGITUDE, 6) + ",";
  payload += "\"battery_percentage\":98.0";
  payload += "}";

  Serial.println("[HTTP] Sending Telemetry JSON -> " + payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP] Status: %d | Response: %s\n", httpResponseCode, response.c_str());
  } else {
    Serial.printf("[HTTP] POST Failed! Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

void loop() {
  // -------- 1. READ SENSORS --------
  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();
  int soilValue     = analogRead(SOIL_PIN);
  int rainValue     = analogRead(RAIN_PIN);
  int flameValue    = digitalRead(FLAME_PIN);

  // Check DHT validity (fallback to reasonable baseline if error)
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("⚠️ DHT11 Read Error! Check wiring.");
    temperature = 28.5;
    humidity = 55.0;
  }

  // -------- 2. LOCAL ALARM & BUZZER LOGIC --------
  bool alarm = false;

  // Flame detected (Active LOW on most IR flame sensors)
  if (flameValue == LOW) {
    alarm = true;
    Serial.println("🔥 FLAME DETECTED!");
  }

  // Soil very dry (Adjust threshold to calibrate)
  if (soilValue > 3000) {
    alarm = true;
  }

  // Heavy rain detected (Analog drops when wet)
  if (rainValue < 1500) {
    alarm = true;
  }

  // Extreme high temperature
  if (temperature > 45.0) {
    alarm = true;
  }

  // Control Buzzer
  if (alarm) {
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("🚨 ALERT! LOCAL BUZZER ON");
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // -------- 3. TRANSMIT TELEMETRY TO FASTAPI DASHBOARD --------
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    sendTelemetryToBackend(temperature, humidity, rainValue, soilValue, flameValue);
  }

  delay(1000);
}
