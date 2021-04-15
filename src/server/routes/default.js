import express from 'express';
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));


const router =  express.Router();

//Recieves widget key as a paramater. Deletes corresponding records. req.query['user']
router.get('/*', (req, res) => {
    console.log("Servering react app")
    // const x = fs.existsSync((path.join(__dirname, '../../../build/index.html')))
    // console.log(path.join(__dirname, '../../../build'), x )
    res.sendFile(path.resolve(path.join(__dirname, '../../../build/index.html')))
})

export default router

