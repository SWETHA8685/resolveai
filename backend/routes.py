
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import traceback

from ai_engine import analyze_incident
from database import get_db
from models import Incident
from schemas import IncidentCreate, IncidentResponse, StatusUpdate

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


def fallback_analysis(error_log: str, service: str, title: str) -> dict:
    """Rule-based fallback when Gemini AI is unavailable."""

    log = error_log.lower()

    if any(term in log for term in (
        "unauthorized", "forbidden", "sql injection",
        "security breach", "unauthorized access",
    )):
        severity, category = "Critical", "Security"
        cause = (
            "The log contains a possible security or access-control issue. "
            "The exact cause is not confirmed."
        )
        recommendations = [
            "Review authentication and authorization logs.",
            "Check for suspicious access attempts.",
            "Follow your organization's security incident response process.",
        ]

    elif any(term in log for term in (
        "database", "sql", "db_connection", "connection pool",
    )):
        severity, category = "High", "Database"
        cause = (
            "The database may be unavailable or experiencing connection "
            "problems. The exact cause is not confirmed."
        )
        recommendations = [
            "Check whether the database server is running.",
            "Verify database credentials and connection settings without sharing them.",
            "Review connection-pool usage and database server logs.",
        ]

    elif any(term in log for term in (
        "timeout", "connection refused", "unreachable", "network",
    )):
        severity, category = "High", "Network"
        cause = (
            "The service may be experiencing connectivity or timeout problems. "
            "The exact cause is not confirmed."
        )
        recommendations = [
            "Check network connectivity between the affected services.",
            "Verify service availability and connection settings.",
            "Review timeout and retry configuration.",
        ]

    elif any(term in log for term in (
        "memory", "out of memory", "cpu", "crash",
    )):
        severity, category = "High", "Application"
        cause = (
            "The application may be experiencing a resource or runtime failure. "
            "The exact cause is not confirmed."
        )
        recommendations = [
            "Review application and system resource usage.",
            "Inspect application logs and recent deployments.",
            "Check memory and CPU utilization around the incident time.",
        ]

    else:
        severity, category = "Medium", "Other"
        cause = (
            "The supplied log does not provide enough evidence to identify "
            "a likely root cause."
        )
        recommendations = [
            "Review the complete application logs around the incident time.",
            "Check recent configuration and deployment changes.",
            "Collect additional diagnostic information before taking action.",
        ]

    return {
        "title": title,
        "severity": severity,
        "category": category,
        "root_cause": "Preliminary rule-based assessment: " + cause,
        "recommendations": recommendations,
    }


@router.post("/analyze", response_model=IncidentResponse)
def create_and_analyze_incident(
    data: IncidentCreate,
    db: Session = Depends(get_db),
):
    try:
        try:
            # First attempt Gemini AI analysis
            result = analyze_incident(
                error_log=data.error_log,
                service=data.service,
            )

            analysis_source = "Gemini AI"

        except Exception as e:
            # Print the actual Gemini error in the backend terminal
            print("\n========== GEMINI AI ERROR ==========")
            print("Error:", repr(e))
            traceback.print_exc()
            print("=====================================\n")

            # Use fallback if Gemini fails
            result = fallback_analysis(
                error_log=data.error_log,
                service=data.service,
                title=data.title,
            )

            analysis_source = "Rule-based fallback"

        recommendations = result.get("recommendations", [])

        if isinstance(recommendations, list):
            recommendations_text = "\n".join(
                f"- {item}" for item in recommendations
            )
        else:
            recommendations_text = str(recommendations)

        root_cause = str(
            result.get("root_cause") or "Further investigation required."
        )

        root_cause += f"\nAnalysis method: {analysis_source}."

        # Save incident to database
        incident = Incident(
            title=str(result.get("title") or data.title)[:200],
            service=data.service,
            error_log=data.error_log,
            severity=str(result.get("severity") or "Medium"),
            category=str(result.get("category") or "Other"),
            root_cause=root_cause,
            recommendations=recommendations_text,
            status="Open",
        )

        db.add(incident)
        db.commit()
        db.refresh(incident)

        return incident

    except Exception as e:
        db.rollback()

        print("\n========== INCIDENT SAVE ERROR ==========")
        print("Error:", repr(e))
        traceback.print_exc()
        print("=========================================\n")

        raise HTTPException(
            status_code=500,
            detail="Could not save the incident. Please check the backend logs and try again.",
        )


@router.get("/", response_model=list[IncidentResponse])
def get_all_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.id.desc()).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident


@router.patch("/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
):
    allowed_statuses = {"Open", "In Progress", "Resolved"}

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid incident status",
        )

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    incident.status = data.status
    db.commit()
    db.refresh(incident)

    return {
        "message": "Incident status updated",
        "incident_id": incident.id,
        "status": incident.status,
    }


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    db.delete(incident)
    db.commit()

    return {
        "message": "Incident deleted successfully"
    }
