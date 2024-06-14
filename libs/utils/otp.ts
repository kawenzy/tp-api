
const otp = (length = 80) => {
    let otps = ""
    const symbol = "0m1sd2w3s415d67c8q9g5p0v3m8b6vd9sj3k7l5f332rfesf4t4y0dgjpwslx6zc8ikg6f3gh8p"
    for(let i = 0; i < length; i++){
        otps += symbol[Math.floor(Math.random() * symbol.length)]
    }
    return otps
}

export default otp