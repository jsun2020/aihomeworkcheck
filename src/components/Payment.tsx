import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../utils/i18n';
import { UsageTracker } from '../utils/usageTracker';
import './Payment.css';

interface User {
  id: string;
  username: string;
}

interface PaymentProps {
  user: User;
  onLogout: () => void;
  onPaymentSuccess: () => void;
}

interface PricingPlan {
  id: string;
  name: string;
  calls: number;
  price: number;
  popular: boolean;
}

const Payment: React.FC<PaymentProps> = ({ user, onLogout, onPaymentSuccess }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'zh-CN' | 'en-US'>('en-US');

  useEffect(() => {
    const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCurrentLanguage(settings.language || 'en-US');
    }
  }, [user.id]);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'basic',
      name: t('payment.basicPlan', currentLanguage),
      calls: 50,
      price: 9.90,
      popular: false
    },
    {
      id: 'standard',
      name: t('payment.standardPlan', currentLanguage),
      calls: 200,
      price: 29.90,
      popular: true
    },
    {
      id: 'premium',
      name: t('payment.premiumPlan', currentLanguage),
      calls: 500,
      price: 59.90,
      popular: false
    }
  ];

  const handlePayment = async () => {
    if (!selectedPlan) {
      alert(t('payment.selectPlan', currentLanguage));
      return;
    }

    setIsProcessing(true);

    try {
      const plan = pricingPlans.find(p => p.id === selectedPlan);
      if (!plan) return;

      // Simulate payment processing
      const paymentData = {
        userId: user.id,
        planId: selectedPlan,
        amount: plan.price,
        method: paymentMethod,
        timestamp: Date.now()
      };

      // In a real implementation, you would integrate with actual Alipay/WeChatPay APIs
      if (paymentMethod === 'alipay') {
        await simulateAlipayPayment(paymentData);
      } else {
        await simulateWechatPayment(paymentData);
      }

      // Add the purchased calls to user's account
      UsageTracker.addCalls(user.id, plan.calls);
      
      // Save payment record
      const paymentHistory = JSON.parse(localStorage.getItem(`payments_${user.id}`) || '[]');
      paymentHistory.push({
        ...paymentData,
        status: 'completed',
        calls: plan.calls
      });
      localStorage.setItem(`payments_${user.id}`, JSON.stringify(paymentHistory));

      alert(t('payment.success', currentLanguage));
      onPaymentSuccess();
      navigate('/upload');

    } catch (error) {
      console.error('Payment failed:', error);
      alert(t('payment.failed', currentLanguage));
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateAlipayPayment = async (data: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% success rate for simulation
        if (Math.random() > 0.1) {
          resolve(data);
        } else {
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  };

  const simulateWechatPayment = async (data: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% success rate for simulation
        if (Math.random() > 0.1) {
          resolve(data);
        } else {
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  };

  const remainingUsage = UsageTracker.getRemainingUsage(user.id);

  return (
    <div className="payment-container">
      <header className="payment-header">
        <h1>{t('payment.title', currentLanguage)}</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/upload')} className="back-button">
            ← {t('header.backToUpload', currentLanguage)}
          </button>
          <div className="user-info">
            <span>{t('header.welcome', currentLanguage)}, {user.username}</span>
            <button onClick={onLogout} className="logout-button">{t('header.logout', currentLanguage)}</button>
          </div>
        </div>
      </header>

      <main className="payment-main">
        <div className="usage-status">
          <h2>📊 {t('payment.currentUsage', currentLanguage)}</h2>
          <p className="usage-info">
            {t('payment.remainingCalls', currentLanguage)}: <strong>{remainingUsage}</strong>
          </p>
          {remainingUsage === 0 && (
            <p className="upgrade-notice">
              {t('payment.upgradeRequired', currentLanguage)}
            </p>
          )}
        </div>

        <div className="pricing-section">
          <h2>💰 {t('payment.choosePlan', currentLanguage)}</h2>
          <div className="pricing-cards">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`pricing-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    {t('payment.popular', currentLanguage)}
                  </div>
                )}
                <h3>{plan.name}</h3>
                <div className="price">¥{plan.price}</div>
                <div className="calls">{plan.calls} {t('payment.calls', currentLanguage)}</div>
                <div className="unit-price">
                  ≈ ¥{(plan.price / plan.calls).toFixed(2)} {t('payment.perCall', currentLanguage)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-method-section">
          <h2>💳 {t('payment.paymentMethod', currentLanguage)}</h2>
          <div className="payment-methods">
            <label className={`payment-method ${paymentMethod === 'alipay' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="alipay"
                checked={paymentMethod === 'alipay'}
                onChange={() => setPaymentMethod('alipay')}
              />
              <div className="method-info">
                <span className="method-icon">📱</span>
                <span className="method-name">{t('payment.alipay', currentLanguage)}</span>
              </div>
            </label>
            <label className={`payment-method ${paymentMethod === 'wechat' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="wechat"
                checked={paymentMethod === 'wechat'}
                onChange={() => setPaymentMethod('wechat')}
              />
              <div className="method-info">
                <span className="method-icon">💬</span>
                <span className="method-name">{t('payment.wechatPay', currentLanguage)}</span>
              </div>
            </label>
          </div>
        </div>

        <div className="payment-actions">
          <button
            onClick={handlePayment}
            disabled={!selectedPlan || isProcessing}
            className="pay-button"
          >
            {isProcessing ? (
              <>
                <div className="spinner"></div>
                {t('payment.processing', currentLanguage)}
              </>
            ) : (
              <>
                {selectedPlan && (
                  <>
                    {t('payment.payNow', currentLanguage)} ¥{pricingPlans.find(p => p.id === selectedPlan)?.price}
                  </>
                )}
                {!selectedPlan && t('payment.selectPlanFirst', currentLanguage)}
              </>
            )}
          </button>
        </div>

        <div className="payment-notice">
          <h3>📋 {t('payment.notice', currentLanguage)}</h3>
          <ul>
            <li>{t('payment.securePayment', currentLanguage)}</li>
            <li>{t('payment.instantActivation', currentLanguage)}</li>
            <li>{t('payment.noExpiry', currentLanguage)}</li>
            <li>{t('payment.support', currentLanguage)}</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Payment;