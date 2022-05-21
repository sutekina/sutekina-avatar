import "dotenv/config";

import express, { application } from "express";
import mysql from "mysql2";
import http from "http"
import Logger from "./Logger";

export = class SutekinaAvatar {
    private static application: express.Application;
    private static server: http.Server;
    public static database: mysql.Pool;

    constructor() {
        // This is in case someone creates an instance of SutekinaAvatar when there has already been one, this should never be necessary.
        if(SutekinaAvatar.application && SutekinaAvatar.server) {
            SutekinaAvatar.server.close();
            SutekinaAvatar.server = undefined;
        }

        SutekinaAvatar.application = express();

        // SutekinaAvatar.database = this;

        SutekinaAvatar.application.enable('trust proxy');
        SutekinaAvatar.application.disable('case sensitive routing');
        SutekinaAvatar.application.disable('strict routing');
        SutekinaAvatar.application.disable('x-powered-by');
    }

    public start() {
        if(!SutekinaAvatar.application) throw new Error("No instance of SutekinaAvatar application found.");
        if(SutekinaAvatar.server) throw new Error("Server already running, cannot start.")
        SutekinaAvatar.server = SutekinaAvatar.application.listen(process.env.PORT, () => {
            Logger.info(`${process.env.APP_NAME || "sutekina-avatar"} is running on ${process.env.PORT}`);
        });
    }

    public static getApp(): express.Application {
        if(!this.application) throw new Error("No instance of SutekinaAvatar application found.");
        return this.application;
    }
}