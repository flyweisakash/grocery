import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./apiRoutes";

function middlewares(app) {
    app.use(bodyParser.json());
    app.use(cors());
    app.use(express.static("public"));
    app.use(cookieParser());

    //API routes endpoints
    apiRoutes(app);
}

module.exports = middlewares;