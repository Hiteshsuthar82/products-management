import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { FullPageLoader } from '@/components/common/FullPageLoader';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await apiService.post<Order>(API_CONSTANTS.ORDERS.DETAIL, {
        orderId: id,
      });
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FullPageLoader message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="container-mobile py-8">
        <div className="text-center">Order not found</div>
      </div>
    );
  }

  return (
    <div className="container-mobile py-4 space-y-4">
      <h1 className="text-2xl font-bold">Order Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>Order #{order.orderNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-medium capitalize">{order.orderStatus}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Date</div>
            <div className="font-medium">
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-4">
              <img
                src={item.image || '/placeholder.png'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  ₹{Number(item.price).toFixed(2)} × {item.quantity} = ₹{(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="font-medium">{order.shippingAddress.name}</div>
            <div className="text-sm text-muted-foreground">
              {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            </div>
            <div className="text-sm text-muted-foreground">
              {order.shippingAddress.phone}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="capitalize">{order.paymentInfo.method}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status</span>
            <span className="capitalize">{order.paymentInfo.status}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{Number(order.pricing.itemsPrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₹{Number(order.pricing.shippingPrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{Number(order.pricing.taxPrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>₹{Number(order.pricing.totalPrice).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

