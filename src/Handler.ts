import "dotenv/config";

import express from "express";
import Logger from "./Logger";
import SutekinaError from "./SutekinaError";
import path from "path";

export = class Handler {
    Error = (data: ErrorData, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if(data.code === 404) {
            res.setHeader("Cache-Control", "public, max-age=7200");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.sendFile(path.join(process.env.AVATAR_PATH, "default.png"));
        }
        const error = new SutekinaError(data.message, data.level, data.code || 500);
        objectLookup(error.level, Logger)(error.message, error);
        if(error.stack) delete error.stack;
        res.status(error.code).json(JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))));
    }
}

type ErrorData = {
    message: string,
    level: string,
    code?: number,
    stack?: string
};

function objectLookup(name: string, obj: any) {
    if (isObjKey(name, obj)) {
        return obj[name];
    }
    return undefined
}

function isObjKey<T>(key: any, obj: T): key is keyof T {
    return key in obj;
}