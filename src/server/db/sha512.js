import crypto from "crypto";

const sha512 = function (key) {
    let removeCommaKey = key.replace(/'/g, "");
    const hash = process.env.shaHashKey;
    const pwHash = crypto.createHash("sha512").update(`${hash}${removeCommaKey}`).digest("hex");
    return pwHash;
};

export default sha512;
