import React, { useState } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlowerQuiz: React.FC<QuizProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  if (!isOpen) return null;

  // SORULAR VE CEVAPLAR
  const questions = [
    {
      q: "1) Hediyeyi alacağın kişi senin neyin?",
      opts: [
        { key: "a", text: "Sevgilim / Eşim" },
        { key: "b", text: "Anne / Baba" },
        { key: "c", text: "İş arkadaşı" },
        { key: "d", text: "Minnet duyduğun biri" },
        { key: "e", text: "Kutladığın biri" }
      ]
    },
    {
      q: "2) Özel bir etkinlik mi var?",
      opts: [
        { key: "a", text: "Doğum günü" },
        { key: "b", text: "Sevgililer günü / Yıldönümü" },
        { key: "c", text: "İçimden geldi" },
        { key: "d", text: "Yeni bebek" },
        { key: "e", text: "Teşekkür" }
      ]
    },
    {
        q: "3) Çiçek yollayacağın kişi bir renk olsaydı?",
        opts: [
          { key: "a", text: "Mavi" },
          { key: "b", text: "Pembe" },
          { key: "c", text: "Kırmızı" },
          { key: "d", text: "Siyah" },
          { key: "e", text: "Sarı" }
        ]
    },
    {
        q: "4) Çiçek tarzı nasıl olsun?",
        opts: [
          { key: "a", text: "Büyük ve gösterişli" },
          { key: "b", text: "Zarif minimal" },
          { key: "c", text: "Renkli ve enerjik" },
          { key: "d", text: "Modern tasarım" },
          { key: "e", text: "Klasik ve sade" }
        ]
    },
    {
        q: "5) Çiçek ulaşınca alıcının tepkisi nasıl olsun?",
        opts: [
          { key: "a", text: "“Vay be!”" },
          { key: "b", text: "“Ne kadar zarif!”" },
          { key: "c", text: "“Ne kadar tatlı!”" },
          { key: "d", text: "“Ne kadar modern!”" },
          { key: "e", text: "“Ne kadar mutlu oldum”" }
        ]
    }
  ];

  const handleAnswer = (key: string) => {
    const newAnswers = [...answers, key];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // TEST BİTTİ, SONUCU HESAPLA 🧠
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (finalAnswers: string[]) => {
    // Basit Mantık: En çok seçilen şıkkı bul
    const counts: {[key: string]: number} = { a:0, b:0, c:0, d:0, e:0 };
    finalAnswers.forEach(ans => counts[ans]++);
    
    // En yüksek puanı alan şıkkı bul
    const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    // Kategori Eşleşmesi
    let category = "";
    switch(winner) {
        case "a": category = "Aşk Tutku"; break;
        case "b": category = "Zarif"; break;
        case "c": category = "Renkli"; break;
        case "d": category = "Modern"; break;
        case "e": category = "Soft"; break;
        default: category = "Doğum Günü";
    }

    alert(`🎉 Senin için en uygun kategori: ${category}\nŞimdi seni o çiçeklere götürüyoruz!`);
    onClose();
    // Arama sayfasına yönlendir ve o kategoriyi filtrele
    navigate(`/products?category=${category}`);
  };

  const q = questions[currentQ];

  return (
    <div className="fixed inset-0 bg-rose-900/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Süsleme */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} className="text-rose-600"/>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>

        <div className="mb-8">
            <span className="text-rose-600 font-bold tracking-wider text-sm uppercase">Soru {currentQ + 1} / 5</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{q.q}</h2>
        </div>

        <div className="space-y-3">
            {q.opts.map((opt, index) => (
                <button 
                    key={index}
                    onClick={() => handleAnswer(opt.key)}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-rose-500 hover:bg-rose-50 transition-all flex justify-between group"
                >
                    <span className="font-medium text-gray-700 group-hover:text-rose-700">{opt.text}</span>
                    <ArrowRight className="text-gray-300 group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </button>
            ))}
        </div>

        {/* İlerleme Çubuğu */}
        <div className="mt-8 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-rose-500 transition-all duration-500 ease-out" 
                style={{ width: `${((currentQ + 1) / 5) * 100}%` }}
            ></div>
        </div>

      </div>
    </div>
  );
};

export default FlowerQuiz;