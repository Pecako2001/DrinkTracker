from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_admin

router = APIRouter()


@router.post("/payments/topup")
def top_up(
    payment: schemas.PaymentCreate, db: Session = Depends(get_db)
) -> dict[str, str]:
    """Create a payment and return the checkout URL."""
    url = crud.create_payment(db, payment)
    return {"checkoutUrl": url}


@router.get("/payments", response_model=list[schemas.Payment])
def list_payments(
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
) -> list[models.Payment]:
    """List all payment records."""
    return db.query(models.Payment).all()
