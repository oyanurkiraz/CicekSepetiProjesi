from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import iyzipay
import os
from dotenv import load_dotenv
from .. import models, database, oauth2
import uuid

# .env dosyasını yükle
load_dotenv()

router = APIRouter(prefix="/payment", tags=["Payment"])
get_db = database.get_db

# iyzico ayarları
def get_iyzico_options():
    return {
        'api_key': os.getenv('IYZICO_API_KEY', ''),
        'secret_key': os.getenv('IYZICO_SECRET_KEY', ''),
        'base_url': os.getenv('IYZICO_BASE_URL', 'sandbox-api.iyzipay.com')
    }

# --- SCHEMAS ---
class PaymentCard(BaseModel):
    cardHolderName: str
    cardNumber: str
    expireMonth: str
    expireYear: str
    cvc: str

class Buyer(BaseModel):
    name: str
    surname: str
    phone: str
    email: str
    address: str
    city: str = "Istanbul"

class BasketItem(BaseModel):
    id: str
    name: str
    price: str  # iyzico string bekliyor
    category: str = "Çiçek"

class PaymentRequest(BaseModel):
    paymentCard: PaymentCard
    buyer: Buyer
    basketItems: List[BasketItem]
    totalPrice: str  # iyzico string bekliyor

class PaymentResponse(BaseModel):
    status: str
    message: str
    paymentId: Optional[str] = None
    conversationId: Optional[str] = None

# --- ENDPOINT ---
@router.post("/", response_model=PaymentResponse)
def create_payment(
    request: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    options = get_iyzico_options()
    
    # API anahtarı kontrolü
    if not options['api_key'] or options['api_key'] == 'sandbox-YOUR_API_KEY_HERE':
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="iyzico API anahtarları yapılandırılmamış. Lütfen .env dosyasını kontrol edin."
        )
    
    conversation_id = str(uuid.uuid4())[:8]
    
    # iyzico için kart bilgisi
    payment_card = {
        'cardHolderName': request.paymentCard.cardHolderName,
        'cardNumber': request.paymentCard.cardNumber,
        'expireMonth': request.paymentCard.expireMonth,
        'expireYear': request.paymentCard.expireYear,
        'cvc': request.paymentCard.cvc,
        'registerCard': '0'
    }
    
    # Alıcı bilgisi
    buyer = {
        'id': f'BY{current_user.id}',
        'name': request.buyer.name,
        'surname': request.buyer.surname,
        'gsmNumber': request.buyer.phone,
        'email': request.buyer.email if request.buyer.email else current_user.email,
        'identityNumber': '11111111111',  # TC Kimlik - test için sabit
        'registrationAddress': request.buyer.address,
        'ip': '85.34.78.112',
        'city': request.buyer.city,
        'country': 'Turkey',
        'zipCode': '34000'
    }
    
    # Adres bilgisi
    address = {
        'contactName': f'{request.buyer.name} {request.buyer.surname}',
        'city': request.buyer.city,
        'country': 'Turkey',
        'address': request.buyer.address,
        'zipCode': '34000'
    }
    
    # Sepet ürünleri
    basket_items = []
    for item in request.basketItems:
        basket_items.append({
            'id': item.id,
            'name': item.name,
            'category1': item.category,
            'itemType': 'PHYSICAL',
            'price': item.price
        })
    
    # Ödeme isteği
    payment_request = {
        'locale': 'tr',
        'conversationId': conversation_id,
        'price': request.totalPrice,
        'paidPrice': request.totalPrice,
        'currency': 'TRY',
        'installment': '1',
        'basketId': f'B{conversation_id}',
        'paymentChannel': 'WEB',
        'paymentGroup': 'PRODUCT',
        'paymentCard': payment_card,
        'buyer': buyer,
        'shippingAddress': address,
        'billingAddress': address,
        'basketItems': basket_items
    }
    
    try:
        payment = iyzipay.Payment().create(payment_request, options)
        result = payment.read()
        
        # iyzico yanıtı bytes olarak geliyor, decode et
        if isinstance(result, bytes):
            import json
            result = json.loads(result.decode('utf-8'))
        
        if result.get('status') == 'success':
            return PaymentResponse(
                status="success",
                message="Ödeme başarıyla tamamlandı!",
                paymentId=result.get('paymentId'),
                conversationId=conversation_id
            )
        else:
            error_message = result.get('errorMessage', 'Ödeme işlemi başarısız oldu.')
            return PaymentResponse(
                status="failure",
                message=error_message,
                conversationId=conversation_id
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ödeme işlemi sırasında hata oluştu: {str(e)}"
        )
