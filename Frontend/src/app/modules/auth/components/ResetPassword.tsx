import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import clsx from 'clsx';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { resetPassword } from '../../../modules/auth/core/_requests';

const initialValues = {
  new_password: '',
};

const resetPasswordSchema = Yup.object().shape({
  new_password: Yup.string()
    .min(8, 'Minimum 8 characters')
    .max(50, 'Maximum 50 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
});

export function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  // Redirect to login page 2 seconds after successful reset
  useEffect(() => {
    if (hasErrors === false) {
      const timer = setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasErrors, navigate]);

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      if (!uid || !token) {
        setHasErrors(true);
        setErrorMessage('Invalid reset link. Please request a new password reset.');
        setLoading(false);
        setSubmitting(false);
        return;
      }

      setLoading(true);
      setHasErrors(null);
      setErrorMessage('');

      try {
        await resetPassword({ uid, token, new_password: values.new_password });
        setHasErrors(false);
        setLoading(false);
      } catch (error: any) {
        setHasErrors(true);
        setLoading(false);
        setSubmitting(false);
        setErrorMessage(
          error.response?.data?.detail || 'Error resetting password. Please try again.'
        );
        setStatus('Error resetting password');
      }
    },
  });

  return (
    <form
      className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
      noValidate
      id="kt_login_password_reset_form"
      onSubmit={formik.handleSubmit}
      aria-label="Reset Password Form"
    >
      <div className="text-center mb-10">
        <h1 className="text-gray-900 fw-bolder mb-3">Reset Password</h1>
        <div className="text-gray-500 fw-semibold fs-6">Enter your new password.</div>
      </div>

      {hasErrors === true && (
        <div className="mb-lg-15 alert alert-danger" role="alert">
          <div className="alert-text font-weight-bold">{errorMessage}</div>
        </div>
      )}

      {hasErrors === false && (
        <div className="mb-10 bg-light-info p-8 rounded">
          <div className="text-info">
            Password reset successful. Redirecting to login in 2 seconds...
          </div>
        </div>
      )}

      <div className="fv-row mb-8">
        <label className="form-label fw-bolder text-gray-900 fs-6" htmlFor="new_password">
          New Password
        </label>
        <input
          type="password"
          placeholder="Enter new password"
          autoComplete="new-password"
          id="new_password"
          {...formik.getFieldProps('new_password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.new_password && formik.errors.new_password,
            },
            {
              'is-valid': formik.touched.new_password && !formik.errors.new_password,
            }
          )}
          aria-invalid={formik.touched.new_password && formik.errors.new_password ? 'true' : 'false'}
          aria-describedby={formik.touched.new_password && formik.errors.new_password ? 'new_password_error' : undefined}
        />
        {formik.touched.new_password && formik.errors.new_password && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block" id="new_password_error">
              <span role="alert">{formik.errors.new_password}</span>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex flex-wrap justify-content-center pb-lg-0">
        <button
          type="submit"
          id="kt_password_reset_submit"
          className="btn btn-primary me-4"
          disabled={formik.isSubmitting || !uid || !token}
        >
          <span className="indicator-label">Submit</span>
          {loading && (
            <span className="indicator-progress">
              Please wait...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
        <Link to="/auth/login">
          <button
            type="button"
            id="kt_login_password_reset_form_cancel_button"
            className="btn btn-light"
          >
            Cancel
          </button>
        </Link>
      </div>
    </form>
  );
}