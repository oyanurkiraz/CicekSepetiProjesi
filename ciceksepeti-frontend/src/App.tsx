import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Sayfa Importları
import Favorites from './pages/Favorites';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import OrderTracking from './pages/OrderTracking';
import MyOrders from './pages/MyOrders';
import VendorDashboard from "./pages/VendorDashboard";
import Cart from './pages/Cart';


const App = () => {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Header />
          <Routes>
            {/* Anasayfa */}
            <Route path="/" element={<Home />} />

            {/* Auth İşlemleri */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Ürün İşlemleri */}
            <Route path="/products" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Sipariş İşlemleri */}
            <Route path="/track" element={<OrderTracking />} />

            {/* Kullanıcı Sayfaları */}
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/vendor" element={<VendorDashboard />} />

          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;