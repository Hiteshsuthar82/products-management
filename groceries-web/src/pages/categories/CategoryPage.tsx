import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Product, Category } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  useEffect(() => {
    // Fetch products when subcategory changes (but not on initial load)
    if (category && !loading && selectedSubcategory && subcategories.length > 0) {
      fetchProducts(selectedSubcategory.slug);
    }
  }, [selectedSubcategory]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const catData = await apiService.post<Category>(API_CONSTANTS.CATEGORIES.DETAIL, {
        slug,
        includeChildren: true,
      });

      setCategory(catData);
      const children = catData.children || [];
      setSubcategories(children);

      // Auto-select first child if children exist
      if (children.length > 0) {
        setSelectedSubcategory(children[0]);
        // Fetch products for first child
        const productsData = await apiService.post<{ products: Product[] }>(
          API_CONSTANTS.PRODUCTS.CATEGORY,
          {
            category: children[0].slug,
            page: 1,
            limit: 100,
            userId: user?.id,
          }
        );
        setProducts(productsData.products || []);
      } else {
        setSelectedSubcategory(null);
        // No subcategories, fetch products for parent category
        const productsData = await apiService.post<{ products: Product[] }>(
          API_CONSTANTS.PRODUCTS.CATEGORY,
          {
            category: slug!,
            page: 1,
            limit: 100,
            userId: user?.id,
          }
        );
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load category',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categorySlug: string) => {
    try {
      setProductsLoading(true);
      const productsData = await apiService.post<{ products: Product[] }>(
        API_CONSTANTS.PRODUCTS.CATEGORY,
        {
          category: categorySlug,
          page: 1,
          limit: 100,
          userId: user?.id,
        }
      );
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategory: Category) => {
    setSelectedSubcategory(subcategory);
  };

  if (loading) {
    return (
      <div className="container-mobile py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-mobile py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Category not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-mobile py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
        {subcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {subcategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() => handleSubcategoryClick(sub)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  'hover:scale-105 active:scale-95',
                  selectedSubcategory?._id === sub._id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Section */}
      {productsLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product._id} to={`/products/${product._id}`}>
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={product.images[0]?.url || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">₹{Number(product.price).toFixed(2)}</span>
                  </div>
                  <Button size="sm" className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found in this category</p>
        </div>
      )}
    </div>
  );
}
