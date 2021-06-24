import express from 'express';
import appRootPath from 'app-root-path'
import fs from 'fs';
import { makeTempDir } from './runTemplate.js'

const router = express.Router();

interface session {
    login: boolean,
    uID: number,
}

interface uploadTemplatePost extends Request {
    session: session,
    files: any
}


router.get('/uploadTemplate', (req: uploadTemplatePost, res: any) => {
    if (req.session.login === true) {
        const userDirecotry = `${appRootPath}/uploads/${req.session.uID}/`
        // let directory_name = "example_dir";
        let filenames = fs.readdirSync(userDirecotry);

        const templateList: string[][] = []
        filenames.forEach((file) => {
            if (file.indexOf('.') > 0) {
                console.log("File:", file);
                const newListItem = [file, `${file}`]
                templateList.push(newListItem)
            }
        });
        res.status(200).send({
            data: JSON.stringify(templateList)
        })
    }
})

router.post("/uploadTemplate", async (req: uploadTemplatePost, res: any) => {
    if (req.session.login === true) {
        const userID = req.session.uID

        const uploadsFolder = `${appRootPath}/uploads/`
        const tempFolder = `${appRootPath}/uploads/${userID}/`
        await makeTempDir(uploadsFolder)
        await makeTempDir(tempFolder)

        try {
            if (!req.files) {
                res.status(500).send({
                    status: false,
                    message: 'No file uploaded'
                });
            } else {
                let uploadFile = req.files.file;
                const uploadName = uploadFile.name.replace('xlsx', '.xlsx').replace('xlsm', '.xlsm')
                if (uploadName.includes('.xlsx') || uploadName.includes('.xlsm')) {
                    uploadFile.mv(`./uploads/${userID}/${uploadFile.name.replace('xlsx', '.xlsx').replace('xlsm', '.xlsm')}`);
                }
                res.status(200).send({
                    message: 'File is uploaded',
                });
            }
        } catch (err) {
            console.log(err)
            res.status(500).send({ message: err });
        }
    } else {
        res.status(500).send({ message: 'Not logged in.' });
    }
});

export default router