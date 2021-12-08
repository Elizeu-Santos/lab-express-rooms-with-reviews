require("dotenv").config();


const express = require("express");

const morgan = require("morgan");

const API_VERSION = 1;

const connectToDb = require("./config/db.config");

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const usersRouter = require("./routes/users.routes");
const roomsRouter = require("./routes/rooms.routes");
const reviewRouter = require("./routes/review.routes");

app.use(`/api/${API_VERSION}`, usersRouter);
app.use(`/api/${API_VERSION}`, roomsRouter);
app.use(`/api/${API_VERSION}`, reviewRouter);

connectToDb
  .then(() => {
    app.listen(4000, () => {
      console.log("Servidor subiu com sucesso!");
    });
  })
  .catch((err) => {
    console.log(err);

    process.exit(5);
  });