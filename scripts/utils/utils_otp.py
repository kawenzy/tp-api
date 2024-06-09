import random
import math

def totp():
    digits = "0m1sd2w3s415d67c8q9g5p0v3m8b6vd9sj3k7l5f332rfesf4t4y0dgjpwslx6zc8ikg6f3gh8p"
    OTP = ""

    for _ in range(80):
        OTP += digits[math.floor(random.random() * 10)]
    return OTP