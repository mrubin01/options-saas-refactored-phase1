from app.db.database import engine, Base
from app.models.covered_call import CoveredCall
from app.models.put_option import PutOption
from app.models.spread_option import SpreadOption
from app.models.exchange import Exchange
from app.models.trend import Trend
from app.models.sector import Sector
from app.models.industry import Industry
from app.models.user import User

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)

    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    reset_db()
