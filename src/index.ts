import "dotenv/config";
import SutekinaAvatar from "./SutekinaAvatar";

new SutekinaAvatar().start();
const app = SutekinaAvatar.getApp();

import express from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import Handler from "./Handler";
// import etag from "etag";
// import Logger from "./Logger";

app.get("/:id", (req: express.Request, res: express.Response, next) => {
    const _quality: number = parseInt((req.query.quality || "").toString(), 10);
    const quality: number = _quality && _quality < 100 && _quality > 0 ? _quality : 100;
    const _size: number = parseInt((req.query.size || "").toString(), 10);
    const size: number = _size && _size <= 1000 && _size > 0 ? _size : 256;
    const filepath = path.join(process.env.AVATAR_PATH, parseInt(req.params.id, 10).toString());
    const type: string = fs.existsSync(filepath + ".png") ? "png" : (fs.existsSync(filepath + ".jpg") ? "jpg" : undefined);
    if(!type) return next();
    // res.setHeader("ETag", etag(image, {weak:false}));
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=7200");
    res.setHeader("Access-Control-Allow-Origin", "*");
    sharp(fs.readFileSync(`${filepath}.${type}`), { failOnError: false })
        .resize(size, size)
        .jpeg({quality})
        .toBuffer()
        .then(img => {
            res.setHeader("Content-Length", img.length);
            res.end(img);
        })
        .catch(err => next(err));
});

app.use((req, res, next: express.NextFunction) => next({message: "Not found", level:"debug", code:404}));

app.use(new Handler().Error);