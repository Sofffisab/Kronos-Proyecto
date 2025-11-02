import os
from dotenv import load_dotenv


load_dotenv()


PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
SAVE_DIR = os.path.join(DATA_DIR, "tablas_generadas")
RESOURCES_DIR = os.path.join(DATA_DIR, "recursos")
os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(RESOURCES_DIR, exist_ok=True)


GEMINI_KEY = os.getenv("GEMINI_KEY")
CHAT_KEY = os.getenv("CHAT_KEY")


# Opciones de timeouts/retries
MAX_RETRIES = 5
BASE_RETRY_DELAY = 2


# Model names (centralizar por si cambias)
GEMINI_TABLE_MODEL = "gemini-2.5-flash"
GEMINI_IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation"
GPT_MODEL = "gpt-5"