import time
import random
from google import genai
from google.genai import types
from config.settings import GEMINI_KEY, MAX_RETRIES, BASE_RETRY_DELAY


client = genai.Client(api_key=GEMINI_KEY)




def retry_request(func, *args, **kwargs):
    max_retries = 5
    delay = 2
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except genai.errors.ServerError as e:
            if "503" in str(e) and attempt < max_retries - 1:
                sleep_time = delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"Server sobrecargado (503). Retrying in {sleep_time:.1f} seconds...")
                time.sleep(sleep_time)
            else:
                raise