import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductListing from './pages/ProductListing'; // Yeni eklediğimiz sayfa

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
        
        {/* Header her sayfada sabit */}
        <Header />

        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            {/* Anasayfa (Sabit Vitrin) */}
            <Route path="/" element={<Home />} />
            
            {/* Giriş Yap Sayfası */}
            <Route path="/login" element={<Login />} />
            
            {/* Ürün Listeleme & Arama Sonuçları Sayfası */}
            <Route path="/products" element={<ProductListing />} />
          </Routes>
        </main>

        {/* Footer her sayfada sabit */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;

  