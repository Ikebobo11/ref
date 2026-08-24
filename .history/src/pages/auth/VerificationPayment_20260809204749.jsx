/**
 * LETCON - Verification Payment Page
 * Handles the ₦1,000 non-refundable verification fee payment via Paystack.
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCreditCard, FaShieldHalved, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { FEES, CURRENCY_SYMBOL } from '../../config/constants';
import { createCheckoutHandler } from '../../services/paystackService';
import { updateDocument, getDocument } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

/**
 * Verification payment page component.
 */
export default function VerificationPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const { reference, email } = location.state || {};

  /**
   * Handles successful payment.
   * @param {Object} response - Paystack response.
   */
  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
      // Update the verification request to mark fee as paid
      const verificationRequests = await getDocument(COLLECTIONS.VERIFICATION_REQUESTS, reference);
      if (verificationRequests) {
        await updateDocument(COLLECTIONS.VERIFICATION_REQUESTS, reference, {
          feePaid: true,
          feePaidAt: new Date(),
          paystackReference: response.reference,
        });
      }

      // Update the transaction status
      await updateDocument(COLLECTIONS.TRANSACTIONS, reference, {
        status: 'success',
        paidAt: new Date(),
        paystackReference: response.reference,
      });

      setPaid(true);
      toast.success('Verification fee paid successfully!');
    } catch (error) {
      toast.error('Payment recorded but there was an error updating your account. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the Paystack checkout.
   */
  const handlePay = () => {
    const handler = createCheckoutHandler({
      email,
      amount: FEES.VERIFICATION_FEE,
      reference,
      onSuccess: handlePaymentSuccess,
      onCancel: () => toast.error('Payment cancelled. You can retry anytime.'),
    });
    handler();
  };

  return (
    <div className="auth-form">
      <div className="auth-form-mobile-logo">
        <Logo />
      </div>

      {!paid ? (
        <>
          <h2 className="auth-form-title">Verification Fee</h2>
          <p className="auth-form-subtitle">
            Pay the non-refundable verification fee to complete your registration.
          </p>

          <div className="payment-summary">
            <div className="payment-amount">
              <span className="payment-amount-label">Verification Fee</span>
              <span className="payment-amount-value">
                {CURRENCY_SYMBOL}{FEES.VERIFICATION_FEE.toLocaleString()}
              </span>
            </div>
            <div className="payment-details">
              <p>
                <FaShieldHalved /> This fee is <strong>NON-REFUNDABLE</strong>
              </p>
              <p>
                <FaCircleCheck /> Your account will be reviewed by an admin
              </p>
              <p>
                <FaCircleXmark /> Fake or bought followers will be rejected
              </p>
            </div>
          </div>

          <Button onClick={handlePay} fullWidth loading={loading}>
            <FaCreditCard /> Pay {CURRENCY_SYMBOL}{FEES.VERIFICATION_FEE.toLocaleString()} Now
          </Button>

          <div className="auth-form-divider">
            <span>Payment is processed securely by Paystack</span>
          </div>

          <div className="auth-form-actions">
            <Link to="/login" className="auth-action-btn">
              Skip for now - Sign In Later
            </Link>
          </div>
        </>
      ) : (
        <div className="payment-success">
          <FaCircleCheck className="payment-success-icon" />
          <h2 className="auth-form-title">Payment Successful!</h2>
          <p className="auth-form-subtitle">
            Your verification fee has been paid. An admin will review your account and follower
            proof. You will be notified once your account is verified.
          </p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Go to Sign In
          </Button>
        </div>
      )}
    </div>
  );
}