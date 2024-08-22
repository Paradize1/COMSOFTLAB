
import imaplib
import email as em
from email.header import decode_header
from email.utils import parsedate_to_datetime
from datetime import datetime, timedelta

def decode_mime_words(s):
    """Декодирует MIME-заголовки с поддержкой различных кодировок."""
    return ''.join(
        word.decode(encoding or 'utf-8') if isinstance(word, bytes) else word
        for word, encoding in decode_header(s)
    )

def mailru_fetch(email_address, password):
    all_messages = []

    try:
        # Подключаемся к IMAP серверу Mail.ru
        mail = imaplib.IMAP4_SSL("imap.mail.ru")
        mail.login(email_address, password)
        mail.select("inbox")

        today = datetime.today()
        start_of_month = today.replace(day=1) - timedelta(days=1)  
        start_of_month = start_of_month.replace(day=1)  
        start_of_month_formatted = start_of_month.strftime("%d-%b-%Y")

        status, messages = mail.search(None, f'(SINCE {start_of_month_formatted})')
        message_numbers = messages[0].split()


        if message_numbers:
            for num in message_numbers[:50]:  # Ограничитель
                status, msg_data = mail.fetch(num, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = em.message_from_bytes(response_part[1])
                        subject = decode_mime_words(msg["Subject"] or "Без темы")
                        from_ = decode_mime_words(msg.get("From", "Неизвестный отправитель"))
                        date = parsedate_to_datetime(msg.get("Date"))
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                content_type = part.get_content_type()
                                content_disposition = str(part.get("Content-Disposition"))
                                if "attachment" not in content_disposition:
                                    payload = part.get_payload(decode=True)
                                    if content_type == "text/plain":
                                        body += payload.decode(errors='ignore')
                                    elif content_type == "text/html":
                                        body += payload.decode(errors='ignore')
                        else:
                            content_type = msg.get_content_type()
                            if content_type == "text/plain":
                                body = msg.get_payload(decode=True).decode(errors='ignore')
                            elif content_type == "text/html":
                                body = msg.get_payload(decode=True).decode(errors='ignore')

                        all_messages.append((subject, from_, date, body))

        mail.logout()

    except imaplib.IMAP4.error as e:
        print(f"Ошибка подключения: {e}")

    return all_messages
