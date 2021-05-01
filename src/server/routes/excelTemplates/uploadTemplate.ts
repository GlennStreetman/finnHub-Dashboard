import express from 'express';
import appRootPath from 'app-root-path'
import fs from 'fs';

const router = express.Router();

interface session {
    login: boolean,
    uID: number,
}

interface uploadTemplatePost extends Request {
    session: session,
    files: any
}

// interface resObj {
//     message: Text,
// }

router.get('/uploadTemplate', (req: uploadTemplatePost, res: any) => {
    if (req.session.login === true) {
        const userDirecotry = `${appRootPath}/uploads/${req.session.uID}/`
        // let directory_name = "example_dir";
        let filenames = fs.readdirSync(userDirecotry);

        const templateList: string[][] = []
        filenames.forEach((file) => {
            console.log("File:", file);
            const newListItem = [file, `${file}`]
            templateList.push(newListItem)
        });
        res.status(200).send({
            data: JSON.stringify(templateList)
        })
    }
})

router.post("/uploadTemplate", (req: uploadTemplatePost, res: any) => {
    if (req.session.login === true) {
        const subFolder = req.session.uID
        try {
            if (!req.files) {
                res.status(500).send({
                    status: false,
                    message: 'No file uploaded'
                });
            } else {
                console.log('1', req.files)
                let uploadFile = req.files.file;
                console.log('2', uploadFile.name)
                const uploadName = uploadFile.name.replace('xlsx', '.xlsx').replace('xlsm', '.xlsm')
                console.log('3', uploadName)
                if (uploadName.includes('.xlsx') || uploadName.includes('.xlsm')) {
                    uploadFile.mv(`./uploads/${subFolder}/${uploadFile.name.replace('xlsx', '.xlsx').replace('xlsm', '.xlsm')}`);
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