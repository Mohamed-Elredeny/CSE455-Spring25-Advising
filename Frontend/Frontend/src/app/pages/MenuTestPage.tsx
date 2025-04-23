import {FC} from 'react'
import SVG from 'react-inlinesvg'
import {toAbsoluteUrl} from '../../_metronic/helpers'

const MenuTestPage: FC = () => {
  return (
    <div className='row'>
      <div className='card card-custom'>
        <div className='card-body p-9'>
          <div className='d-flex align-items-stretch mb-20'>
            <div
              className='header-menu align-items-stretch'
              data-kt-drawer='true'
              data-kt-drawer-name='header-menu'
              data-kt-drawer-activate='{default: true, lg: false}'
              data-kt-drawer-overlay='true'
              data-kt-drawer-width="{default:'200px', '300px': '250px'}"
              data-kt-drawer-direction='start'
              data-kt-drawer-toggle='#kt_header_menu_toggle'
            >
              <div
                className='menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-bold my-5 my-lg-0 align-items-stretch'
                id='#kt_header_menu'
                data-kt-menu='true'
              >
                <div className='menu-item me-lg-2'>
                  <a
                    className='menu-link active py-3'
                    href='/keenthemes/products/themes/start/html/demo1/dist/?page=index'
                  >
                    <span className='menu-title'>Hmdsaaa</span>
                  </a>
                </div>
                <div
                  data-kt-menu-trigger='click'
                  data-kt-menu-placement='bottom-start'
                  className='menu-item me-lg-2'
                >
                  <span className='menu-link py-3'>
                    <span className='menu-title'>Het</span>
                    <span className='menu-arrow d-lg-none'></span>
                  </span>
                  <div
                    className='menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown menu-rounded-0 py-lg-4 w-100 w-lg-225px'
                    style={{margin: '0px'}}
                  >
                    <div
                      data-kt-menu-trigger='click'
                      data-kt-menu-placement='right-start'
                      className='menu-item'
                    >
                      <span className='menu-link py-3'>
                        <span className='menu-icon'>
                          <span className=''>
                            <SVG src={toAbsoluteUrl('media/logos/default-small.svg')} />
                          </span>
                        </span>
                        <span className='menu-title'>Profile</span>
                        <span className='menu-arrow'></span>
                      </span>
                      <div
                        className='menu-sub menu-sub-accordion menu-sub-lg-dropdown menu-active-bg py-4 w-100 w-lg-225px'
                        style={{margin: '0px'}}
                      >
                        <div className='menu-item'>
                          <span className='menu-link py-3'>
                            <span className='menu-bullet'>
                              <span className='bullet bullet-dot'></span>
                            </span>
                            <span className='menu-title'>Overview</span>
                          </span>
                        </div>
                        <div className='menu-item'>
                          <a
                            className='menu-link py-3'
                            href='/keenthemes/products/themes/start/html/demo1/dist/?page=pages/profile/projects'
                          >
                            <span className='menu-bullet'>
                              <span className='bullet bullet-dot'></span>
                            </span>
                            <span className='menu-title'>Projects</span>
                          </a>
                        </div>
                        <div className='menu-item'>
                          <a
                            className='menu-link py-3'
                            href='/keenthemes/products/themes/start/html/demo1/dist/?page=gpa-simulator'
                          >
                            <span className='menu-bullet'>
                              <span className='bullet bullet-dot'></span>
                            </span>
                            <span className='menu-title'>GPA Simulator</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='w-250px bg-light rounded py-5'>
            <div
              className='menu menu-column menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500'
              id='#kt_aside_menu'
              data-kt-menu='true'
            >
              <div className='menu-item'>
                <a
                  className='menu-link active'
                  href='/keenthemes/products/themes/start/html/demo1/dist/?page=index'
                >
                  <span className='menu-icon'>
                    <span className=' fs-1'>
                      <SVG src={toAbsoluteUrl('media/logos/default-small.svg')} />
                    </span>
                  </span>
                  <span className='menu-title'>Dashboard</span>
                </a>
              </div>
              <div className='menu-item pt-5'>
                <div className='menu-content'>
                  <span className='menu-section text-muted text-uppercase fs-8'>Custom</span>
                </div>
              </div>
              <div data-kt-menu-trigger='click' className='menu-item'>
                <span className='menu-link'>
                  <span className='menu-icon'>
                    <span className=' fs-1'>
                      <SVG src={toAbsoluteUrl('media/logos/default-small.svg')} />
                    </span>
                  </span>
                  <span className='menu-title'>Pages</span>
                  <span className='menu-arrow'></span>
                </span>
                <div className='menu-sub menu-sub-accordion menu-active-bg'>
                  <div
                    data-kt-menu-trigger='click'
                    data-kt-menu-placement='right-start'
                    data-kt-menu-overflow='true'
                    className='menu-item'
                  >
                    <span className='menu-link'>
                      <span className='menu-bullet'>
                        <span className='bullet bullet-dot'></span>
                      </span>
                      <span className='menu-title'>Profile</span>
                      <span className='menu-arrow'></span>
                    </span>
                    <div className='menu-sub menu-sub-dropdown w-200px menu-active-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500'>
                      <div className='menu-item'>
                        <a
                          className='menu-link'
                          href='/keenthemes/products/themes/start/html/demo1/dist/?page=pages/profile/overview'
                        >
                          <span className='menu-bullet'>
                            <span className='bullet bullet-dot'></span>
                          </span>
                          <span className='menu-title'>Overview</span>
                        </a>
                      </div>
                      <div className='menu-item'>
                        <a
                          className='menu-link'
                          href='/keenthemes/products/themes/start/html/demo1/dist/?page=pages/profile/projects'
                        >
                          <span className='menu-bullet'>
                            <span className='bullet bullet-dot'></span>
                          </span>
                          <span className='menu-title'>Projects</span>
                        </a>
                      </div>
                      <div className='menu-item'>
                        <a
                          className='menu-link'
                          href='/keenthemes/products/themes/start/html/demo1/dist/?page=gpa-simulator'
                        >
                          <span className='menu-bullet'>
                            <span className='bullet bullet-dot'></span>
                          </span>
                          <span className='menu-title'>GPA Simulator</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {MenuTestPage}