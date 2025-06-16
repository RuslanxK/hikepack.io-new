import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CartItem {
  product_id: string;
  variant_id: number;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

const steps = ['Shopping Bag', 'Shipping Info', 'Payment'];

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'US',
    region: '',
    city: '',
    address1: '',
    zip: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const updateQuantity = (index: number, qty: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = qty;
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = `${key.replace('_', ' ')} is required.`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    if (!validateForm()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/checkout/create-order', {
        external_id: 'custom-order-001',
        label: 'Order from Hikepack',
        shipping_method: 1,
        send_shipping_notification: true,
        address_to: form,
        line_items: cart.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity
        }))
      });

      alert('Order created successfully!');
      localStorage.removeItem('cart');
      navigate('/');
    } catch (err: any) {
      alert('Failed to place order: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 sm:p-6">
      <h1 className="text-4xl font-bold mb-10 text-center">Checkout</h1>

      <div className="flex items-center justify-center mb-10 gap-2">
        {steps.map((s, idx) => (
          <div key={idx} className="flex-1 flex items-center gap-2">
            <div
              className={`w-full text-center py-2 rounded-full text-sm font-semibold transition duration-200 tracking-wide ${
                idx === step
                  ? 'bg-primary text-white shadow'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s}
            </div>
            {idx < steps.length - 1 && <div className="w-3 h-3 bg-gray-300 rounded-full" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center">Your cart is empty.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 mb-10">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border w-full">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full md:w-48 h-40 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                        {item.title}
                      </h2>
                      <div className="flex items-center gap-2 mb-2">
                        <label htmlFor={`qty-${idx}`} className="text-sm text-gray-600">Qty:</label>
                        <input
                          id={`qty-${idx}`}
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <p className="text-lg font-bold text-gray-800 mb-2">
                        ${(item.price / 100).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                className="w-full sm:w-auto bg-primary text-white px-10 py-3 rounded-md font-semibold  hover:bg-opacity-90 transition"
              >
                Continue to Shipping
              </button>
            </div>
          )}
        </>
      )}

      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-semibold mb-8">Shipping Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.keys(form).map((key) => (
              <div key={key} className="flex flex-col">
                <label htmlFor={key} className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace('_', ' ')}
                </label>
                <input
                  id={key}
                  name={key}
                  value={(form as any)[key]}
                  placeholder={key.replace('_', ' ')}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={`border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                    errors[key]
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-primary'
                  }`}
                />
                {errors[key] && <span className="text-xs text-red-500 mt-1">{errors[key]}</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10">
            <button
              onClick={() => setStep(0)}
              className="text-sm text-gray-600 underline"
            >
              ← Back to Cart
            </button>
            <button
              onClick={() => validateForm() && setStep(2)}
              className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-opacity-90 transition"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white shadow-lg p-8 rounded-2xl">
          <h2 className="text-3xl font-semibold mb-6">Payment</h2>
          <p className="text-sm text-gray-500 mb-6">(Payment integration coming soon...)</p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 underline"
            >
              ← Back to Shipping
            </button>
            <button
              onClick={handleOrder}
              className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-opacity-90 transition"
            >
              Place Order (${(total / 100).toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
