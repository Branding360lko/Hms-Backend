const redis = require("redis");

console.log("Initializing Redis client...");

const client = redis.createClient({
  host: "172.27.31.129", // WSL IP
  port: 6379, // Redis default port
});

console.log("Redis client created, attempting connection...");

client.on("connect", () => {
  console.log("Connected to Redis");

  // Test the Redis connection with PING
  client.ping((err, reply) => {
    if (err) {
      console.error("Ping error:", err);
    } else {
      console.log("Ping reply:", reply); // Expected output: 'PONG'
    }
  });
});

client.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

client.on("ready", () => {
  console.log("Redis client is ready");
});

client.on("end", () => {
  console.log("Redis connection closed");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = client;
