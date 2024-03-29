import express from "express";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();

router.get("/*", (req, res) => {
    console.log("Request not resolved. Servering request to react app @ /*");
    res.sendFile(
        path.resolve(path.join(__dirname, "../../../build/index.html"))
    );
});

export default router;
