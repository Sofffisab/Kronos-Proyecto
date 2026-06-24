# pip install -r lib.txt --no-warn-script-location
import os
import re
import json
from google import genai
from google.genai import types
from PIL import Image, ImageEnhance
from io import BytesIO
from pydantic import BaseModel
from typing import List
import base64
import pandas as pd
from tabulate import tabulate
import json
import time
import random
from openai import OpenAI
from dotenv import load_dotenv, dotenv_values
import psycopg2
import sys


load_dotenv()


client = OpenAI(api_key=os.getenv("CHAT_KEY"))

import openai
from openai import OpenAI

try:
    result = client.images.generate(
        model="gpt-image-1",
        prompt="A simple red square on a white background",
        size="1024x1024"
    )

    print("SUCCESS")
    print(result)

except Exception as e:
    print(type(e))
    print(e)
