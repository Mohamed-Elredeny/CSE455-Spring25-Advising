import { useState } from 'react';
import * as Yup from 'yup';
import clsx from 'clsx';
import { Link, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { resetPassword } from '../../../../../modules/auth/core/_requests';

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
  const [hasErrors, setHasErrors] = useState(undefined);
  const { uid, token } = useParams();

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);
      setTimeout(() => {
        resetPassword({ uid, token, new_password: values.new_password })
          .then(() => {
            setHasErrors(false);
            setLoading(false);
          })
          .catch(() => {
            setHasErrors(true);
            setLoading(false);
            setSubmitting(false);
            setStatus('Error resetting password');
          });
      }, 1000);
    },
  });

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_login_password_reset_form'
      onSubmit={formik.handleSubmit}
    >
      <div className='text-center mb-10'>
        <h1 className='text-gray-900 fw-bolder mb-3'>Reset Password</h1>
        <div className='text-gray-500 fw-semibold fs-6'>
          Enter your new password.
        </div>
      </div>

      {hasErrors === true && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>
            Sorry, looks like there are some errors detected, please try again.
          </div>
        </div>
      )}

      {hasErrors === false && (
        <div className='mb-10 bg-light-info p-8 rounded'>
          <div className='text-info'>Password reset successful. You can now log in.</div>
        </div>
      )}

      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>New Password</label>
        <input
          type='password'
          placeholder=''
          autoComplete='off'
          {...formik.getFieldProps('new_password')}
          className={clsx(
            'form-control bg-transparent',
            { 'is-invalid': formik.touched.new_password && formik.errors.new_password },
            { 'is-valid': formik.touched.new_password && !formik.errors.new_password }
          )}
        />
        {formik.touched.new_password && formik.errors.new_password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.new_password}</span>
            </div>
          </div>
        )}
      </div>

      <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
        <button type='submit' id='kt_password_reset_submit' className='btn btn-primary me-4'>
          <span className='indicator-label'>Submit</span>
          {loading && (
            <span className='indicator-progress'>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
        <Link to='/auth/login'>
          <button
            type='button'
            id='kt_login_password_reset_form_cancel_button'
            className='btn btn-light'
            disabled={formik.isSubmitting || !formik.isValid}
          >
            Cancel
          </button>
        </Link>
      </div>
    </form>
  );
}