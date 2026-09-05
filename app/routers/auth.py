"""
Blood Link — Authentication Router
POST /api/auth/register              — generic register
POST /api/auth/signup/donor          — combined donor signup
POST /api/auth/signup/requester      — combined requester signup
POST /api/auth/signup/bloodbank      — combined blood bank signup
POST /api/auth/login                 — login
GET  /api/auth/me                    — current user
PUT  /api/auth/change-password       — change password
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.database import models
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse, UserOut,
    DonorSignupRequest, RequesterSignupRequest, BloodBankSignupRequest,
    PasswordChangeRequest,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ── Helper: check duplicate email/phone ──────────────────────────────────────
def _check_duplicates(db: Session, email: str, phone: str = None):
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )
    if phone:
        if db.query(models.User).filter(models.User.phone == phone).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this phone number already exists",
            )


# ── POST /api/auth/register ─────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account (generic)",
    description=(
        "Creates a new user. The role must be DONOR, HOSPITAL, REQUESTER, or ADMIN. "
        "After registration, use /api/auth/login to obtain a JWT token. "
        "For combined signup (user + profile), use the role-specific signup endpoints."
    ),
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    _check_duplicates(db, payload.email, payload.phone)

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── POST /api/auth/signup/donor ──────────────────────────────────────────────
@router.post(
    "/signup/donor",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Combined donor signup (account + profile)",
    description="Creates user account AND donor profile in one call. Returns JWT token.",
)
def signup_donor(payload: DonorSignupRequest, db: Session = Depends(get_db)):
    _check_duplicates(db, payload.email, payload.phone)

    # Create user
    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=models.UserRole.DONOR,
    )
    db.add(user)
    db.flush()  # get user.id without committing

    # Create donor profile
    donor = models.Donor(
        user_id=user.id,
        name=payload.full_name,
        blood_group=payload.blood_group,
        date_of_birth=payload.date_of_birth,
        age=payload.age,
        gender=payload.gender,
        city=payload.city,
        area=payload.area,
        is_available=payload.is_available,
        last_donation_date=payload.last_donation_date,
        previous_donation=payload.previous_donation,
        consent_share_availability=payload.consent_share_availability,
    )
    db.add(donor)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
    )


# ── POST /api/auth/signup/requester ──────────────────────────────────────────
@router.post(
    "/signup/requester",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Combined requester signup (account + profile)",
    description="Creates user account AND requester profile in one call. Returns JWT token.",
)
def signup_requester(payload: RequesterSignupRequest, db: Session = Depends(get_db)):
    _check_duplicates(db, payload.email, payload.phone)

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=models.UserRole.REQUESTER,
    )
    db.add(user)
    db.flush()

    requester = models.Requester(
        user_id=user.id,
        name=payload.full_name,
        city=payload.city,
        area=payload.area,
        relationship_to_patient=payload.relationship_to_patient,
    )
    db.add(requester)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
    )


# ── POST /api/auth/signup/bloodbank ──────────────────────────────────────────
@router.post(
    "/signup/bloodbank",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Combined blood bank signup (account + profile)",
    description="Creates user account AND blood bank profile in one call. Returns JWT token.",
)
def signup_bloodbank(payload: BloodBankSignupRequest, db: Session = Depends(get_db)):
    _check_duplicates(db, payload.official_email, payload.phone)

    user = models.User(
        full_name=payload.contact_person_name or payload.blood_bank_name,
        email=payload.official_email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=models.UserRole.HOSPITAL,
    )
    db.add(user)
    db.flush()

    hospital = models.Hospital(
        user_id=user.id,
        name=payload.blood_bank_name,
        license_number=payload.license_number,
        blood_bank_type=payload.blood_bank_type,
        address=payload.address,
        city=payload.city,
        pincode=payload.pincode,
        phone=payload.phone,
        contact_person_name=payload.contact_person_name,
        contact_person_designation=payload.contact_person_designation,
        contact_person_phone=payload.contact_person_phone,
        contact_person_email=payload.contact_person_email,
    )
    db.add(hospital)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
    )


# ── POST /api/auth/login ────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT access token",
    description=(
        "Authenticate with email + password. "
        "Use the returned access_token as a Bearer token in the Authorization header."
    ),
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact admin.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
    )


# ── GET /api/auth/me ────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserOut,
    summary="Get the currently authenticated user",
)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ── PUT /api/auth/change-password ────────────────────────────────────────────
@router.put(
    "/change-password",
    summary="Change password for the authenticated user",
)
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
