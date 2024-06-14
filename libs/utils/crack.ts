import crypto from "crypto"

export async function generatePassword(password: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64,"sha512").toString("hex")
    return {salt, hash};
}

export async function verifyPassword({vp, hash, salt}:{vp: string, hash: string, salt: string}){
    const verifyHash = crypto.pbkdf2Sync(vp, salt, 1000,64, "sha512").toString('hex')
    return verifyHash === hash
}