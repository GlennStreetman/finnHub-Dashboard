import express from "express";
const router = express.Router();

router.get("/api/graphQLRediirect", (req, res) => {
    console.log("Redirect to graphiQL");
    res.status(302).redirect("/graphQL");
});

export default router;
