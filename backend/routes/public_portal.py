from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from backend.database import get_db
from backend.services.public_service import PublicPortalService
from backend.schemas.public_portal import (
    AreaSectorInfo,
    PublicAreaTelemetryResponse,
    PublicSubscribeRequest,
    PublicVerifyOtpRequest,
    PublicSubscriptionResponse,
)

router = APIRouter(prefix="/api/public", tags=["Public Portal"])

@router.get("/areas", summary="Get all publicly monitored areas & sectors")
def get_public_areas(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    return PublicPortalService.get_available_sectors(db)

@router.get("/area-data", response_model=PublicAreaTelemetryResponse, summary="Get live environmental data for an area")
def get_area_telemetry(
    area: str = Query(default="ENV-001", description="Sector ID, Node ID, or Area Name"),
    db: Session = Depends(get_db)
):
    return PublicPortalService.get_sector_telemetry(db, area)

@router.post("/subscribe", response_model=PublicSubscriptionResponse, summary="Register mobile number for public emergency SMS alerts")
def register_sms_alert(
    payload: PublicSubscribeRequest,
    db: Session = Depends(get_db)
):
    try:
        return PublicPortalService.register_subscription(
            db=db,
            phone_number=payload.phone_number,
            citizen_name=payload.citizen_name,
            area_sector=payload.area_sector,
            preferred_alert_types=payload.preferred_alert_types or "ALL"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp", summary="Verify OTP for alert subscription")
def verify_otp(
    payload: PublicVerifyOtpRequest,
    db: Session = Depends(get_db)
):
    try:
        return PublicPortalService.verify_otp(
            db=db,
            phone_number=payload.phone_number,
            otp=payload.otp
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subscriptions", summary="Query SMS alert subscription by phone")
def get_subscription(
    phone: str = Query(..., description="Mobile number to check"),
    db: Session = Depends(get_db)
):
    sub = PublicPortalService.get_subscription_status(db, phone)
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found.")
    return sub

@router.post("/unsubscribe", summary="Deactivate emergency SMS alert subscription")
def unsubscribe(
    phone_number: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    try:
        return PublicPortalService.unsubscribe(db, phone_number)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
