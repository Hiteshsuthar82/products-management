import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Product, Category } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { useCartStore } from '@/store/cart.store';
import { FullPageLoader } from '@/components/common/FullPageLoader';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const { updateCartCount } = useCartStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [featured, newProds, cats] = await Promise.all([
        apiService.post<{ products: Product[] }>(API_CONSTANTS.PRODUCTS.FEATURED, {
          limit: 8,
          userId: user?.id,
        }),
        apiService.post<{ products: Product[] }>(API_CONSTANTS.PRODUCTS.NEW, {
          limit: 8,
          userId: user?.id,
        }),
        apiService.post<{ categories: Category[] }>(API_CONSTANTS.CATEGORIES.PARENTS, {
          isActive: true,
        }),
      ]);

      setFeaturedProducts(featured.products || []);
      setNewProducts(newProds.products || []);
      setCategories(cats.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to cart',
      });
      return;
    }

    try {
      await apiService.post(API_CONSTANTS.CART.ADD, {
        productId: product._id,
        quantity: 1,
        price: product.price,
      });
      toast({
        title: 'Success',
        description: 'Product added to cart',
      });
      // Update cart count
      const cart = await apiService.post(API_CONSTANTS.CART.COUNT, {});
      updateCartCount(cart.count || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <FullPageLoader message="Loading store..." />;
  }

  return (
    <div className="container-mobile py-4 space-y-8">
      {/* Categories Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/categories/${category.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  {category.icon && (
                    <div className="text-4xl mb-2">{category.icon}</div>
                  )}
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Link to="/products?featured=true">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* New Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Arrivals</h2>
          <Link to="/products?sort=newest">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {newProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add favorites',
        variant: 'destructive',
      });
      return;
    }

    if (isToggling) return;

    try {
      setIsToggling(true);
      const previousState = isFavorite;
      
      // Optimistic update
      setIsFavorite(!isFavorite);

      // Call API to toggle favorite
      const response = await apiService.post<{ isFavorite: boolean }>(
        API_CONSTANTS.FAVORITES.TOGGLE,
        { productId: product._id }
      );

      // Update state based on API response
      setIsFavorite(response.isFavorite);
      
      toast({
        title: response.isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
        description: response.isFavorite
          ? 'Product added to your favorites'
          : 'Product removed from your favorites',
      });
    } catch (error: any) {
      // Revert optimistic update on error
      setIsFavorite(previousState);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorite',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`}>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <div className="relative">
          <img
            src={product.images[0]?.url || '/placeholder.png'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {isAuthenticated && (
            <button
              onClick={handleToggleFavorite}
              className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background"
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`}
              />
            </button>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-lg font-bold">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

