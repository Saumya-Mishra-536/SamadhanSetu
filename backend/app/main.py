from __future__ import annotations

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.getenv("SAMADHAN_DB_PATH", str(APP_DIR / "data" / "samadhan.db")))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Samadhan Setu API",
    description="Citizen-first public grievance navigation. Drafts are not submitted to government systems.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

OFFICIAL_RESOURCES = [
    {
        "id": "bihar-lok-shikayat",
        "name": "Bihar Lok Shikayat",
        "scope": "Bihar state government",
        "description": "Bihar's public grievance redressal portal. The official portal provides grievance registration and status services under the Bihar Right to Public Grievance Redressal framework.",
        "url": "https://lokshikayat.bihar.gov.in/DefaultEn.aspx",
        "phone": "1800 345 6284",
        "categories": ["welfare", "sanitation", "infrastructure", "utilities", "healthcare", "administration"],
        "source_url": "https://lokshikayat.bihar.gov.in/AboutUsEn.aspx",
        "verified_on": "2026-11-14",
    },
    {
        "id": "bihar-sahyog",
        "name": "Bihar Sahyog RTMS",
        "scope": "Bihar state government",
        "description": "Government of Bihar grievance portal describing complaint registration, status checking, reminders and feedback.",
        "url": "https://sahyog.bihar.gov.in/Sahyog/Default.aspx",
        "phone": "1100",
        "categories": ["welfare", "sanitation", "infrastructure", "utilities", "healthcare", "administration"],
        "source_url": "https://sahyog.bihar.gov.in/Sahyog/Default.aspx",
        "verified_on": "2026-11-14",
    },
    {
        "id": "bihar-upyog-civic",
        "name": "Bihar UPYOG Citizen Services",
        "scope": "Bihar urban local bodies",
        "description": "Official citizen-services page with a civic complaint flow for garbage and sanitation, roads and streetlights, water and drainage, and other local issues. Select district and urban local body on the portal.",
        "url": "https://upyog.bihar.gov.in/c/citizen-services",
        "phone": None,
        "categories": ["sanitation", "infrastructure", "utilities"],
        "source_url": "https://upyog.bihar.gov.in/c/citizen-services",
        "verified_on": "2026-11-14",
    },
    {
        "id": "central-cpgrams",
        "name": "CPGRAMS",
        "scope": "Government of India ministries/departments and participating state organisations",
        "description": "Centralised Public Grievance Redress and Monitoring System. The official portal supports grievance lodging, registration-ID tracking and appeal/feedback facilities. Check its exclusions and eligibility before filing.",
        "url": "https://pgportal.gov.in/V7/Home",
        "phone": None,
        "categories": ["welfare", "sanitation", "infrastructure", "utilities", "healthcare", "administration"],
        "source_url": "https://pgportal.gov.in/V7/Home",
        "verified_on": "2026-11-14",
    },
]

CATEGORY_RULES = [
    ("welfare", "Welfare and Government Schemes", ["pension", "scholarship", "ration", "dbt", "benefit", "subsidy", "payment", "not received", "scheme", "पेंशन", "छात्रवृत्ति", "राशन", "योजना", "किस्त", "भत्ता"]),
    ("sanitation", "Public Sanitation and Waste Management", ["garbage", "waste", "rubbish", "drain", "sewage", "toilet", "dumping", "cleaning", "overflow", "कचरा", "नाली", "सफाई", "गंदगी", "कूड़ा"]),
    ("infrastructure", "Public Infrastructure", ["pothole", "road", "streetlight", "street light", "footpath", "waterlogging", "bridge", "सड़क", "गड्ढा", "स्ट्रीटलाइट", "फुटपाथ"]),
    ("utilities", "Water and Electricity", ["water supply", "drinking water", "pipeline", "electricity", "power cut", "transformer", "electric bill", "leakage", "पानी", "बिजली", "पाइपलाइन", "बिजली कटौती"]),
    ("healthcare", "Public Healthcare Services", ["hospital", "health centre", "health center", "medicine", "doctor", "clinic", "ambulance", "अस्पताल", "दवा", "डॉक्टर", "स्वास्थ्य केंद्र"]),
    ("administration", "Public Administration and Citizen Services", ["certificate", "municipal", "office", "application", "official", "document", "birth", "income certificate", "प्रमाण पत्र", "आवेदन", "कार्यालय", "जन्म प्रमाण"]),
]

class GrievanceCreate(BaseModel):
    description: str = Field(min_length=10, max_length=5000)
    location: str = Field(min_length=2, max_length=300)
    language: str = Field(default="English", max_length=40)
    citizen_name: str | None = Field(default=None, max_length=120)
    contact: str | None = Field(default=None, max_length=120)
    consent: bool = False

class ComplaintUpdate(BaseModel):
    complaint_draft: str = Field(min_length=20, max_length=8000)

class FollowupCreate(BaseModel):
    note: str = Field(min_length=3, max_length=2000)
    reference_number: str | None = Field(default=None, max_length=120)
    status: str = Field(default="Follow-up noted", max_length=80)

class ClassificationUpdate(BaseModel):
    category_id: str = Field(min_length=2, max_length=40)

def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, timeout=15)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection

def init_store() -> None:
    with connect() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS grievances (
                id TEXT PRIMARY KEY,
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                language TEXT NOT NULL,
                citizen_name TEXT,
                contact TEXT,
                consent INTEGER NOT NULL DEFAULT 0,
                classification TEXT NOT NULL,
                guidance TEXT NOT NULL,
                complaint_draft TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS followups (
                id TEXT PRIMARY KEY,
                grievance_id TEXT NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
                note TEXT NOT NULL,
                reference_number TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        db.execute("CREATE INDEX IF NOT EXISTS idx_grievances_created ON grievances(created_at DESC)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_followups_grievance ON followups(grievance_id, created_at)")

def classify(description: str) -> dict[str, Any]:
    text = description.casefold()
    ranked = []
    for key, label, keywords in CATEGORY_RULES:
        matched = [word for word in keywords if word.casefold() in text]
        ranked.append((len(matched), key, label, matched))
    ranked.sort(key=lambda item: item[0], reverse=True)
    count, key, label, matched = ranked[0]
    if count == 0:
        return {"category_id": "needs_review", "category": "Needs clarification", "confidence": "low", "matched_terms": [], "explanation": "No category terms matched. Please choose the closest category or add more detail."}
    return {"category_id": key, "category": label, "confidence": "high" if count >= 2 else "moderate", "matched_terms": matched, "explanation": "Preliminary suggestion from transparent keyword matching. It is not an official determination."}

def build_guidance(category_id: str) -> dict[str, list[str]]:
    guidance = {
        "welfare": (["Keep your scheme/application ID and acknowledgement safely.", "Check the latest application or payment status on the official scheme portal.", "Ask the scheme's listed local or district office for the recorded reason for delay or rejection.", "Use the grievance channel published on the scheme's official website if unresolved."], ["Application or beneficiary ID (keep private)", "Relevant payment/status record", "Date of application or expected payment"]),
        "sanitation": (["Record the exact location and when the issue was first noticed.", "Take a photograph only if safe; avoid capturing identifiable people unnecessarily.", "Find the relevant municipal/local-body complaint channel on its official website.", "Save any acknowledgement number and note follow-up dates."], ["Exact address or landmark", "Date and frequency of the issue", "Optional photograph"]),
        "infrastructure": (["Record the exact road, landmark and locality if known.", "Describe the safety or access impact factually.", "Check the official local-body or public-works website for the responsible channel.", "Keep the complaint acknowledgement for follow-up."], ["Exact location", "Date observed", "Optional photograph"]),
        "utilities": (["Identify the service provider and consumer/account number, if applicable.", "Record outage, supply or billing dates and previous complaint numbers.", "Use the provider's official customer grievance channel.", "Follow the provider's published escalation process if unresolved."], ["Consumer/account number (do not publish it)", "Bill or service record", "Previous complaint reference"]),
        "healthcare": (["Describe the facility, service and date without sharing unnecessary medical details.", "For urgent medical needs, seek immediate local medical assistance rather than waiting for a grievance response.", "Check the facility or health department's official grievance mechanism.", "Retain acknowledgement details."], ["Facility name and location", "Date of visit", "Relevant service record with sensitive details redacted"]),
        "administration": (["Record the service requested, application date and acknowledgement number.", "Ask the responsible office for the current status and any missing-document requirement.", "Check the department's official grievance or citizen-service channel.", "Keep copies of submissions and acknowledgements."], ["Application/acknowledgement number", "Application date", "Relevant correspondence"]),
    }
    steps, documents = guidance.get(category_id, (["Add details about the service, location and outcome you are seeking.", "Choose a category you believe is closest to the issue.", "Verify the responsible office and official complaint channel for your jurisdiction."], ["Exact location", "Date and description of the issue", "Relevant acknowledgement"]))
    return {"next_steps": steps, "documents": documents}

def make_complaint(item: dict[str, Any]) -> str:
    return (
        f"Subject: Request for assistance regarding {item['classification']['category'].lower()}\n\n"
        "To the concerned grievance redressal officer,\n\n"
        "I wish to bring the following public-service issue to your attention:\n\n"
        f"Description: {item['description']}\nLocation: {item['location']}\n"
        f"Date recorded: {item['created_at'][:10]}\n\n"
        "I request that the concerned office review the matter, inform me of the action taken or any additional information required, and provide an acknowledgement/reference number.\n\n"
        "I understand this is a draft for my review. I will verify the recipient and submit it through the appropriate official channel.\n\n"
        f"Regards,\n{item.get('citizen_name') or '[Your name]'}"
    )

def row_to_item(row: sqlite3.Row) -> dict[str, Any]:
    item = dict(row)
    item["consent"] = bool(item["consent"])
    item["classification"] = json.loads(item.pop("classification"))
    item["guidance"] = json.loads(item.pop("guidance"))
    with connect() as db:
        followups = db.execute("SELECT * FROM followups WHERE grievance_id = ? ORDER BY created_at", (item["id"],)).fetchall()
    item["followups"] = [{**dict(f), "source": "citizen_recorded"} for f in followups]
    return item

@app.on_event("startup")
def startup() -> None:
    init_store()

@app.get("/health")
async def health():
    init_store()
    with connect() as db:
        db.execute("SELECT 1")
    return {"status": "ok", "service": "samadhan-setu-api", "version": "1.0.0", "storage": "sqlite"}

@app.get("/api/v1/resources")
async def resources():
    return OFFICIAL_RESOURCES

@app.get("/api/v1/categories")
async def categories():
    return [{"id": key, "name": label} for key, label, _ in CATEGORY_RULES] + [{"id": "needs_review", "name": "Needs clarification"}]

@app.post("/api/v1/grievances", status_code=201)
async def create_grievance(payload: GrievanceCreate):
    init_store()
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Please acknowledge the prototype data-storage notice before saving this grievance.")
    classification = classify(payload.description)
    now = datetime.now(timezone.utc).isoformat()
    item: dict[str, Any] = {
        "id": str(uuid.uuid4()), "description": payload.description.strip(),
        "location": payload.location.strip(), "language": payload.language,
        "citizen_name": payload.citizen_name, "contact": payload.contact,
        "consent": payload.consent, "classification": classification,
        "guidance": build_guidance(classification["category_id"]),
        "status": "Draft - not submitted to government", "created_at": now, "updated_at": now,
        "followups": [],
    }
    item["complaint_draft"] = make_complaint(item)
    with connect() as db:
        db.execute(
            """INSERT INTO grievances
            (id, description, location, language, citizen_name, contact, consent, classification, guidance, complaint_draft, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (item["id"], item["description"], item["location"], item["language"], item["citizen_name"], item["contact"], int(item["consent"]), json.dumps(classification, ensure_ascii=False), json.dumps(item["guidance"], ensure_ascii=False), item["complaint_draft"], item["status"], now, now),
        )
    return item

@app.get("/api/v1/grievances")
async def list_grievances():
    init_store()
    with connect() as db:
        rows = db.execute("SELECT * FROM grievances ORDER BY created_at DESC").fetchall()
    return [row_to_item(row) for row in rows]

@app.get("/api/v1/grievances/{grievance_id}")
async def get_grievance(grievance_id: str):
    init_store()
    with connect() as db:
        row = db.execute("SELECT * FROM grievances WHERE id = ?", (grievance_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return row_to_item(row)

@app.patch("/api/v1/grievances/{grievance_id}/complaint")
async def update_complaint(grievance_id: str, payload: ComplaintUpdate):
    init_store()
    now = datetime.now(timezone.utc).isoformat()
    with connect() as db:
        cursor = db.execute("UPDATE grievances SET complaint_draft = ?, updated_at = ? WHERE id = ?", (payload.complaint_draft, now, grievance_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Grievance not found")
    return {"id": grievance_id, "complaint_draft": payload.complaint_draft, "updated_at": now}

@app.patch("/api/v1/grievances/{grievance_id}/classification")
async def update_classification(grievance_id: str, payload: ClassificationUpdate):
    init_store()
    valid = {key: label for key, label, _ in CATEGORY_RULES}
    valid["needs_review"] = "Needs clarification"
    if payload.category_id not in valid:
        raise HTTPException(status_code=422, detail="Unknown category")
    classification = {"category_id": payload.category_id, "category": valid[payload.category_id], "confidence": "citizen-selected", "matched_terms": [], "explanation": "Category selected or corrected by the citizen."}
    guidance = build_guidance(payload.category_id)
    now = datetime.now(timezone.utc).isoformat()
    with connect() as db:
        row = db.execute("SELECT * FROM grievances WHERE id = ?", (grievance_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Grievance not found")
        item = dict(row)
        item["classification"] = classification
        item["created_at"] = item["created_at"]
        item["citizen_name"] = item["citizen_name"]
        draft = make_complaint(item)
        db.execute("UPDATE grievances SET classification = ?, guidance = ?, complaint_draft = ?, updated_at = ? WHERE id = ?", (json.dumps(classification, ensure_ascii=False), json.dumps(guidance, ensure_ascii=False), draft, now, grievance_id))
    return {"id": grievance_id, "classification": classification, "guidance": guidance, "complaint_draft": draft}

@app.post("/api/v1/grievances/{grievance_id}/followups", status_code=201)
async def add_followup(grievance_id: str, payload: FollowupCreate):
    init_store()
    record = {"id": str(uuid.uuid4()), "note": payload.note, "reference_number": payload.reference_number, "status": payload.status, "created_at": datetime.now(timezone.utc).isoformat(), "source": "citizen_recorded"}
    with connect() as db:
        exists = db.execute("SELECT 1 FROM grievances WHERE id = ?", (grievance_id,)).fetchone()
        if exists is None:
            raise HTTPException(status_code=404, detail="Grievance not found")
        db.execute("INSERT INTO followups (id, grievance_id, note, reference_number, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", (record["id"], grievance_id, record["note"], record["reference_number"], record["status"], record["created_at"]))
        db.execute("UPDATE grievances SET updated_at = ? WHERE id = ?", (record["created_at"], grievance_id))
    return record

@app.delete("/api/v1/grievances/{grievance_id}", status_code=204)
async def delete_grievance(grievance_id: str):
    init_store()
    with connect() as db:
        cursor = db.execute("DELETE FROM grievances WHERE id = ?", (grievance_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Grievance not found")
    return None

@app.get("/api/v1/analytics/overview")
async def analytics_overview():
    init_store()
    with connect() as db:
        rows = db.execute("SELECT classification FROM grievances").fetchall()
    counts: dict[str, int] = {}
    for row in rows:
        label = json.loads(row["classification"])["category"]
        counts[label] = counts.get(label, 0) + 1
    return {"total_grievances": len(rows), "category_counts": counts, "note": "Counts are from this application's local database only; they are not representative population statistics."}

def reset_store() -> None:
    """Test helper: clear records while retaining the schema."""
    init_store()
    with connect() as db:
        db.execute("DELETE FROM followups")
        db.execute("DELETE FROM grievances")
