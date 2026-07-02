import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Servers:", dns.getServers());

dns.resolveSrv("_mongodb._tcp.csfaq.wspmgcv.mongodb.net", (err, records) => {
  console.log(err);
  console.log(records);
});