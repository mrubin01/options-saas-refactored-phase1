from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.database import SessionLocal
from app.models.exchange import Exchange
from app.models.trend import Trend
from app.models.sector import Sector
from app.models.industry import Industry
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL_ADMIN = settings.DATABASE_URL_ADMIN
if not DATABASE_URL_ADMIN:
    raise RuntimeError("DATABASE_URL_ADMIN is not set")

engine = create_engine(settings.DATABASE_URL_APP,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine)

def seed_exchanges(db: Session):
    exchanges = [
        {"exchange_id": 0, "exchange_name": "NYSE"},
        {"exchange_id": 1, "exchange_name": "NASDAQ"},
        {"exchange_id": 2, "exchange_name": "ARCA"},
    ]

    for ex in exchanges:
        exists = db.query(Exchange).filter(
            Exchange.exchange_id == ex["exchange_id"]
        ).first()

        if not exists:
            db.add(Exchange(**ex))

    db.commit()

def seed_trends(db: Session):
    trends = [
        {"trend_id": 0, "trend_name": "Neutral"},
        {"trend_id": 1, "trend_name": "Bullish"},
        {"trend_id": 2, "trend_name": "Bearish"},
    ]

    for tr in trends:
        exists = db.query(Trend).filter(
            Trend.trend_id == tr["trend_id"]
        ).first()

        if not exists:
            db.add(Trend(**tr))

    db.commit()


def seed_sectors(db: Session):
    sectors = [
        {"sector_id": 0, "sector_name": "Financial Services"},
        {"sector_id": 1, "sector_name": "Consumer Defensive"},
        {"sector_id": 2, "sector_name": "Industrials"},
        {"sector_id": 3, "sector_name": "Technology"},
        {"sector_id": 4, "sector_name": "Healthcare"},
        {"sector_id": 5, "sector_name": "Consumer Cyclical"},
        {"sector_id": 6, "sector_name": "Energy"},
        {"sector_id": 7, "sector_name": "Basic Materials"},
        {"sector_id": 8, "sector_name": "Real Estate"},
        {"sector_id": 9, "sector_name": "Communication Services"},
        {"sector_id": 10, "sector_name": "Utilities"},
    ]

    for sec in sectors:
        exists = db.query(Sector).filter(
            Sector.sector_id == sec["sector_id"]
        ).first()

        if not exists:
            db.add(Sector(**sec))

    db.commit()

def seed_industries(db: Session):
    industries = [
        {"industry_id": 0, "industry_name": "Advertising Agencies"},
        {"industry_id": 1, "industry_name": "Aerospace & Defense"},
        {"industry_id": 2, "industry_name": "Agricultural Inputs"},
        {"industry_id": 3, "industry_name": "Airlines"},
        {"industry_id": 4, "industry_name": "Apparel Manufacturing"},
        {"industry_id": 5, "industry_name": "Apparel Retail"},
        {"industry_id": 6, "industry_name": "Asset Management"},
        {"industry_id": 7, "industry_name": "Auto Manufacturers"},
        {"industry_id": 8, "industry_name": "Auto Parts"},
        {"industry_id": 9, "industry_name": "Auto & Truck Dealerships"},
        {"industry_id": 10, "industry_name": "Banks - Diversified"},
        {"industry_id": 11, "industry_name": "Banks - Regional"},
        {"industry_id": 12, "industry_name": "Beverages - Non-Alcoholic"},
        {"industry_id": 13, "industry_name": "Biotechnology"},
        {"industry_id": 14, "industry_name": "Broadcasting"},
        {"industry_id": 15, "industry_name": "Building Materials"},
        {"industry_id": 16, "industry_name": "Building Products & Equipment"},
        {"industry_id": 17, "industry_name": "Business Equipment & Supplies"},
        {"industry_id": 18, "industry_name": "Capital Markets"},    
        {"industry_id": 19, "industry_name": "Chemicals"},
        {"industry_id": 20, "industry_name": "Communication Equipment"},
        {"industry_id": 21, "industry_name": "Computer Hardware"},
        {"industry_id": 22, "industry_name": "Consulting Services"},
        {"industry_id": 23, "industry_name": "Credit Services"},
        {"industry_id": 24, "industry_name": "Department Stores"},
        {"industry_id": 25, "industry_name": "Diagnostics & Research"},
        {"industry_id": 26, "industry_name": "Discount Stores"},
        {"industry_id": 27, "industry_name": "Drug Manufacturers - General"},
        {"industry_id": 28, "industry_name": "Drug Manufacturers - Specialty & Generic"},
        {"industry_id": 29, "industry_name": "Education & Training Services"},
        {"industry_id": 30, "industry_name": "Electrical Equipment & Parts"},
        {"industry_id": 31, "industry_name": "Electronic Components"},
        {"industry_id": 32, "industry_name": "Electronics & Computer Distribution"},
        {"industry_id": 33, "industry_name": "Engineering & Construction"},
        {"industry_id": 34, "industry_name": "Entertainment"},
        {"industry_id": 35, "industry_name": "Farm & Heavy Construction Machinery"},
        {"industry_id": 36, "industry_name": "Farm Products"},
        {"industry_id": 37, "industry_name": "Financial Data & Stock Exchanges"},
        {"industry_id": 38, "industry_name": "Food Distribution"},
        {"industry_id": 39, "industry_name": "Footwear & Accessories"},
        {"industry_id": 40, "industry_name": "Furnishings, Fixtures & Appliances"},
        {"industry_id": 41, "industry_name": "Gambling"},
        {"industry_id": 42, "industry_name": "Gold"},
        {"industry_id": 43, "industry_name": "Grocery Stores"},
        {"industry_id": 44, "industry_name": "Healthcare Plans"},
        {"industry_id": 45, "industry_name": "Health Information Services"},
        {"industry_id": 46, "industry_name": "Home Improvement Retail"},
        {"industry_id": 47, "industry_name": "Household & Personal Products"},
        {"industry_id": 48, "industry_name": "Industrial Distribution"},
        {"industry_id": 49, "industry_name": "Information Technology Services"},
        {"industry_id": 50, "industry_name": "Insurance Brokers"},
        {"industry_id": 51, "industry_name": "Insurance - Diversified"},
        {"industry_id": 52, "industry_name": "Insurance - Life"},           
        {"industry_id": 53, "industry_name": "Insurance - Property & Casualty"},
        {"industry_id": 54, "industry_name": "Insurance - Reinsurance"},
        {"industry_id": 55, "industry_name": "Insurance - Specialty"},
        {"industry_id": 56, "industry_name": "Integrated Freight & Logistics"},
        {"industry_id": 57, "industry_name": "Internet Content & Information"},
        {"industry_id": 58, "industry_name": "Internet Retail"},
        {"industry_id": 59, "industry_name": "Leisure"},
        {"industry_id": 60, "industry_name": "Lodging"},
        {"industry_id": 61, "industry_name": "Marine Shipping"},
        {"industry_id": 62, "industry_name": "Medical Care Facilities"},
        {"industry_id": 63, "industry_name": "Medical Devices"},
        {"industry_id": 64, "industry_name": "Medical Distribution"},
        {"industry_id": 65, "industry_name": "Medical Instruments & Supplies"},
        {"industry_id": 66, "industry_name": "Metal Fabrication"},
        {"industry_id": 67, "industry_name": "Mortgage Finance"},
        {"industry_id": 68, "industry_name": "Oil & Gas E&P"},
        {"industry_id": 69, "industry_name": "Oil & Gas Equipment & Services"},
        {"industry_id": 70, "industry_name": "Oil & Gas Integrated"},
        {"industry_id": 71, "industry_name": "Oil & Gas Midstream"},
        {"industry_id": 72, "industry_name": "Oil & Gas Refining & Marketing"},
        {"industry_id": 73, "industry_name": "Packaged Foods"},
        {"industry_id": 74, "industry_name": "Packaging & Containers"},
        {"industry_id": 75, "industry_name": "Personal Services"},
        {"industry_id": 76, "industry_name": "Pollution & Treatment Controls"},
        {"industry_id": 77, "industry_name": "Railroads"},
        {"industry_id": 78, "industry_name": "Real Estate - Development"},
        {"industry_id": 79, "industry_name": "Real Estate Services"},
        {"industry_id": 80, "industry_name": "Recreational Vehicles"},
        {"industry_id": 81, "industry_name": "REIT - Diversified"},
        {"industry_id": 82, "industry_name": "REIT - Healthcare Facilities"},
        {"industry_id": 83, "industry_name": "REIT - Hotel & Motel"},
        {"industry_id": 84, "industry_name": "REIT - Industrial"},
        {"industry_id": 85, "industry_name": "REIT - Mortgage"},
        {"industry_id": 86, "industry_name": "REIT - Office"},
        {"industry_id": 87, "industry_name": "REIT - Residential"},
        {"industry_id": 88, "industry_name": "REIT - Retail"},
        {"industry_id": 89, "industry_name": "REIT - Specialty"},
        {"industry_id": 90, "industry_name": "Rental & Leasing Services"},
        {"industry_id": 91, "industry_name": "Residential Construction"},
        {"industry_id": 92, "industry_name": "Resorts & Casinos"},
        {"industry_id": 93, "industry_name": "Restaurants"},
        {"industry_id": 94, "industry_name": "Scientific & Technical Instruments"},
        {"industry_id": 95, "industry_name": "Security & Protection Services"},
        {"industry_id": 96, "industry_name": "Semiconductor Equipment & Materials"},
        {"industry_id": 97, "industry_name": "Semiconductors"},
        {"industry_id": 98, "industry_name": "Software - Application"},
        {"industry_id": 99, "industry_name": "Software - Infrastructure"},
        {"industry_id": 100, "industry_name": "Specialty Business Services"},
        {"industry_id": 101, "industry_name": "Specialty Chemicals"},
        {"industry_id": 102, "industry_name": "Specialty Industrial Machinery"},
        {"industry_id": 103, "industry_name": "Specialty Retail"},
        {"industry_id": 104, "industry_name": "Staffing & Employment Services"},
        {"industry_id": 105, "industry_name": "Steel"},
        {"industry_id": 106, "industry_name": "Telecom Services"},
        {"industry_id": 107, "industry_name": "Thermal Coal"},
        {"industry_id": 108, "industry_name": "Tobacco"},
        {"industry_id": 109, "industry_name": "Tools & Accessories"},
        {"industry_id": 110, "industry_name": "Travel Services"},
        {"industry_id": 111, "industry_name": "Trucking"},
        {"industry_id": 112, "industry_name": "Utilities - Diversified"},
        {"industry_id": 113, "industry_name": "Utilities - Regulated Electric"},
        {"industry_id": 114, "industry_name": "Utilities - Regulated Gas"},
        {"industry_id": 115, "industry_name": "Utilities - Regulated Water"},
        {"industry_id": 116, "industry_name": "Utilities - Renewable"},
        {"industry_id": 117, "industry_name": "Waste Management"},
    ]

    for ind in industries:
        exists = db.query(Industry).filter(
            Industry.industry_id == ind["industry_id"]
        ).first()

        if not exists:
            db.add(Industry(**ind))

def run():
    db = SessionLocal()
    try:
        seed_exchanges(db)
        seed_trends(db)
        seed_sectors(db)
        seed_industries(db)
        db.commit()
        print("Lookup tables seeded successfully!!!")
    finally:
        db.close()

if __name__ == "__main__":
    run()
