import json
import os
import pandas as pd
from config.settings import SAVE_DIR




def save_json(obj, name="tablita.json"):
    path = os.path.join(SAVE_DIR, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=4)
    return path


def save_excel(df, name="tablita.xlsx"):
    path = os.path.join(SAVE_DIR, name)
    df.to_excel(path, index=False)
    return path