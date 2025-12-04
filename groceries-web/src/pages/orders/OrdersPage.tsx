import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.post<{ orders: Order[] }>(
        API_CONSTANTS.ORDERS.LIST,
        {
          page: 1,
          limit: 20,
        }
      );
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-mobile py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-mobile py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link to="/">
              <button className="text-primary hover:underline">Start Shopping</button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-mobile py-4 space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.map((order) => (
        <Link key={order._id} to={`/orders/${order._id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">Order #{order.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{Number(order.pricing.totalPrice).toFixed(2)}</div>
                  <div className="text-sm capitalize">{order.orderStatus}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {order.items.length} item(s)
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

