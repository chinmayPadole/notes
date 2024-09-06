const express = require("express");
const cors = require("cors");
const webpush = require("web-push");

const port = 3000;

webpush.setVapidDetails(
  "mailto:chinmaypadole97@gmail.com",
  "BBhZ-u4r7sUTWbT7Dt5vrWU_dMvw45MrKSWNtQQbSnBLgV-MTfGXU37dadCBeMGWy27qI8j5OFQD-AbdRriF0aM",
  "SJ_IsBF5TQOpVM94eSH1wRD6b6GdMUdQ62otlhTLJcU"
);

const app = express();
app.use(cors());
app.use(express.json());

const subDatabase = [];

app.post("/api/notifications/subscribe", (req, res) => {
  subDatabase.push(req.body);

  console.log(subDatabase);

  res.json({ status: "Success", message: { data: "Subscription saved!" } });
});

app.get("/api/notifications/send", (req, res) => {
  webpush.sendNotification(subDatabase[0], "Hello World");

  res.json({ status: "Success", message: "Message sent to push service" });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
