from typing import List, Dict, Any, Optional
import os
import uuid
import iyzipay
from dotenv import load_dotenv
from pydantic import BaseModel
from ..decorators import log_execution, handle_db_errors

load_dotenv()


# --- SCHEMAS (Payment-specific) ---
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
    price: str
    category: str = "Çiçek"


class PaymentRequest(BaseModel):
    paymentCard: PaymentCard
    buyer: Buyer
    basketItems: List[BasketItem]
    totalPrice: str


class PaymentResponse(BaseModel):
    status: str
    message: str
    paymentId: Optional[str] = None
    conversationId: Optional[str] = None


class PaymentService:
    """
    Ödeme işlemleri için service sınıfı.
    
    Bu sınıf İyzico ödeme entegrasyonunu yönetir ve wrapper decorator'lerle
    loglama ve hata yönetimi sağlar.
    """
    
    @staticmethod
    def get_iyzico_options() -> Dict[str, str]:
        """İyzico API ayarlarını döndür"""
        return {
            'api_key': os.getenv('IYZICO_API_KEY', ''),
            'secret_key': os.getenv('IYZICO_SECRET_KEY', ''),
            'base_url': os.getenv('IYZICO_BASE_URL', 'sandbox-api.iyzipay.com')
        }
    
    @staticmethod
    def validate_api_keys() -> bool:
        """API anahtarlarının geçerliliğini kontrol et"""
        options = PaymentService.get_iyzico_options()
        if not options['api_key'] or options['api_key'] == 'sandbox-YOUR_API_KEY_HERE':
            return False
        return True
    
    @staticmethod
    @log_execution
    def prepare_payment_request(
        request: PaymentRequest,
        user_id: int,
        user_email: str
    ) -> Dict[str, Any]:
        """
        İyzico için ödeme isteği hazırla.
        
        Not: @log_execution wrapper ile bu fonksiyonun çalışma süresi
        ve durumu otomatik olarak loglanır.
        """
        conversation_id = str(uuid.uuid4())[:8]
        
        # Kart bilgisi
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
            'id': f'BY{user_id}',
            'name': request.buyer.name,
            'surname': request.buyer.surname,
            'gsmNumber': request.buyer.phone,
            'email': request.buyer.email if request.buyer.email else user_email,
            'identityNumber': '11111111111',
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
        
        return {
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
    
    @staticmethod
    @log_execution
    @handle_db_errors
    def process_payment(payment_request_data: Dict[str, Any]) -> PaymentResponse:
        """
        Ödeme işlemini gerçekleştir.
        
        Not: 
        - @log_execution wrapper ile çalışma süresi ve durumu loglanır.
        - @handle_db_errors wrapper ile olası veritabanı hataları yakalanır.
        """
        import json
        
        options = PaymentService.get_iyzico_options()
        conversation_id = payment_request_data.get('conversationId', '')
        
        try:
            payment = iyzipay.Payment().create(payment_request_data, options)
            result = payment.read()
            
            # iyzico yanıtı bytes olarak geliyor
            if isinstance(result, bytes):
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
            raise Exception(f"Ödeme işlemi sırasında hata oluştu: {str(e)}")

