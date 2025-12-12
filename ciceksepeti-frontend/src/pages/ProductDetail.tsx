import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, User, Clock, Send, AlertCircle, PackageCheck } from 'lucide-react';
import OrderWizardModal from '../components/OrderWizardModal';

// --- TİP TANIMLAMALARI ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
      full_name: string;
  }
}

const ProductDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); 

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- SAYFA AÇILINCA VERİLERİ ÇEK ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const prodResponse = await fetch(`http://127.0.0.1:8000/products/${id}`);
        if (!prodResponse.ok) throw new Error("Ürün bulunamadı.");
        const prodData = await prodResponse.json();
        setProduct(prodData);
        
        const imgList = [
            prodData.image_url,
            "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&q=80",
            "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&q=80"
        ];
        setImages(imgList);
        setSelectedImage(prodData.image_url);

        const reviewResponse = await fetch(`http://127.0.0.1:8000/reviews/?product_id=${id}`);
        if (reviewResponse.ok) {
            const reviewData = await reviewResponse.json();
            setReviews(reviewData);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);


  // --- SİPARİŞİ MODAL ÜZERİNDEN TAMAMLA ---
  const handleConfirmOrder = async (orderDetails: any) => {
    try {
        const response = await fetch("http://127.0.0.1:8000/orders/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: Number(id),
                ...orderDetails,
                delivery_date: "Hemen Teslim"
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Sipariş oluşturulamadı.");
        }

        const data = await response.json();
        alert(`🎉 Siparişiniz Alındı!\n\nTakip Kodunuz: ${data.tracking_number}`);
        setIsModalOpen(false);
        
        // Yorum yapabilmek için sayfayı yenile
        window.location.reload();

    } catch (err: any) {
        alert("Hata: " + err.message);
    }
  };

  // Butona basınca modalı aç
  const openOrderModal = () => {
    if (!token) {
        alert("Sipariş vermek için giriş yapmalısınız.");
        navigate("/login");
        return;
    }
    setIsModalOpen(true);
  };


  // --- YORUM GÖNDERME ---
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        alert("Yorum yapmak için giriş yapmalısınız.");
        navigate("/login");
        return;
    }
    setSubmittingReview(true);
    try {
        const response = await fetch("http://127.0.0.1:8000/reviews/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: Number(id),
                rating: newRating,
                comment: newComment
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Yorum gönderilemedi.");
        }
        
        alert("Yorumunuz başarıyla eklendi!");
        setNewComment("");
        setNewRating(5);
        window.location.reload();

    } catch (err: any) {
        alert(err.message);
    } finally {
        setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
    ));
  };


  if (loading) return <div className="flex justify-center py-20">Yükleniyor...</div>;
  if (error || !product) return <div className="text-center py-20 text-red-600">Hata: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* --- ÜST KISIM --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        
        {/* SOL: Resimler */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative group">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
               onError={(e) => {(e.target as HTMLImageElement).src = "https://via.placeholder.com/500?text=Resim+Yok"}}/>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {images.map((img, index) => (
              <button key={index} onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-rose-600 shadow-md scale-95' : 'border-transparent hover:border-rose-300 opacity-70 hover:opacity-100'}`}>
                <img src={img} alt={`Görünüm ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* SAĞ: Bilgiler */}
        <div className="flex flex-col justify-center animate-in fade-in slide-in-from-right-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-6">
              <div className="flex">{renderStars(5)}</div>
              <span className="text-sm text-gray-500">({reviews.length} Değerlendirme)</span>
          </div>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">{product.description}</p>
          
          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-extrabold text-rose-600">{product.price} ₺</span>
          </div>

          <div className="flex gap-4">
            {/* 👇 BURASI ARTIK MODALI AÇIYOR 👇 */}
            <button 
              onClick={openOrderModal}
              className="flex-1 bg-rose-600 text-white py-4 px-6 rounded-full font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-1"
            >
              <ShoppingCart /> Hemen Satın Al
            </button>
          </div>
          
          <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 border-t pt-6">
            <div className="flex items-center gap-1"><Clock size={16}/> Aynı Gün Teslimat</div>
            <div className="flex items-center gap-1"><PackageCheck size={16}/> Güvenli Ödeme</div>
          </div>
        </div>
      </div>


      {/* --- ALT KISIM: YORUMLAR --- */}
      <div className="bg-gray-50 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Star className="fill-rose-600 text-rose-600"/> Ürün Değerlendirmeleri
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            <div className="lg:col-span-3 space-y-8">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-rose-100 p-2 rounded-full text-rose-600"><User size={20}/></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.user?.full_name || 'Anonim Kullanıcı'}</h4>
                                        <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>
                                <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                            <p className="text-gray-600 italic">"{review.comment}"</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <AlertCircle className="mx-auto text-gray-400 mb-2" size={32}/>
                        <p className="text-gray-500 font-medium">Henüz yorum yapılmamış.</p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-rose-100 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Yorum Yap</h3>
                    
                    {!token ? (
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <p className="text-gray-600 mb-4">Yorum yapmak için giriş yapmalısınız.</p>
                            <button onClick={() => navigate('/login')} className="text-rose-600 font-bold hover:underline">Giriş Yap</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Puanınız</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onClick={() => setNewRating(star)}
                                            className={`transition-transform hover:scale-110 ${newRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                                            <Star size={28} className={newRating >= star ? 'fill-yellow-400' : ''}/>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yorumunuz</label>
                                <textarea rows={4} required placeholder="Bu çiçek hakkında ne düşünüyorsunuz?"
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none transition-all"
                                    value={newComment} onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>

                            <button type="submit" disabled={submittingReview}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2">
                                {submittingReview ? 'Gönderiliyor...' : <><Send size={18}/> Yorumu Gönder</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MODAL EN SONDA */}
      {product && (
        <OrderWizardModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            productPrice={product.price}
            productName={product.name}
            onConfirmOrder={handleConfirmOrder}
        />
      )}
    </div>
  );
};

export default ProductDetail;