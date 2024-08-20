# shehovtsovandrew@yandex.ru
# xtmqttcubsxjidxk

import imaplib
import email as em
from email.header import decode_header
from email.utils import parsedate_to_datetime
from datetime import datetime, timedelta
from bs4 import BeautifulSoup

def decode_mime_words(s):
    """Декодирует MIME-заголовки с поддержкой различных кодировок."""
    return ''.join(
        word.decode(encoding or 'utf-8') if isinstance(word, bytes) else word
        for word, encoding in decode_header(s)
    )

def clean_html(html):
    """Очищает HTML и возвращает текст."""
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text()



def yandex_fetch(email_address, password):
    all_messages = []

    try:
        # Подключаемся к IMAP серверу Yandex
        mail = imaplib.IMAP4_SSL("imap.yandex.ru")
        mail.login(email_address, password)
        mail.select("inbox")

        today = datetime.today()
        last_week = today - timedelta(days=7)
        last_week_formatted = last_week.strftime("%d-%b-%Y")

        status, messages = mail.search(None, f'(SINCE {last_week_formatted})')
        message_numbers = messages[0].split()

        if message_numbers:
            for num in message_numbers[:10]:  # Ограничиваем до 5 сообщений
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
                                        body += payload.decode()
                                    elif content_type == "text/html":
                                        body += clean_html(payload.decode())
                        else:
                            content_type = msg.get_content_type()
                            if content_type == "text/plain":
                                body = msg.get_payload(decode=True).decode()
                            elif content_type == "text/html":
                                body = clean_html(msg.get_payload(decode=True).decode())

                        all_messages.append((subject, from_, date, body.strip()[:1000]))

        mail.logout()

    except imaplib.IMAP4.error as e:
        print(f"Ошибка подключения: {e}")

    return all_messages