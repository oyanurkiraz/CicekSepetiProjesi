from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, database, oauth2
from ..services.payment_service import PaymentService, PaymentRequest, PaymentResponse

router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post("/", response_model=PaymentResponse)
def create_payment(
    request: PaymentRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Ödeme işlemi başlat"""
    # API anahtarı kontrolü
    if not PaymentService.validate_api_keys():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="iyzico API anahtarları yapılandırılmamış. Lütfen .env dosyasını kontrol edin."
        )
    
    # Ödeme isteği hazırla
    payment_request_data = PaymentService.prepare_payment_request(
        request=request,
        user_id=current_user.id,
        user_email=current_user.email
    )
    
    try:
        # Ödeme işlemi
        return PaymentService.process_payment(payment_request_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
