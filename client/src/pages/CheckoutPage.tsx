import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Tag, ChevronRight, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface ShippingForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const CheckoutPage = () => {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState<ShippingForm>({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const subtotal = total();
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping + tax - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderTotal: subtotal,
      });
      setDiscount(data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You save ₹${data.discount}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const payload = {
        items: items.map(i => ({
          product: typeof i.product === 'string' ? i.product : i.product,
          name: i.name,
          image: i.image,
          price: i.price,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
        shippingAddress: { ...address, isDefault: false },
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: grandTotal,
        discountAmount: discount,
        couponCode: couponApplied ? couponCode : undefined,
        paymentMethod: 'cod',
      };
      const { data } = await api.post('/orders', payload);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order/confirm/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const inputField = (
    label: string,
    key: keyof ShippingForm,
    placeholder?: string,
    half?: boolean,
  ) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input
        value={address[key]}
        onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
        className="input-base"
        placeholder={placeholder || label}
        required
      />
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {(['address', 'payment'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s ? 'bg-brand-500 text-white' :
                (step === 'payment' && s === 'address') ? 'bg-green-500 text-white' :
                  'bg-surface-2 text-gray-400'
                }`}>
                {step === 'payment' && s === 'address' ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium capitalize ${step === s ? 'text-white' : 'text-gray-500'}`}>{s}</span>
              {i === 0 && <ChevronRight size={16} className="text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left panel */}
          <div className="lg:col-span-2">
            {step === 'address' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={20} className="text-brand-400" />
                  <h2 className="text-lg font-bold text-white">Shipping Address</h2>
                </div>
                <form
                  onSubmit={e => { e.preventDefault(); setStep('payment'); }}
                  className="grid grid-cols-2 gap-4"
                >
                  {inputField('Full Name', 'fullName', 'John Doe')}
                  {inputField('Phone Number', 'phone', '+91 9999999999')}
                  {inputField('Street Address', 'street', '123 Main Street')}
                  {inputField('City', 'city', 'Mumbai', true)}
                  {inputField('State', 'state', 'Maharashtra', true)}
                  {inputField('Postal Code', 'postalCode', '400001', true)}
                  {inputField('Country', 'country', 'India', true)}
                  <div className="col-span-2 mt-2">
                    <button type="submit" className="btn-primary py-3 px-8">
                      Continue to Payment <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Address review */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-brand-400" />
                      <span className="text-sm font-medium text-white">Delivery to</span>
                    </div>
                    <button
                      onClick={() => setStep('address')}
                      className="text-xs text-brand-400 hover:text-brand-300"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-gray-300">{address.fullName}</p>
                  <p className="text-xs text-gray-400 mt-1">{address.street}, {address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-xs text-gray-400">{address.phone}</p>
                </div>

                {/* Payment */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-brand-400" />
                    <h2 className="text-base font-bold text-white">Payment</h2>
                  </div>
                  <div className="glass rounded-xl p-4 flex items-center gap-3 border border-brand-500/30">
                    <div className="w-3 h-3 rounded-full bg-brand-500 ring-2 ring-brand-500/30" />
                    <div>
                      <p className="text-sm font-medium text-white">Cash on Delivery</p>
                      <p className="text-xs text-gray-400">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-5 sticky top-24 space-y-4">
              <h2 className="font-bold text-white text-base">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-14 rounded-lg object-cover bg-surface-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                      <p className="text-xs text-brand-400 font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {!couponApplied ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="input-icon-left text-gray-500" />
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="input-base pl-8 text-sm py-2"
                      placeholder="COUPON CODE"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={validatingCoupon}
                    className="btn-outline py-2 px-4 text-sm flex-shrink-0"
                  >
                    {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <span className="text-green-400 font-medium">{couponCode} applied</span>
                  <span className="text-green-400">−₹{discount}</span>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (5%)</span><span className="text-white">₹{tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span><span>−₹{discount}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                  <span>Total</span><span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {step === 'payment' && (
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="btn-primary w-full justify-center py-3"
                >
                  {placing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Placing order...
                    </span>
                  ) : (
                    <>Place Order · ₹{grandTotal.toLocaleString()}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
