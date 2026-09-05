"""
Blood Link — Database Seed Script
======================================
Creates realistic DEMO DATA for development and Swagger testing.

ALL data is clearly fictional and for demonstration purposes only.

Usage:
    python seed.py

Requirements:
    - .env file configured with a valid DATABASE_URL
    - Database tables must already exist (run the app once or call init_db())
"""

import sys
import os
from datetime import datetime, timezone, timedelta

# Make sure we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal, init_db
from app.database.models import (
    User, Donor, Hospital, BloodInventory, BloodRequest, UserRole,
    BloodGroup, UrgencyLevel, RequestStatus,
)
from app.core.security import hash_password

def seed():
    print("🌱 Blood Link — Seeding database with demo data...")
    init_db()
    db = SessionLocal()

    try:
        # ── 1. Admin user ─────────────────────────────────────────────────────
        if not db.query(User).filter(User.email == "admin@bloodbridge.demo").first():
            admin = User(
                email="admin@bloodbridge.demo",
                phone="+910000000000",
                hashed_password=hash_password("Admin@1234"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.flush()
            print(f"  ✅ Admin user created  (email: admin@bloodbridge.demo  password: Admin@1234)")
        else:
            print("  ℹ️  Admin user already exists")

        # ── 2. Hospital user + profile ────────────────────────────────────────
        hosp_user = db.query(User).filter(User.email == "apollo@bloodbridge.demo").first()
        if not hosp_user:
            hosp_user = User(
                email="apollo@bloodbridge.demo",
                phone="+911111111111",
                hashed_password=hash_password("Hospital@1234"),
                role=UserRole.HOSPITAL,
                is_active=True,
                is_verified=True,
            )
            db.add(hosp_user)
            db.flush()

            hospital = Hospital(
                user_id=hosp_user.id,
                name="Apollo Demo Hospital",
                license_number="DEMO-HOSP-001",
                is_verified=True,
                latitude=26.2183,
                longitude=78.1828,
                address="Demo Road, Civil Lines",
                city="Gwalior",
                phone="+917512000001",
            )
            db.add(hospital)
            db.flush()

            # Inventory for the demo hospital
            inventory_data = [
                (BloodGroup.A_POS,  12),
                (BloodGroup.A_NEG,   3),
                (BloodGroup.B_POS,  15),
                (BloodGroup.B_NEG,   2),
                (BloodGroup.AB_POS,  8),
                (BloodGroup.AB_NEG,  1),
                (BloodGroup.O_POS,  20),
                (BloodGroup.O_NEG,   4),
            ]
            for bg, units in inventory_data:
                db.add(BloodInventory(
                    hospital_id=hospital.id,
                    blood_group=bg,
                    units_available=units,
                ))
            print(f"  ✅ Hospital created     (email: apollo@bloodbridge.demo  password: Hospital@1234)")
        else:
            print("  ℹ️  Hospital user already exists")
            hospital = db.query(Hospital).filter(Hospital.user_id == hosp_user.id).first()

        # ── 3. Demo donors ────────────────────────────────────────────────────
        donors_data = [
            # (email, password, name, blood_group, age, lat, lon, city, available, verified, last_donation_days_ago, total_donations)
            ("rahul@bloodbridge.demo",   "Donor@1234", "Rahul Sharma",   BloodGroup.O_NEG,  28, 26.2155, 78.1802, "Gwalior",  True,  True,  120, 5),
            ("priya@bloodbridge.demo",   "Donor@1234", "Priya Patel",    BloodGroup.O_POS,  25, 26.2200, 78.1850, "Gwalior",  True,  True,  95,  3),
            ("amit@bloodbridge.demo",    "Donor@1234", "Amit Verma",     BloodGroup.A_POS,  32, 26.2300, 78.1900, "Gwalior",  True,  True,  200, 8),
            ("kavya@bloodbridge.demo",   "Donor@1234", "Kavya Nair",     BloodGroup.B_POS,  29, 26.2100, 78.1750, "Gwalior",  True,  False, 150, 2),
            ("sanjay@bloodbridge.demo",  "Donor@1234", "Sanjay Gupta",   BloodGroup.AB_NEG, 35, 26.2050, 78.1700, "Gwalior",  False, True,  30,  1),
            ("meena@bloodbridge.demo",   "Donor@1234", "Meena Dubey",    BloodGroup.O_NEG,  27, 26.2400, 78.2000, "Gwalior",  True,  True,  400, 10),
            ("vikram@bloodbridge.demo",  "Donor@1234", "Vikram Singh",   BloodGroup.A_NEG,  31, 26.2500, 78.2100, "Gwalior",  True,  True,  180, 6),
            ("anjali@bloodbridge.demo",  "Donor@1234", "Anjali Rao",     BloodGroup.B_NEG,  24, 26.1900, 78.1600, "Gwalior",  True,  True,  None, 0),
            ("rohan@bloodbridge.demo",   "Donor@1234", "Rohan Mishra",   BloodGroup.AB_POS, 33, 26.2600, 78.2200, "Gwalior",  True,  True,  365, 7),
            ("deepa@bloodbridge.demo",   "Donor@1234", "Deepa Joshi",    BloodGroup.O_POS,  26, 26.2700, 78.2300, "Gwalior",  True,  False, 60,  4),
        ]

        created_donors = []
        for (email, pwd, name, bg, age, lat, lon, city, avail, verified, last_days, total_don) in donors_data:
            if db.query(User).filter(User.email == email).first():
                print(f"  ℹ️  Donor {name} already exists")
                continue
            u = User(
                email=email,
                hashed_password=hash_password(pwd),
                role=UserRole.DONOR,
                is_active=True,
                is_verified=verified,
            )
            db.add(u)
            db.flush()

            last_don_date = None
            if last_days is not None:
                last_don_date = datetime.now(timezone.utc) - timedelta(days=last_days)

            d = Donor(
                user_id=u.id,
                name=name,
                blood_group=bg,
                age=age,
                weight_kg=65.0,
                is_available=avail,
                is_verified=verified,
                latitude=lat,
                longitude=lon,
                city=city,
                last_donation_date=last_don_date,
                total_donations=total_don,
            )
            db.add(d)
            created_donors.append((u, d))

        if created_donors:
            print(f"  ✅ {len(created_donors)} demo donors created (password: Donor@1234 for all)")

        db.flush()

        # ── 4. Demo blood request ─────────────────────────────────────────────
        if hospital and not db.query(BloodRequest).filter(
            BloodRequest.patient_reference == "DEMO-REQ-001"
        ).first():
            req = BloodRequest(
                hospital_id=hospital.id,
                requested_by_user_id=hosp_user.id,
                blood_group=BloodGroup.O_NEG,
                units_required=2,
                urgency=UrgencyLevel.CRITICAL,
                status=RequestStatus.CREATED,
                latitude=hospital.latitude,
                longitude=hospital.longitude,
                required_by=datetime.now(timezone.utc) + timedelta(hours=4),
                patient_reference="DEMO-REQ-001",
                notes="[DEMO] Critical emergency — O- blood needed immediately. RTA victim.",
            )
            db.add(req)
            print("  ✅ Demo blood request created (O- CRITICAL)")

        db.commit()

        print("\n" + "=" * 60)
        print("🎉 Seed complete! Demo credentials:")
        print("=" * 60)
        print("  ADMIN    : admin@bloodbridge.demo      / Admin@1234")
        print("  HOSPITAL : apollo@bloodbridge.demo     / Hospital@1234")
        print("  DONORS   : rahul@bloodbridge.demo      / Donor@1234")
        print("             priya@bloodbridge.demo      / Donor@1234")
        print("             amit@bloodbridge.demo       / Donor@1234")
        print("             (and 7 more — see above)")
        print("=" * 60)
        print("  Swagger UI → http://127.0.0.1:8000/docs")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
