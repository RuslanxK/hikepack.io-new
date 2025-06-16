import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const API_URL = 'http://localhost:5000/api/products';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [activeIndexes, setActiveIndexes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<{ data: Product[] }>(API_URL);
        setProducts(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePrevImage = (id: string) => {
    const product = products.find((p) => p.id === id);
    const imageCount = product?.images?.length ?? 0;

    setActiveIndexes((prev) => {
      const currentIndex = prev[id] || 0;
      const newIndex = imageCount > 0
        ? (currentIndex === 0 ? imageCount - 1 : currentIndex - 1)
        : 0;

      return {
        ...prev,
        [id]: newIndex,
      };
    });
  };

  const handleNextImage = (id: string) => {
    const product = products.find((p) => p.id === id);
    const imageCount = product?.images?.length ?? 0;

    setActiveIndexes((prev) => {
      const currentIndex = prev[id] || 0;
      const newIndex = imageCount > 0
        ? (currentIndex === imageCount - 1 ? 0 : currentIndex + 1)
        : 0;

      return {
        ...prev,
        [id]: newIndex,
      };
    });
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Loading products...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-900">
        Express Your Style with Outdoor-Inspired Prints
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const currentImageIndex = activeIndexes[product.id] || 0;
          const images = product.images || [];
          const defaultVariant = product.variants[0];

          return (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer text-sm w-full max-w-[320px] mx-auto"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative w-full h-52 sm:h-56 bg-gray-50 overflow-hidden">
                <img
                  src={images[currentImageIndex]?.src || 'https://via.placeholder.com/400'}
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage(product.id);
                      }}
                      className="absolute top-1/2 left-2 -translate-y-1/2 bg-white border border-gray-300 hover:bg-gray-100 text-black w-7 h-7 flex items-center justify-center shadow-sm z-10 rounded-full"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage(product.id);
                      }}
                      className="absolute top-1/2 right-2 -translate-y-1/2 bg-white border border-gray-300 hover:bg-gray-100 text-black w-7 h-7 flex items-center justify-center shadow-sm z-10 rounded-full"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-gray-900 truncate">
                    {truncate(product.title, 30)}
                  </h2>
                  <p className="text-sm text-gray-600 truncate">
                    {truncate(stripHtml(product.description), 40)}
                  </p>
                </div>

                {defaultVariant && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
                    <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-md">
                      ${(defaultVariant.price / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                      className="text-sm font-medium border border-gray-300 text-gray-700 px-3 py-1.5 rounded-3xl hover:bg-gray-100 transition"
                    >
                      View Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const stripHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const truncate = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export default ProductList;
