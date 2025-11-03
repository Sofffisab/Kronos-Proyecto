from pydantic import BaseModel
from typing import List, Optional


class WebsiteValue(BaseModel):
    name: str
    text: str


class TableRow(BaseModel):
    criterion_or_website: str
    websites: List[WebsiteValue]
    conclusion: Optional[str] = None


class TableData(BaseModel):
    table_data: List[TableRow]