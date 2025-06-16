// components/CartPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProductImage {
  src: string;
}

interface ProductVariant {
  id: number;
  title: string;
  price: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  images: ProductImage[];
  tags: string[];
  variants: ProductVariant[];
}

interface CartItem {
  product_id: string;
  variant_id: number;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<{ data: Product[] }>('http://localhost:5000/api/products');
        const found = response.data.data.find((p) => p.id === id);
        if (!found) {
          setError('Product not found');
        } else {
          setProduct(found);
          setSelectedVariant(found.variants[0]?.id || null);
        }
      } catch {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || selectedVariant === null) {
      alert('Please select a size');
      return;
    }

    const variant = product.variants.find((v) => v.id === selectedVariant);
    if (!variant) return;

    const existingCart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem: CartItem = {
      product_id: product.id,
      variant_id: variant.id,
      title: `${product.title} (${variant.title})`,
      image: product.images[0]?.src || '',
      quantity,
      price: variant.price,
    };

    const updatedCart = [...existingCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    alert('Added to cart!');
    navigate('/cart');
  };

  const handleNavigateBack = () => {
    navigate(-1);
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
  if (!product) return null;

  const selectedVariantData = product.variants.find((v) => v.id === selectedVariant);

  return (
    <div className="mx-auto px-4 md:px-6 pb-16">
      <div className="bg-white dark:bg-dark-box border rounded-lg p-4 mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNavigateBack}
          className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-nav dark:bg-dark"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-800 truncate">
          {product.title}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div>
          <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-white border rounded-xl overflow-hidden flex items-center justify-center mb-4">
            <img
              src={product.images?.[selectedImage]?.src || 'https://via.placeholder.com/500'}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img.src}
                alt={`thumb-${index}`}
                onClick={() => setSelectedImage(index)}
                className={`min-w-[60px] h-[60px] md:min-w-[70px] md:h-[70px] border rounded-lg object-contain cursor-pointer transition ${
                  selectedImage === index ? 'border-primary' : 'border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className='border rounded-xl bg-white p-5 md:p-10'>
          <p className="text-gray-700 text-sm mb-6 leading-relaxed">
            {stripHtml(product.description)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-base font-semibold mb-2 text-gray-700">Size</label>
              <select
                value={selectedVariant || ''}
                onChange={(e) => setSelectedVariant(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-1/2">
              <label className="block text-base font-semibold mb-2 text-gray-700">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {selectedVariantData && (
            <div className="mb-6">
              <div className="text-2xl font-bold text-gray-900">
                ${ (selectedVariantData.price / 100).toFixed(2) }
              </div>
              <p className="text-sm text-gray-500">Including taxes</p>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-lg py-4 rounded-lg shadow-md transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const stripHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export default ProductPage;