import fs from 'fs';

export const makeTempDir = function (tempPath: string) { //if it doesnt already exist, make temp dir for user.
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true })
    }
}