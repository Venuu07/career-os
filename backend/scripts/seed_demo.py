'''
Stark Industries demo seed.

Usage (from backend/):
    python -m scripts.seed_demo
'''

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



# ─── Curated demo jobs ────────────────────────────────────────────────────────
# 16 hand-picked roles that cover all filter dimensions needed for the demo:
#   departments  : Engineering (6), Product (2), Design (2), Data (2), Operations (2), R&D (2)
#   work policy  : Remote, Hybrid, On-site
#   locations    : Malibu, New York, London, Berlin, Tokyo, Remote/Global
#   employment   : Full-time, Contract, Internship
#   seniority    : Entry, Mid, Senior, Lead
#   status       : all OPEN (curated, intentional)
#
# Titles are Stark-branded; data fields match existing Job model exactly.
# ─────────────────────────────────────────────────────────────────────────────

STARK_JOBS = [
    # ── Engineering (6) ──────────────────────────────────────────────────────
    {
        'title': 'Senior Backend Engineer',
        'department': 'Engineering',
        'location': 'Malibu, CA',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.SENIOR,
        'salary_range': 'USD 160K–200K / year',
        'description': 'Join our core platform team building the distributed systems that power arc reactor telemetry and real-time energy grid management. You will own backend services from design through production.',
        'application_url': 'https://careers.starkindustries.com/apply/backend-engineer',
    },
    {
        'title': 'Staff Frontend Engineer',
        'department': 'Engineering',
        'location': 'New York, NY',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.LEAD,
        'salary_range': 'USD 180K–220K / year',
        'description': 'Lead frontend architecture for our next-generation mission-control interfaces. You will set technical direction, mentor engineers, and ship React/TypeScript applications used by our global operations teams.',
        'application_url': 'https://careers.starkindustries.com/apply/staff-frontend',
    },
    {
        'title': 'DevOps Engineer',
        'department': 'Engineering',
        'location': 'Remote',
        'work_policy': WorkPolicy.REMOTE,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.MID,
        'salary_range': 'USD 130K–160K / year',
        'description': 'Own our Kubernetes infrastructure, CI/CD pipelines, and observability stack across six global data centers. We run some of the most demanding workloads on the planet — zero tolerance for downtime.',
        'application_url': 'https://careers.starkindustries.com/apply/devops',
    },
    {
        'title': 'Machine Learning Engineer',
        'department': 'Engineering',
        'location': 'Malibu, CA',
        'work_policy': WorkPolicy.ONSITE,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.SENIOR,
        'salary_range': 'USD 170K–210K / year',
        'description': 'Build and productionize ML models for autonomous systems, predictive maintenance, and threat detection. Work alongside our AI research team and deploy models that operate in millisecond latency environments.',
        'application_url': 'https://careers.starkindustries.com/apply/ml-engineer',
    },
    {
        'title': 'Mobile Engineer (iOS)',
        'department': 'Engineering',
        'location': 'London, United Kingdom',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.MID,
        'salary_range': 'GBP 90K–115K / year',
        'description': 'Build the Stark Field Operations iOS app used by technicians maintaining clean energy installations across Europe. Offline-first, real-time sync, and mission-critical reliability are non-negotiables.',
        'application_url': 'https://careers.starkindustries.com/apply/ios-engineer',
    },
    {
        'title': 'Engineering Intern – Embedded Systems',
        'department': 'Engineering',
        'location': 'Malibu, CA',
        'work_policy': WorkPolicy.ONSITE,
        'job_type': JobType.INTERNSHIP,
        'experience_level': ExperienceLevel.ENTRY,
        'salary_range': 'USD 8K / month',
        'description': 'Summer internship on our embedded systems team. Work on firmware for arc reactor control modules. Requires strong C/C++ fundamentals and curiosity for hardware-software interaction.',
        'application_url': 'https://careers.starkindustries.com/apply/embedded-intern',
    },
    # ── Product (2) ──────────────────────────────────────────────────────────
    {
        'title': 'Senior Product Manager – AI Platform',
        'department': 'Product',
        'location': 'New York, NY',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.SENIOR,
        'salary_range': 'USD 160K–195K / year',
        'description': 'Own the roadmap for JARVIS-class AI platform products. Partner with research, engineering, and enterprise customers to define the future of autonomous AI in industrial environments.',
        'application_url': 'https://careers.starkindustries.com/apply/pm-ai',
    },
    {
        'title': 'Associate Product Manager',
        'department': 'Product',
        'location': 'Remote',
        'work_policy': WorkPolicy.REMOTE,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.ENTRY,
        'salary_range': 'USD 95K–120K / year',
        'description': 'Join our APM program and rotate across product teams spanning clean energy, defense tech, and robotics. Ship features with real strategic weight within your first 90 days.',
        'application_url': 'https://careers.starkindustries.com/apply/apm',
    },
    # ── Design (2) ───────────────────────────────────────────────────────────
    {
        'title': 'Senior Product Designer',
        'department': 'Design',
        'location': 'Berlin, Germany',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.SENIOR,
        'salary_range': 'EUR 85K–110K / year',
        'description': 'Design mission-critical operator interfaces for Stark Energy Grid management systems. You will own end-to-end UX from research through delivery, with a strong focus on clarity under pressure.',
        'application_url': 'https://careers.starkindustries.com/apply/product-designer',
    },
    {
        'title': 'UX Researcher',
        'department': 'Design',
        'location': 'Malibu, CA',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.MID,
        'salary_range': 'USD 120K–150K / year',
        'description': 'Conduct generative and evaluative research to inform product strategy across our enterprise and consumer product lines. Build a deep understanding of how engineers, operators, and analysts use our systems under real conditions.',
        'application_url': 'https://careers.starkindustries.com/apply/ux-researcher',
    },
    # ── Data (2) ─────────────────────────────────────────────────────────────
    {
        'title': 'Data Engineer',
        'department': 'Data',
        'location': 'Remote',
        'work_policy': WorkPolicy.REMOTE,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.MID,
        'salary_range': 'USD 130K–165K / year',
        'description': 'Build and maintain petabyte-scale data pipelines processing telemetry from arc reactors, satellite systems, and IoT sensor networks worldwide. dbt, Spark, and Airflow are your daily tools.',
        'application_url': 'https://careers.starkindustries.com/apply/data-engineer',
    },
    {
        'title': 'Senior Data Scientist – Energy Systems',
        'department': 'Data',
        'location': 'Tokyo, Japan',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.SENIOR,
        'salary_range': 'JPY 15M–20M / year',
        'description': 'Develop predictive models for clean energy output optimisation across Asia-Pacific. You will work with rich sensor datasets, partner with engineering teams, and directly influence grid reliability for 60 million households.',
        'application_url': 'https://careers.starkindustries.com/apply/data-scientist-apac',
    },
    # ── Operations (2) ───────────────────────────────────────────────────────
    {
        'title': 'Global Operations Manager',
        'department': 'Operations',
        'location': 'New York, NY',
        'work_policy': WorkPolicy.ONSITE,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.SENIOR,
        'salary_range': 'USD 140K–175K / year',
        'description': 'Oversee day-to-day operations across our North American facilities. Drive process efficiency, own vendor relationships, and ensure our labs and manufacturing sites run at peak capacity.',
        'application_url': 'https://careers.starkindustries.com/apply/ops-manager',
    },
    {
        'title': 'Technical Operations Coordinator',
        'department': 'Operations',
        'location': 'Malibu, CA',
        'work_policy': WorkPolicy.ONSITE,
        'job_type': JobType.CONTRACT,
        'experience_level': ExperienceLevel.ENTRY,
        'salary_range': 'USD 65K–80K / year',
        'description': '12-month contract supporting lab operations and logistics for our R&D campus. Coordinate between engineering teams, procurement, and external partners to keep our highest-priority projects unblocked.',
        'application_url': 'https://careers.starkindustries.com/apply/ops-coordinator',
    },
    # ── R&D (2) ──────────────────────────────────────────────────────────────
    {
        'title': 'Research Scientist – Advanced Materials',
        'department': 'R&D',
        'location': 'Malibu, CA',
        'work_policy': WorkPolicy.ONSITE,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.SENIOR,
        'salary_range': 'USD 170K–220K / year',
        'description': 'Conduct original research into next-generation composites and metamaterials for aerospace and energy applications. PhD required. Publication record and lab leadership experience preferred.',
        'application_url': 'https://careers.starkindustries.com/apply/research-scientist',
    },
    {
        'title': 'Robotics Engineer',
        'department': 'R&D',
        'location': 'Tokyo, Japan',
        'work_policy': WorkPolicy.HYBRID,
        'job_type': JobType.FULL_TIME,
        'experience_level': ExperienceLevel.MID,
        'salary_range': 'JPY 10M–14M / year',
        'description': 'Design and test autonomous robotic systems for hazardous environment operations. Work within our Advanced Prototyping Lab alongside mechanical, electrical, and software engineers on prototypes that become real products.',
        'application_url': 'https://careers.starkindustries.com/apply/robotics-engineer',
    },
]


def _seed_jobs(db, company):
    '''
    Seed the curated Stark Industries demo jobs.

    Idempotency: keyed on (title, department, location).
    Existing jobs with that key are skipped.
    Jobs in the DB that are NOT in the curated list and were created by a
    previous seed run (identified by being OPEN with no application URL set
    via the old CSV path) are removed so re-runs produce a clean state.
    '''
    # Remove jobs seeded by the old CSV path (no application_url set)
    # so re-runs don't accumulate stale bulk-import rows.
    from sqlalchemy import delete as sa_delete
    old_csv_jobs = db.scalars(
        select(Job).where(
            Job.company_id == company.id,
            Job.application_url.is_(None),
        )
    ).all()
    removed = 0
    for j in old_csv_jobs:
        db.delete(j)
        removed += 1
    if removed:
        db.flush()
        print(f'  [CLEANUP] Removed {removed} old CSV-seeded jobs (no application_url)')

    rows = db.execute(
        select(Job.title, Job.department, Job.location).where(Job.company_id == company.id)
    ).all()
    existing = {(r.title, r.department, r.location) for r in rows}

    created = skipped = 0
    for spec in STARK_JOBS:
        key = (spec['title'], spec['department'], spec['location'])
        if key in existing:
            skipped += 1
            continue
        job = Job(
            company_id=company.id,
            title=spec['title'],
            department=spec['department'],
            location=spec['location'],
            work_policy=spec['work_policy'],
            job_type=spec['job_type'],
            experience_level=spec['experience_level'],
            salary_range=spec['salary_range'],
            description=spec.get('description'),
            application_url=spec.get('application_url'),
            status=JobStatus.OPEN,
        )
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
