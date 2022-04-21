import express from "express";
import middlewares from "./middlewares";

const app = express();
const PORT = process.env.PORT || 8000;

//Middlewares
middlewares(app);

app.listen(PORT, () => {
    console.log(`Server is running on the port ${PORT}`);
});