import "dotenv/config";

import express from "express";
import Logger from "./Logger";
import SutekinaError from "./SutekinaError";
import path from "path";
import fs from "fs";
import sharp from "sharp";

export = class Handler {
    Error = (data: ErrorData, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if(data.code === 404) {
            const _quality: number = parseInt((req.query.quality || "").toString(), 10);
            const quality: number = _quality && _quality < 100 && _quality > 0 ? _quality : 100;
            const _size: number = parseInt((req.query.size || "").toString(), 10);
            const size: number = _size && _size <= 1000 && _size > 0 ? _size : 256;
            const filepath = path.join(process.env.AVATAR_PATH, "default");
            const type: string = fs.existsSync(filepath + ".png") ? "png" : "jpg";

        Logger.info([size, quality, type])
            res.setHeader("Content-Type", "image/jpeg");
            res.setHeader("Cache-Control", "public, max-age=7200");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return sharp(fs.readFileSync(`${filepath}.${type}`), { failOnError: false })
                .resize(size, size)
                .jpeg({quality})
                .toBuffer()
                .then(img => {
                    res.setHeader("Content-Length", img.length);
                    res.end(img);
                })
                .catch(err => next(err));
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