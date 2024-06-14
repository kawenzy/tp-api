import { FastifyReply, FastifyRequest } from "fastify";
import { loginInp, regisInp, updInp } from "../../schemas/user.schema";
import prisma from "../../utils/prisma";
import otp from '../../utils/otp';
import { generatePassword, verifyPassword } from "../../utils/crack";


export async function register(req: FastifyRequest<{
    Body: regisInp
}>, rply: FastifyReply): Promise<never>  {
    const { name, email, password, imgurl } = req.body;
    let allowedExtensions: string[] = ["png", "jpg", "gif"]
    let fileExtension: string | undefined = imgurl.split(".").pop();
    let emailN: string | undefined = email.split("@").pop()
    let emailX: string[] = ['gmail.com']
    const chekemail = await prisma.user.findUnique({where: {email: email}})
    if (chekemail) {
        return rply.status(400).send({ message: "Email already exists" });
    }
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return rply.code(400).send("File extension is not allowed.");
    }
    if (!emailN || !emailX.includes(emailN)) {
        return rply.code(400).send("format email failed")
    }
    const otpa: string | undefined = req.cookies.otp
    if(otpa) {
        return rply.code(400).send({"msg": "wait a 5 minutes, and try create account again"})
    }
    const otps: string = otp()
    const data = {
        "token": otps,
        "name": name,
        "email": email,
        "imgurl": imgurl,
        "password": password,
    }
    await prisma.side.create({
        data: data
    })
    const exp: Date = new Date()
    exp.setMinutes(exp.getMinutes() + 5)
    rply.setCookie('otp',otps,{
        path: "/api/v1",
        expires: exp,
        httpOnly: false,
        secure: false,
    })

    return rply.code(202).send({"msg": `lets go verification in: http://127.0.0.1:3000/api/v1/verify/${otps}`})
}


export async function verify(req: FastifyRequest<{
    Params: {token: string}
}>, rply: FastifyReply): Promise<never> {
    const token: string = req.params.token
    const cook: string | undefined = req.cookies.otp
    if(!cook) {
        return rply.code(400).send({"msg": "token expired or not found"})
    }
    if(token != cook) {
        return rply.code(400).send({"msg": "token not match with cookie"})
    }
    const data = await prisma.side.findUnique({where: {token: token}})
    if(!data) {
        return rply.code(400).send({"msg": "token not found"})
    }
    const {hash, salt} = await generatePassword(data.password)
    const user = {
        "name": data.name,
        "email": data.email,
        "password": hash,
        "imgurl": data.imgurl,
        "salt": salt,
    }
    await prisma.side.deleteMany({where: {email: data.email}})
    await prisma.user.create({data: user})
    rply.clearCookie("otp",{path: "/api/v1"})
    return rply.code(202).send({"msg": "verification succes"})
}


export async function loginHandler(req: FastifyRequest<{
    Body: loginInp
}>, rply: FastifyReply): Promise<never> {
    const {email,password} = req.body
    const chek = await prisma.user.findUnique({where: {email: email}})
    const cook: string | undefined = req.cookies.token
    if(cook){
        return rply.code(400).send({"msg": "you already login"})
    }
    if(chek?.token) {
        return rply.code(400).send({"msg": "you already login your account"})
    }
    if (!chek) {
        return rply.code(404).send({"msg": "user not found"})
    }
    const vypass: boolean = await verifyPassword({vp: password, hash: chek.password, salt: chek.salt})
    if (!vypass) {
        return rply.code(400).send({"msg": "password is wrong"})
    }
    const payload = {
        uuid:chek.uuid,
        name: chek.name,
        email: chek.email,
    }
    const token: string = req.jwt.sign(payload)
    await prisma.user.update({where: {email: email},data:{token: token}})
    rply.setCookie("token",token,{
        path: "/api/v1",
        secure: false,
        httpOnly: false,
    })
    return rply.code(200).send({"msg": "login succes"})
}

export async function logoutHandler(req:FastifyRequest, rply: FastifyReply): Promise<never> {
    const userId: string = req.user.uuid
    const cook: string | undefined = req.cookies.token
    if(!cook) {
        return rply.code(400).send({"msg": "you are not login"})
    }
    const find = await prisma.user.findMany({where: {token: cook}})
    if(!find) {
        return rply.code(400).send({"msg": "invalid token"})
    }
    await prisma.user.update({where:{uuid: userId}, data: {token: null}})
    const respon = rply.code(200).send({"msg": "logout succes"})
    respon.clearCookie("token")
    return respon
}

export async function readUser(req: FastifyRequest, rply: FastifyReply): Promise<never> {
    const user = req.user
    const cook: string | undefined = req.cookies.token
    if(!cook) {
        return rply.code(400).send({"msg": "login is required"})
    }
    const find = await prisma.user.findMany({where: {token: cook}})
    if(!find) {
        return rply.code(400).send({"msg": "invalid token"})
    }
    const data = {
        uuid: user.uuid,
        name: user.name,
        email: user.email
    }
    return rply.code(200).send(data)
}

export async function searchUser(req: FastifyRequest<{
    Params: {id: string}
}>, rply: FastifyReply): Promise<never> {
    const id: string = req.params.id
    const cook: string | undefined = req.cookies.token
    if(!cook) {
        return rply.code(400).send({"msg": "you are not login"})
    }
    const find = await prisma.user.findMany({where: {token: cook}})
    if(!find) {
        return rply.code(400).send({"msg": "invalid token"})
    }
    const user = await prisma.user.findUnique({where: {uuid: id}})
    const data  = {
        uuid: user?.uuid,
        name: user?.name,
        email: user?.email,
        imgurl: user?.imgurl
    }
    return rply.code(200).send(data)
}

export async function updateUser(req: FastifyRequest<{
    Body: updInp
}>, rply: FastifyReply): Promise<never>{
    const {name, email, password, imgurl} = req.body
    const cook: string | undefined = req.cookies.token
    const user = req.user
    if(!cook) {
        return rply.code(400).send({"msg": "login is required"})
    }
    const find = await prisma.user.findMany({where: {token: cook}})
    if(!find) {
        return rply.code(400).send({"msg": "invalid token"})
    }
    let allowedExtensions: string[] = ["png", "jpg", "gif"]
    let fileExtension: string | undefined = imgurl?.split(".").pop();
    let data: any
    if(name != null){
        data ={name: name}
    }
    if (email != null) {
        const chekmail = await prisma.user.findUnique({where: {email:email}})
        if(chekmail){
            return rply.code(400).send({"msg": "email already exist"})
        }
        data = {email: email}
    }
    if(imgurl != null) {
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            return rply.code(400).send("File extension is not allowed.");
        }
        data = {imgurl: imgurl}
    }
    if(password != null) {
        const {hash, salt} = await generatePassword(password)
        data = {password: hash, salt: salt}
    }
    await prisma.user.update({where:{uuid: user.uuid},data: data})
    return rply.code(200).send({"msg": "updated succes"})
}


export async function deleteUser(req: FastifyRequest, rply: FastifyReply): Promise<never> {
    const user = req.user
    const cook: string | undefined = req.cookies.token
    if(!cook) {
        return rply.code(400).send({"msg": "login is required"})
    }
    const find = await prisma.user.findMany({where: {token: cook}})
    if(!find) {
        return rply.code(400).send({"msg": "invalid token"})
    }
    await prisma.user.delete({where:{uuid: user.uuid}})
    rply.clearCookie("token",{path: "/api/v1"})
    return rply.code(200).send({"msg": "delete account succes"})
}