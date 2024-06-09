import smtplib
import google.auth
from google_auth_oauthlib.flow import InstalledAppFlow
from email.message import EmailMessage
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import base64

async def mails(otp: str, email: str):
    # HOST = 'smtp.gmail.com'
    # PORT = 465
    # FROM = "ahmadfakhri0211@gmail.com"
    # TO = email
    # PASSWORD = 'kawenzy02'
    # MSG = f"ini kode {otp} kamu"
    # mail = smtplib.SMTP(host=HOST, port=PORT)
    # mail.ehlo()
    # mail.login(user=FROM,password=PASSWORD,initial_response_ok=True)
    # return await mail.sendmail(from_addr=FROM, to_addrs=TO, msg=MSG)
    SCOPES = [
        "https://www.googleapis.com/auth/gmail.send"
    ]
    flow = InstalledAppFlow.from_client_secrets_file('client.json', SCOPES)
    cred = flow.run_local_server(port=0)
    try:
        serv = build("gmail", "v1", credentials=cred)
        msg = EmailMessage()
        msg.set_content("test")
        msg["To"] = email
        msg["From"] = "webh262@gmail.com"
        msg["Subject"] = f"ini kode otp mu: {otp}"
        ecode_msg = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        crt_msg = {"msg": ecode_msg}
        send = (
            serv.users().messages().send(userId="me", body=crt_msg).execute()
        )
        print(f"{send["id"]}")
    except HttpError as error:
        print(f"{error}")
        send = None
    return send