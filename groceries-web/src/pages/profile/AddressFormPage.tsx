import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Address } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  landmark: z.string().optional(),
  addressType: z.enum(['home', 'work', 'other']).optional(),
  isDefault: z.boolean().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function AddressFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressType: 'home',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (id) {
      setIsEditMode(true);
      fetchAddress();
    }
  }, [id, isAuthenticated]);

  const fetchAddress = async () => {
    try {
      const address = await apiService.post<Address>(API_CONSTANTS.ADDRESS.DETAIL, {
        addressId: id,
      });
      setValue('name', address.name);
      setValue('phone', address.phone);
      setValue('address', address.address);
      setValue('city', address.city);
      setValue('state', address.state);
      setValue('postalCode', address.postalCode);
      setValue('landmark', address.landmark || '');
      setValue('addressType', address.addressType || 'home');
      setValue('isDefault', address.isDefault || false);
    } catch (error) {
      console.error('Error fetching address:', error);
      toast({
        title: 'Error',
        description: 'Failed to load address',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: AddressForm) => {
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        await apiService.post(API_CONSTANTS.ADDRESS.UPDATE, {
          addressId: id,
          ...data,
        });
        toast({
          title: 'Success',
          description: 'Address updated successfully',
        });
      } else {
        await apiService.post(API_CONSTANTS.ADDRESS.ADD, data);
        toast({
          title: 'Success',
          description: 'Address added successfully',
        });
      }
      
      navigate('/addresses');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-mobile py-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/addresses')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Addresses
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditMode ? 'Edit Address' : 'Add New Address'}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update your delivery address'
              : 'Add a new delivery address'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium mb-2 block">
                Full Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Phone Number *
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                {...register('phone')}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  e.target.value = value;
                  register('phone').onChange(e);
                }}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="text-sm font-medium mb-2 block">
                Address *
              </label>
              <Input
                id="address"
                type="text"
                placeholder="House/Flat No., Building, Street"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="text-sm font-medium mb-2 block">
                  City *
                </label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="text-sm font-medium mb-2 block">
                  State *
                </label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State"
                  {...register('state')}
                />
                {errors.state && (
                  <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="postalCode" className="text-sm font-medium mb-2 block">
                Postal Code *
              </label>
              <Input
                id="postalCode"
                type="text"
                placeholder="123456"
                maxLength={10}
                {...register('postalCode')}
              />
              {errors.postalCode && (
                <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="landmark" className="text-sm font-medium mb-2 block">
                Landmark (Optional)
              </label>
              <Input
                id="landmark"
                type="text"
                placeholder="Near landmark"
                {...register('landmark')}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Address Type</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="home"
                    {...register('addressType')}
                    defaultChecked
                    className="w-4 h-4"
                  />
                  <span>Home</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="work"
                    {...register('addressType')}
                    className="w-4 h-4"
                  />
                  <span>Work</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="other"
                    {...register('addressType')}
                    className="w-4 h-4"
                  />
                  <span>Other</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                {...register('isDefault')}
                className="w-4 h-4"
              />
              <label htmlFor="isDefault" className="text-sm">
                Set as default address
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/addresses')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading
                  ? isEditMode
                    ? 'Updating...'
                    : 'Adding...'
                  : isEditMode
                  ? 'Update Address'
                  : 'Add Address'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

