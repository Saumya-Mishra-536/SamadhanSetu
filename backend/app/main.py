from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Samadhan Setu API", description="Citizen-first grievance navigation prototype. It does not submit complaints to government systems.", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

# Prototype persistence: records are cleared when the API process restarts.
GRIEVANCES: dict[str, dict[str, Any]] = {}
CATEGORY_RULES = [
    ("welfare", "Welfare and Government Schemes", ["pension", "scholarship", "ration", "dbt", "benefit", "subsidy", "payment", "not received", "scheme"]),
    ("sanitation", "Public Sanitation and Waste Management", ["garbage", "waste", "rubbish", "drain", "sewage", "toilet", "dumping", "cleaning", "overflow"]),
    ("infrastructure", "Public Infrastructure", ["pothole", "road", "streetlight", "street light", "footpath", "waterlogging", "bridge"]),
    ("utilities", "Water and Electricity", ["water supply", "drinking water", "pipeline", "electricity", "power cut", "transformer", "electric bill", "leakage"]),
    ("healthcare", "Public Healthcare Services", ["hospital", "health centre", "health center", "medicine", "doctor", "clinic", "ambulance"]),
    ("administration", "Public Administration and Citizen Services", ["certificate", "municipal", "office", "application", "official", "document", "birth", "income certificate"]),
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

def classify(description: str) -> dict[str, Any]:
    text = description.lower()
    ranked = []
    for key, label, keywords in CATEGORY_RULES:
        matched = [word for word in keywords if word in text]
        ranked.append((len(matched), key, label, matched))
    ranked.sort(reverse=True)
    count, key, label, matched = ranked[0]
    if count == 0:
        return {"category_id": "needs_review", "category": "Needs clarification", "confidence": "low", "matched_terms": [], "explanation": "No category keywords matched. Please review the category manually."}
    return {"category_id": key, "category": label, "confidence": "high" if count >= 2 else "moderate", "matched_terms": matched, "explanation": "Suggested using transparent keyword matching. This is preliminary and is not an official determination."}

def build_guidance(category_id: str) -> dict[str, list[str]]:
    guidance = {
        "welfare": (["Keep your scheme/application ID and acknowledgement safely.", "Check the latest application or payment status on the relevant official scheme portal.", "Ask the scheme's listed local or district office for the recorded reason for delay or rejection.", "Use the official grievance channel shown on the scheme website if unresolved."], ["Application or beneficiary ID", "Relevant payment/status record", "Date of application or expected payment"]),
        "sanitation": (["Record the exact location and when the issue was first noticed.", "Take a photo only if safe and avoid capturing identifiable people unnecessarily.", "Contact the relevant municipal/local-body complaint channel listed on its official website.", "Save any acknowledgement number and note follow-up dates."], ["Exact address or landmark", "Date and frequency of the issue", "Optional photograph"]),
        "infrastructure": (["Record the exact road, landmark and locality if known.", "Describe the safety or access impact factually.", "Use the relevant municipal, public works or local-body channel verified for your area.", "Keep the complaint acknowledgement for follow-up."], ["Exact location", "Date observed", "Optional photograph"]),
        "utilities": (["Identify the service provider and consumer/account number, if applicable.", "Record outage, supply or billing dates and previous complaint numbers.", "Use the provider's official customer grievance channel.", "Escalate through the provider's published process if unresolved."], ["Consumer/account number (do not publish it)", "Bill or service record", "Previous complaint reference"]),
        "healthcare": (["Describe the facility, service and date without sharing unnecessary medical details.", "For urgent medical needs, seek immediate local medical assistance rather than waiting for a grievance response.", "Use the facility or health department's official grievance mechanism.", "Retain acknowledgement details."], ["Facility name and location", "Date of visit", "Relevant service record with sensitive details redacted"]),
        "administration": (["Record the service requested, application date and acknowledgement number.", "Ask the responsible office for the current status and any missing-document requirement.", "Use the department's official grievance or citizen-service channel.", "Keep copies of submissions and acknowledgements."], ["Application/acknowledgement number", "Application date", "Relevant correspondence"]),
    }
    steps, documents = guidance.get(category_id, (["Add details about the service, location and outcome you are seeking.", "Identify the department only if known; otherwise leave it for manual verification.", "Consult your local administration's official website for the correct grievance channel."], ["Exact location", "Date and description of the issue", "Relevant acknowledgement"]))
    return {"next_steps": steps, "documents": documents}

def make_complaint(item: dict[str, Any]) -> str:
    return (f"Subject: Request for assistance regarding {item['classification']['category'].lower()}\n\n"
        "To the concerned grievance redressal officer,\n\n"
        "I wish to bring to your attention the following public-service issue:\n\n"
        f"Description: {item['description']}\nLocation: {item['location']}\n"
        f"Date recorded: {item['created_at'][:10]}\n\n"
        "I request that the concerned office review the matter, inform me of the action taken or any additional information required, and provide an acknowledgement/reference number.\n\n"
        "I understand that this is a draft for my review. I will verify the recipient and submit it through the appropriate official channel.\n\n"
        f"Regards,\n{item.get('citizen_name') or '[Your name]'}")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "samadhan-setu-api", "version": "0.2.0"}

@app.get("/api/v1/categories")
async def categories():
    return [{"id": key, "name": label} for key, label, _ in CATEGORY_RULES] + [{"id": "needs_review", "name": "Needs clarification"}]

@app.post("/api/v1/grievances", status_code=201)
async def create_grievance(payload: GrievanceCreate):
    classification = classify(payload.description)
    now = datetime.now(timezone.utc).isoformat()
    item: dict[str, Any] = {
        "id": str(uuid.uuid4()), "description": payload.description.strip(),
        "location": payload.location.strip(), "language": payload.language,
        "citizen_name": payload.citizen_name, "contact": payload.contact,
        "consent": payload.consent, "classification": classification,
        "guidance": build_guidance(classification["category_id"]),
        "status": "Draft - not submitted to government", "created_at": now,
        "updated_at": now, "followups": [],
    }
    item["complaint_draft"] = make_complaint(item)
    GRIEVANCES[item["id"]] = item
    return item

@app.get("/api/v1/grievances")
async def list_grievances():
    return sorted(GRIEVANCES.values(), key=lambda x: x["created_at"], reverse=True)

@app.get("/api/v1/grievances/{grievance_id}")
async def get_grievance(grievance_id: str):
    item = GRIEVANCES.get(grievance_id)
    if not item:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return item

@app.patch("/api/v1/grievances/{grievance_id}/complaint")
async def update_complaint(grievance_id: str, payload: ComplaintUpdate):
    item = GRIEVANCES.get(grievance_id)
    if not item:
        raise HTTPException(status_code=404, detail="Grievance not found")
    item["complaint_draft"] = payload.complaint_draft
    item["updated_at"] = datetime.now(timezone.utc).isoformat()
    return {"id": grievance_id, "complaint_draft": item["complaint_draft"], "updated_at": item["updated_at"]}

@app.post("/api/v1/grievances/{grievance_id}/followups", status_code=201)
async def add_followup(grievance_id: str, payload: FollowupCreate):
    item = GRIEVANCES.get(grievance_id)
    if not item:
        raise HTTPException(status_code=404, detail="Grievance not found")
    record = {"id": str(uuid.uuid4()), "note": payload.note, "reference_number": payload.reference_number, "status": payload.status, "created_at": datetime.now(timezone.utc).isoformat(), "source": "citizen_recorded"}
    item["followups"].append(record)
    item["updated_at"] = record["created_at"]
    return record

@app.get("/api/v1/analytics/overview")
async def analytics_overview():
    counts: dict[str, int] = {}
    for item in GRIEVANCES.values():
        label = item["classification"]["category"]
        counts[label] = counts.get(label, 0) + 1
    return {"total_grievances": len(GRIEVANCES), "category_counts": counts, "note": "Prototype analytics from in-memory submissions only; not representative population statistics."}
