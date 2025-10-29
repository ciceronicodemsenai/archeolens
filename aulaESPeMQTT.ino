#include <PubSubClient.h>
#include <WiFi.h>

const char* ssid = "FIESC_IOT_EDU";
const char* password = "8120gv08";
const char* mqttServer = "test.mosquitto.org";
const int mqttPort = 1883;
//const char* mqttUser = "usuario";
//const char* mqttPassword = "senha";
int LED_BUILTIN = 2;
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
    pinMode (LED_BUILTIN, OUTPUT);

    Serial.begin(115200);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print("Connecting to WiFi:");
        Serial.println(ssid);
    }

    Serial.println("Connected to the WiFi network");
    Serial.println("");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    client.setServer(mqttServer, mqttPort);
    client.setCallback(callback);

    while (!client.connected()) {
        Serial.println("Connecting to MQTT…");
        String clientId = "ESP32Client-";
        clientId += String(random(0xffff), HEX);
        // if (client.connect(clientId.c_str(), mqttUser, mqttPassword )) {
        if (client.connect(clientId.c_str())) {
            Serial.println("connected");
        } else {
            Serial.print("failed with state ");
            Serial.print(client.state());
            delay(2000);
        }
    }

    Serial.print("Tentando enviar a mensagem");
    client.publish("senai/cicero01", "Hello from ESP32");
    client.subscribe("senai/cicero01");

}

void callback(char* topic, byte* payload, unsigned int length) {

    Serial.print("Message arrived in topic: ");
    Serial.println(topic);

    Serial.print("Message:");
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }

    if (payload[0] == '0'){
        Serial.println("Desligando luz");
        digitalWrite(LED_BUILTIN, LOW);
    }

    if (payload[0] == '1'){
        Serial.println("Ligando luz");
        digitalWrite(LED_BUILTIN, HIGH);
    }

    Serial.println();
    Serial.println(" — — — — — — — — — — — -");

}

void loop() {
    client.loop();
}
