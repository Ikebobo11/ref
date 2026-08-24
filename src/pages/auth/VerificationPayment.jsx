/**
 * LETCON - Verification Payment Page
 * Handles the ₦1,000 non-refundable verification fee payment via Paystack.
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCreditCard, FaShieldHalved, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { FEES, CURRENCY_SYMBOL } from '../../config/constants';
import { useSettings } from '../../contexts/SettingsContext';
import { createCheckoutHandler, verifyTransaction } from '../../services/paystackService';
import { updateDocument, getDocument, queryDocuments } from '../../services/firestoreService';
import { COLLECTIONS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Logo from '../../components/shared/Logo';

/**
 * Verification payment page component.
 */
export default function VerificationPayment() {
  const location = useLocation();
  const navigate = useNavigate();
    const { user } = useAuth();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [reference, setReference] = useState(location.state?.reference || '');
  const [email, setEmail] = useState(location.state?.email || user?.email || '');

  // Resolve the verification fee from settings (falls back to constant default)
  const verificationFee = settings?.verificationFee ?? FEES.VERIFICATION_FEE;

  // If the user navigates here directly (e.g. page refresh) without state,
  // try to recover the pending verification request from their account.
  useEffect(() => {
    if (reference || !user) return;

    const recoverPendingRequest = async () => {
      try {
        const requests = await queryDocuments(COLLECTIONS.VERIFICATION_REQUESTS, {
          filters: [
            { field: 'uid', operator: '==', value: user.uid },
            { field: 'feePaid', operator: '==', value: false },
          ],
          limitCount: 1,
        });

        if (requests.length > 0) {
          const req = requests[0];
          setReference(req.feeReference || req.id);
          setEmail(req.email || user.email || '');
        }
      } catch (error) {
        console.error('[LETCON] Error recovering pending verification request:', error);
      }
    };

    recoverPendingRequest();
  }, [reference, user]);

  // Safety net: if the verification fee is set to ₦0, never load Paystack —
  // auto-mark the request as paid and show the success screen directly.
  useEffect(() => {
    if (verificationFee > 0 || !reference) return;
    let cancelled = false;
    (async () => {
      try {
        await updateDocument(COLLECTIONS.VERIFICATION_REQUESTS, reference, {
          feePaid: true,
          feePaidAt: new Date(),
          freePromo: true,
        });
        await updateDocument(COLLECTIONS.TRANSACTIONS, reference, {
          status: 'success',
          paidAt: new Date(),
          freePromo: true,
        });
      } catch (error) {
        console.error('[LETCON] Error marking free verification:', error);
      }
      if (!cancelled) setPaid(true);
    })();
    return () => { cancelled = true; };
  }, [verificationFee, reference]);

  /**
   * Handles successful payment.
   * @param {Object} response - Paystack response.
   */
  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
      // Verify the payment with Paystack before marking as paid
      const verification = await verifyTransaction(response.reference || reference);

      if (verification?.data?.status !== 'success') {
        toast.error('Payment verification failed. Please contact support.');
        return;
      }

      // Update the verification request to mark fee as paid
      const verificationRequest = await getDocument(COLLECTIONS.VERIFICATION_REQUESTS, reference);
      if (verificationRequest) {
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
      console.error('[LETCON] Error recording payment:', error);
      toast.error('Payment recorded but there was an error updating your account. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the Paystack checkout.
   */
  const handlePay = () => {
    if (!reference) {
      toast.error('No pending verification request found. Please contact support.');
      return;
    }

    const handler = createCheckoutHandler({
      email,
            amount: verificationFee,
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
                                {CURRENCY_SYMBOL}{verificationFee.toLocaleString()}
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
                        <FaCreditCard /> Pay {CURRENCY_SYMBOL}{verificationFee.toLocaleString()} Now
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