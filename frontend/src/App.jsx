import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ecom_user')) || null);
  const [token, setToken] = useState(localStorage.getItem('ecom_token') || '');
  const [isRegister, setIsRegister] = useState(false);

  // Auth form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Shop states
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('products'); // 'products' | 'cart' | 'orders'

  useEffect(() => {
    fetchProducts();
    seedProducts();
  }, []);

  useEffect(() => {
    if (token && view === 'orders') {
      fetchOrders();
    }
  }, [token, view]);

  const seedProducts = async () => {
    try { await axios.get(`${API_URL}/products/seed`); fetchProducts(); } catch (err) {}
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      if (isRegister) {
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('ecom_user', JSON.stringify(res.data.user));
        localStorage.setItem('ecom_token', res.data.token);
      }
    } catch (err) { alert(err.response?.data?.message || 'Auth error'); }
  };

  const handleLogout = () => {
    setUser(null); setToken(''); setCart([]); setOrders([]);
    localStorage.removeItem('ecom_user'); localStorage.removeItem('ecom_token');
  };

  const addToCart = (product) => {
    const existing = cart.find(i => i.product === product._id);
    if (existing) {
      setCart(cart.map(i => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { product: product._id, name: product.name, price: product.price, quantity: 1, image: product.image }]);
    }
  };

  const checkout = async () => {
    if (!token) return alert('Please login to checkout!');
    if (cart.length === 0) return alert('Your cart is empty!');
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      await axios.post(`${API_URL}/orders`, { orderItems: cart, totalPrice }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order placed successfully!');
      setCart([]);
      setView('orders');
    } catch (err) { alert('Checkout failed'); }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      <header style={{ maxWidth: '1100px', margin: '0 auto 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '15px 25px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>ShopSphere E-Commerce</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setView('products')} style={{ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: view === 'products' ? 'bold' : 'normal' }}>Products</button>
          <button onClick={() => setView('cart')} style={{ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: view === 'cart' ? 'bold' : 'normal' }}>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</button>
          {token && <button onClick={() => setView('orders')} style={{ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: view === 'orders' ? 'bold' : 'normal' }}>My Orders</button>}
          {token ? (
            <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
          ) : (
            <button onClick={() => setView('auth')} style={{ padding: '6px 12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Login</button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {view === 'auth' && !token && (
          <div style={{ maxWidth: '400px', margin: '40px auto', backgroundColor: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            <h3>{isRegister ? 'Register Account' : 'Account Login'}</h3>
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              {isRegister && <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />}
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <button type="submit" style={{ padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isRegister ? 'Sign Up' : 'Log In'}</button>
            </form>
            <p style={{ fontSize: '0.85rem', marginTop: '15px', color: '#64748b', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>{isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}</p>
          </div>
        )}

        {view === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map(p => (
              <div key={p._id} style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', padding: '15px' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }} />
                <h4 style={{ margin: '10px 0 5px' }}>{p.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>${p.price}</span>
                  <button onClick={() => addToCart(p)} style={{ padding: '8px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'cart' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h3>Shopping Cart</h3>
            {cart.length > 0 ? (
              <div>
                {cart.map(item => (
                  <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{item.name}</h4>
                      <p style={{ margin: 0, color: '#64748b' }}>${item.price} x {item.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>${item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #e2e8f0' }}>
                  <h4>Total Amount:</h4>
                  <h4>${cartTotal}</h4>
                </div>
                <button onClick={checkout} style={{ width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' }}>Proceed to Checkout</button>
              </div>
            ) : <p>Your cart is empty.</p>}
          </div>
        )}

        {view === 'orders' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h3>Order History</h3>
            {orders.length > 0 ? orders.map(o => (
              <div key={o._id} style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Order ID: {o._id} | Date: {new Date(o.createdAt).toLocaleDateString()}</p>
                <div>
                  {o.orderItems.map(item => (
                    <div key={item.product} style={{ fontSize: '0.9rem' }}>• {item.name} (x{item.quantity}) — ${item.price * item.quantity}</div>
                  ))}
                </div>
                <h4 style={{ margin: '10px 0 0', color: '#4f46e5' }}>Total Paid: ${o.totalPrice}</h4>
              </div>
            )) : <p>No orders placed yet.</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;