from openai import OpenAI
from config.settings import CHAT_KEY


clientChat = OpenAI(api_key=CHAT_KEY)