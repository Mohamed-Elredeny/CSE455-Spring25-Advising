import {useEffect} from 'react'
import {Outlet, Link} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../_metronic/helpers'

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      {/* begin::Left side with form */}
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10'>
        {/* begin::Form */}
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          {/* begin::Wrapper */}
          <div className='w-lg-500px p-10'>
            <Outlet />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Form */}
      </div>
      {/* end::Left side with form */}

      {/* begin::Right side with logo */}
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2'>
        <div className='d-flex flex-center h-100'>
          <img 
            alt='Logo' 
            src={toAbsoluteUrl('media/logos/aiu-logo.png')} 
            className='h-250px'
          />
        </div>
      </div>
      {/* end::Right side with logo */}
    </div>
  )
}

export {AuthLayout}
