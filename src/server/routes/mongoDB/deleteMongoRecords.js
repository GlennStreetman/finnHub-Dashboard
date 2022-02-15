import express from "express";
import { getDB } from "../../db/mongoLocal.js";

const router = express.Router();

//Recieves widget key as a paramater. Deletes corresponding records. req.query['user']
router.get("/deleteFinnDashData", async (req, res) => {
    try {
        if (req.session === undefined) throw new Error("Request not associated with session.");
        if (req.session.login === true) {
            console.log("-----running delete!-------", req.query["widgetID"]);
            try {
                const client = getDB();
                const database = client.db("finnDash");
                const dataSet = database.collection("dataSet");
                // const widgetSearch = RegExp(`^${req.query['widgetID']}`, 'i')
                const widgetID = typeof req.query["widgetID"] === "number" ? req.query["widgetID"].toString() : req.query["widgetID"];
                const deleteList = await dataSet.deleteMany({
                    //delete stale records for user
                    userID: req.session.uID,
                    widget: widgetID,
                    // key: {$regex: widgetSearch},
                });
                console.log("deleteList.deletedCount: ", req.session.uID, widgetID, deleteList.deletedCount);
                // console.log("-----delete complete-----")
                res.status(200).json({ message: "Records deleted." });
            } catch (err) {
                console.log(err);
                res.status(500).json({ message: `Problem finding user dataset.` });
            }
        }
    } catch (error) {
        next(error);
    }
});

export default router;
