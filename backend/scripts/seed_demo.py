'''
Stark Industries demo seed.

Usage (from backend/):
    python -m scripts.seed_demo
'''

import csv
import sys
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy import select, func

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.models.company_member import CompanyMember, MemberRole
from app.models.career_page import CareersPage
from app.models.career_page_version import CareerPageVersion, VersionStatus
from app.models.job import Job, JobType, JobStatus, WorkPolicy, ExperienceLevel
from app.services.security import get_password_hash, verify_password

DEMO_EMAIL = 'demo@careeros.dev'
DEMO_PASSWORD = 'Demo@12345'
DEMO_FULL_NAME = 'Tony Stark'
COMPANY_NAME = 'Stark Industries'
COMPANY_SLUG = 'stark-industries'
CSV_PATH = Path(__file__).resolve().parent.parent / 'data' / 'sampledata.csv'

STARK_THEME = {
    'primary_color': '#0A84FF',
    'accent_color': '#00D4FF',
    'background_color': '#0D1117',
    'font_family': 'inter',
    'logo_url': None,
}

STARK_SECTIONS = [
    {'id': 'hero-1', 'type': 'hero', 'order': 0, 'visible': True, 'data': {
        'title': 'Build the Future at Stark Industries',
        'subtitle': 'We are assembling the world most brilliant engineers, scientists, and innovators. Join us and help shape the future of clean energy, defense technology, and advanced AI.',
        'cta_label': 'See open roles',
    }},
    {'id': 'about-1', 'type': 'about', 'order': 1, 'visible': True, 'data': {
        'title': 'About Stark Industries',
        'content': 'Founded by Howard Stark, Stark Industries has evolved from a leading defense contractor into a global technology powerhouse. Under Tony Stark leadership, we pioneered the arc reactor -- a self-sustaining clean energy source powering everything from our Malibu campus to Iron Man armor.\n\nToday, our 48,000 employees across 12 countries push the boundaries of advanced materials, robotics, AI, and sustainable energy.',
        'image_position': 'right',
    }},
    {'id': 'culture-1', 'type': 'culture', 'order': 2, 'visible': True, 'data': {
        'title': 'Life at Stark Industries',
        'content': 'We move at the speed of innovation. Our engineers have 20% time for moonshot projects. Our labs are open 24/7. We ship fast, iterate fast, and celebrate curiosity above all else. No bureaucracy. Just brilliant people solving hard problems.',
    }},
    {'id': 'benefits-1', 'type': 'benefits', 'order': 3, 'visible': True, 'data': {
        'title': 'Why Join Us',
        'items': [
            {'icon': 'zap', 'title': 'Cutting-edge tech', 'description': 'Work on technology that does not exist anywhere else on Earth.'},
            {'icon': 'globe', 'title': 'Global impact', 'description': 'Our clean energy solutions power 200 million homes worldwide.'},
            {'icon': 'shield', 'title': 'Exceptional benefits', 'description': 'Full medical, dental, vision, 401k match, and stock options.'},
            {'icon': 'users', 'title': 'World-class team', 'description': 'Work alongside leading scientists and engineers.'},
        ],
    }},
    {'id': 'jobs-1', 'type': 'jobs', 'order': 4, 'visible': True, 'data': {
        'title': 'Open Positions',
        'subtitle': 'We are always looking for exceptional talent.',
    }},
]

WORK_POLICY_MAP = {
    'remote': WorkPolicy.REMOTE,
    'hybrid': WorkPolicy.HYBRID,
    'on-site': WorkPolicy.ONSITE,
    'onsite': WorkPolicy.ONSITE,
    'on site': WorkPolicy.ONSITE,
}
EMPLOYMENT_TYPE_MAP = {
    'full time': JobType.FULL_TIME,
    'full-time': JobType.FULL_TIME,
    'part time': JobType.PART_TIME,
    'part-time': JobType.PART_TIME,
    'contract': JobType.CONTRACT,
    'internship': JobType.INTERNSHIP,
}
EXPERIENCE_MAP = {
    'junior': ExperienceLevel.ENTRY,
    'entry': ExperienceLevel.ENTRY,
    'entry-level': ExperienceLevel.ENTRY,
    'mid-level': ExperienceLevel.MID,
    'mid level': ExperienceLevel.MID,
    'mid': ExperienceLevel.MID,
    'senior': ExperienceLevel.SENIOR,
    'lead': ExperienceLevel.LEAD,
}


def _get_or_create_user(db):
    user = db.scalar(select(User).where(User.email == DEMO_EMAIL))
    if user:
        print(f'  [FOUND]   User {DEMO_EMAIL}')
        return user
    user = User(email=DEMO_EMAIL, hashed_password=get_password_hash(DEMO_PASSWORD), full_name=DEMO_FULL_NAME, is_active=True)
    db.add(user)
    db.flush()
    print(f'  [CREATED] User {DEMO_EMAIL}')
    return user


def _get_or_create_company(db):
    company = db.scalar(select(Company).where(Company.slug == COMPANY_SLUG))
    if company:
        print(f'  [FOUND]   Company {company.name}')
        return company
    company = Company(name=COMPANY_NAME, slug=COMPANY_SLUG)
    db.add(company)
    db.flush()
    print(f'  [CREATED] Company {COMPANY_NAME}')
    return company


def _get_or_create_membership(db, user, company):
    member = db.scalar(select(CompanyMember).where(CompanyMember.user_id == user.id, CompanyMember.company_id == company.id))
    if member:
        print(f'  [FOUND]   Membership {user.email} -> {company.name}')
        return member
    member = CompanyMember(user_id=user.id, company_id=company.id, role=MemberRole.OWNER)
    db.add(member)
    db.flush()
    print(f'  [CREATED] Membership OWNER')
    return member


def _get_or_create_page(db, company, user):
    page = db.scalar(select(CareersPage).where(CareersPage.company_id == company.id))
    if page:
        print(f'  [FOUND]   Career page id={page.id}')
        return page
    page = CareersPage(company_id=company.id, title='Stark Industries Careers', meta_description='Join Stark Industries. See open roles in engineering, AI, and clean energy.')
    db.add(page)
    db.flush()
    print(f'  [CREATED] Career page')
    return page


def _ensure_published(db, page, user):
    pub = None
    if page.published_version_id:
        pub = db.scalar(select(CareerPageVersion).where(CareerPageVersion.id == page.published_version_id))
    if pub and pub.theme_config.get('primary_color') == STARK_THEME['primary_color']:
        print(f'  [FOUND]   Published v{pub.version_number} with Stark theme')
        return
    if pub:
        pub.status = VersionStatus.ARCHIVED
        db.flush()
    max_v = db.scalar(select(func.max(CareerPageVersion.version_number)).where(CareerPageVersion.career_page_id == page.id)) or 0
    pv = CareerPageVersion(career_page_id=page.id, version_number=max_v+1, status=VersionStatus.PUBLISHED, sections_config=STARK_SECTIONS, theme_config=STARK_THEME, created_by_id=user.id, published_at=datetime.now(timezone.utc))
    db.add(pv)
    db.flush()
    dv = CareerPageVersion(career_page_id=page.id, version_number=max_v+2, status=VersionStatus.DRAFT, sections_config=STARK_SECTIONS, theme_config=STARK_THEME, created_by_id=user.id)
    db.add(dv)
    db.flush()
    page.published_version_id = pv.id
    db.flush()
    print(f'  [CREATED] Published v{max_v+1} + Draft v{max_v+2}')


def _seed_jobs(db, company):
    if not CSV_PATH.exists():
        print(f'  [ERROR]   CSV not found at {CSV_PATH}', file=sys.stderr)
        return 0, 0
    rows = db.execute(select(Job.title, Job.location).where(Job.company_id == company.id)).all()
    existing = {(r.title, r.location) for r in rows}
    created = skipped = 0
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            title = row.get('title', '').strip()
            location = row.get('location', '').strip() or None
            if not title:
                skipped += 1
                continue
            key = (title, location)
            if key in existing:
                skipped += 1
                continue
            wp = WORK_POLICY_MAP.get((row.get('work_policy', '') or '').strip().lower())
            jt = EMPLOYMENT_TYPE_MAP.get((row.get('employment_type', '') or '').strip().lower(), JobType.FULL_TIME)
            el = EXPERIENCE_MAP.get((row.get('experience_level', '') or '').strip().lower())
            dept = row.get('department', '').strip() or None
            sal = row.get('salary_range', '').strip() or None
            rem = i % 10
            status = JobStatus.OPEN if rem < 8 else (JobStatus.DRAFT if rem == 8 else JobStatus.CLOSED)
            job = Job(company_id=company.id, title=title, location=location, department=dept, job_type=jt, work_policy=wp, experience_level=el, salary_range=sal, status=status)
            db.add(job)
            existing.add(key)
            created += 1
    db.flush()
    return created, skipped


def run():
    print('\n=== CareerOS Demo Seed - Stark Industries ===\n')
    db = SessionLocal()
    try:
        print('[1] User')
        user = _get_or_create_user(db)
        print('\n[2] Company')
        company = _get_or_create_company(db)
        print('\n[3] Membership')
        _get_or_create_membership(db, user, company)
        print('\n[4] Career page')
        page = _get_or_create_page(db, company, user)
        print('\n[5] Publish with Stark theme')
        _ensure_published(db, page, user)
        print('\n[6] Import jobs')
        created, skipped = _seed_jobs(db, company)
        print(f'  [DONE]    Created: {created}  Skipped: {skipped}')
        db.commit()
        print('\n  Commit OK')

        print('\n[7] Validation')
        pg = db.scalar(select(CareersPage).where(CareersPage.company_id == company.id))
        pv = db.scalar(select(CareerPageVersion).where(CareerPageVersion.id == pg.published_version_id)) if pg and pg.published_version_id else None
        all_j = db.execute(select(Job.status).where(Job.company_id == company.id)).all()
        open_j = sum(1 for j in all_j if j.status == JobStatus.OPEN)
        pw_ok = verify_password(DEMO_PASSWORD, user.hashed_password)
        print(f'''
  Demo user:     {user.email}
  Active:        {user.is_active}
  Password OK:   {pw_ok}
  Company:       {company.name}
  Slug:          {company.slug}
  Public URL:    /{company.slug}/careers
  Page exists:   {pg is not None}
  Published:     {pv is not None}
  Theme primary: {pv.theme_config.get("primary_color") if pv else None}
  Total jobs:    {len(all_j)}
  Open jobs:     {open_j}
''')
        if not pw_ok:
            print('[FAIL] Password hash verification failed', file=sys.stderr)
            sys.exit(1)
        if pv is None:
            print('[FAIL] Career page not published', file=sys.stderr)
            sys.exit(1)
        print('=== Seed complete [OK] ===\n')
    except Exception as exc:
        db.rollback()
        print(f'\n[ERROR] {exc}', file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    run()
