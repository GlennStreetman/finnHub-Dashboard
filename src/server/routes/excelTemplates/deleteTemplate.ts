import express, { Request } from "express";
import appRootPath from "app-root-path";
import fs from "fs";
import path from "path";

const router = express.Router();

interface session {
    login: boolean;
    uID: number;
}

interface uploadTemplatePost extends Request {
    session: session;
    files: any;
}

interface resObj {
    message: Text;
}

//@ts-ignore
router.get("/deleteTemplate", (req: uploadTemplatePost, res: any, next) => {
    try {
        if (req.session === undefined) throw new Error("Login request not associated with session.");
        if (req.session.login === true) {
            const template = req.query["template"];
            const userDirecotry: string = `${appRootPath}/uploads/${req.session.uID}/`;
            const path: string = `${userDirecotry}${template}`;
            if (fs.existsSync(path)) {
                console.log("path exists:", path);
                fs.unlinkSync(path);
                res.status(200).send({ message: "File deleted" });
            } else {
                res.status(500).send({ message: "could not find file." });
            }
        }
    } catch (error) {
        next(error);
    }
});

export default router;
