"""
Decorator ve Wrapper Pattern Uygulamaları

Bu modül, projede kullanılan decorator ve wrapper fonksiyonlarını içerir.
Decorator'ler fonksiyonlara ek işlevsellik katmak için kullanılır.
"""

from functools import wraps
from fastapi import HTTPException, status, Depends
from sqlalchemy.exc import SQLAlchemyError
import time
import logging

# Logger yapılandırması
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================
# 1. ROLE-BASED AUTHORIZATION DECORATORS
# ============================================

def require_vendor(current_user):
    """
    Satıcı (Vendor) yetki kontrolü - FastAPI Dependency olarak kullanılır.
    
    Bu bir dependency fonksiyonudur. Kullanıcının 'corporate' rolüne sahip
    olup olmadığını kontrol eder. Değilse 403 Forbidden hatası fırlatır.
    
    Kullanım:
        @router.get("/vendor-only")
        def vendor_endpoint(
            current_user: models.User = Depends(require_vendor)
        ):
            ...
    
    Args:
        current_user: OAuth2 ile doğrulanmış kullanıcı
        
    Returns:
        Satıcı rolündeki kullanıcı
        
    Raises:
        HTTPException: 403 - Kullanıcı satıcı değilse
    """
    if current_user.role != "corporate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için satıcı yetkisi gereklidir"
        )
    return current_user


# ============================================
# 2. LOGGING WRAPPER DECORATOR
# ============================================

def log_execution(func):
    """
    Fonksiyon çalışma süresini ve bilgilerini loglayan wrapper decorator.
    
    Bu decorator, bir fonksiyonun ne zaman çağrıldığını, ne kadar sürdüğünü
    ve herhangi bir hata oluşup oluşmadığını loglar.
    
    Kullanım:
        @log_execution
        def my_function():
            ...
    
    Args:
        func: Dekore edilecek fonksiyon
        
    Returns:
        Wrapper fonksiyon
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        func_name = func.__name__
        start_time = time.time()
        
        # Fonksiyon başlangıcını logla
        logger.info(f"[START] {func_name} fonksiyonu çağrıldı")
        
        try:
            # Orijinal fonksiyonu çalıştır
            result = func(*args, **kwargs)
            
            # Başarılı tamamlanmayı logla
            elapsed_time = time.time() - start_time
            logger.info(f"[SUCCESS] {func_name} - {elapsed_time:.3f} saniye sürdü")
            
            return result
            
        except Exception as e:
            # Hata durumunu logla
            elapsed_time = time.time() - start_time
            logger.error(f"[ERROR] {func_name} - {elapsed_time:.3f} saniye - Hata: {str(e)}")
            raise
    
    return wrapper


# ============================================
# 3. DATABASE ERROR HANDLER WRAPPER
# ============================================

def handle_db_errors(func):
    """
    Veritabanı hatalarını yakalayan ve uygun HTTP response döndüren wrapper decorator.
    
    SQLAlchemy hatalarını yakalar ve kullanıcı dostu bir hata mesajı döndürür.
    Bu, hassas veritabanı bilgilerinin istemciye sızmasını önler.
    
    Kullanım:
        @handle_db_errors
        def database_operation():
            ...
    
    Args:
        func: Dekore edilecek fonksiyon
        
    Returns:
        Wrapper fonksiyon
        
    Raises:
        HTTPException: 500 - Veritabanı hatası oluşursa
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except SQLAlchemyError as e:
            logger.error(f"Veritabanı hatası [{func.__name__}]: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Veritabanı işlemi sırasında bir hata oluştu"
            )
    return wrapper


# ============================================
# 4. GENERIC RETRY WRAPPER DECORATOR
# ============================================

def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """
    Başarısız işlemleri tekrar deneyen wrapper decorator factory.
    
    Belirli sayıda başarısız deneme sonrası hatayı fırlatır.
    Özellikle dış servislerle iletişimde (örn: ödeme sistemi) kullanışlıdır.
    
    Kullanım:
        @retry_on_failure(max_retries=3, delay=1.0)
        def external_api_call():
            ...
    
    Args:
        max_retries: Maksimum deneme sayısı
        delay: Denemeler arası bekleme süresi (saniye)
        
    Returns:
        Decorator fonksiyon
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logger.warning(
                        f"[RETRY] {func.__name__} - Deneme {attempt}/{max_retries} başarısız: {str(e)}"
                    )
                    if attempt < max_retries:
                        time.sleep(delay)
            
            logger.error(f"[FAILED] {func.__name__} - Tüm denemeler başarısız oldu")
            raise last_exception
        
        return wrapper
    return decorator


# ============================================
# 5. VALIDATE INPUT WRAPPER DECORATOR
# ============================================

def validate_positive_id(param_name: str = "id"):
    """
    ID parametresinin pozitif olduğunu doğrulayan decorator factory.
    
    Kullanım:
        @validate_positive_id("product_id")
        def get_product(product_id: int):
            ...
    
    Args:
        param_name: Kontrol edilecek parametre adı
        
    Returns:
        Decorator fonksiyon
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            value = kwargs.get(param_name)
            if value is not None and value <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{param_name} pozitif bir değer olmalıdır"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator
