from app.db.database import Base, engine
from app.models.covered_call import CoveredCall
from app.models.put_option import PutOption
from app.models.spread_option import SpreadOption
from app.models.exchange import Exchange
from app.models.trend import Trend
from app.models.sector import Sector
from app.models.industry import Industry
# from app import models  # ensure all models are imported

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Tables created successfully!!!")

