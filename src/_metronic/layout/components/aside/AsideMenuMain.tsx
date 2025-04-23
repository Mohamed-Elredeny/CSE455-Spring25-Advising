import {useIntl} from 'react-intl'
import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
import {AsideMenuItem} from './AsideMenuItem'

export function AsideMenuMain() {
  const intl = useIntl()

  return (
    <>
      {/* Dashboard */}
      <AsideMenuItem
        to='/dashboard'
        icon='element-11'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
      />

      {/* Academic Features */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Academic</span>
        </div>
      </div>

      <AsideMenuItemWithSub to='/academics/courses' title='Course Management' icon='book'>
        <AsideMenuItem to='/academics/courses/browse' title='Course Catalog' hasBullet={true} />
        <AsideMenuItem to='/academics/courses/search' title='Course Search' hasBullet={true} />
        <AsideMenuItem to='/academics/courses/categories' title='Categories' hasBullet={true} />
        <AsideMenuItem to='/academics/courses/compare' title='Compare Courses' hasBullet={true} />
      </AsideMenuItemWithSub>

    {/* Plans Managment */}
      <AsideMenuItemWithSub to='/academics/academic-plans' title='Academic Plans' icon='calendar'>
        <AsideMenuItem to='/academics/academic-plans/browse' title='Program Plans' hasBullet={true} />
        <AsideMenuItem to='/academics/academic-plans/allPlans' title='Student Plans' hasBullet={true} />
        <AsideMenuItem to='/academics/academic-plans/revision' title='Plans revision' hasBullet={true} />
        <AsideMenuItem to='/academics/academic-plans/comparison' title='Compare Plans' hasBullet={true} />
      </AsideMenuItemWithSub>

      <AsideMenuItem 
        to='/academics/gpa-simulator' 
        icon='calculator' 
        title='GPA Simulator' 
      />

      {/* User Account */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Account</span>
        </div>
      </div>

      <AsideMenuItem to='/profile/overview' icon='profile-circle' title='My Profile' />
      <AsideMenuItem to='/account/settings' icon='setting-2' title='Account Settings' />

      {/* Admin Section */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Administration</span>
        </div>
      </div>

      <AsideMenuItem to='/admin/users' icon='shield-tick' title='User Management' />

      {/* Optional Features */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Features</span>
        </div>
      </div>

      <AsideMenuItemWithSub to='/features/chat' title='Chat' icon='message-text-2'>
        <AsideMenuItem to='/features/chat/private-chat' title='Private Chat' hasBullet={true} />
        <AsideMenuItem to='/features/chat/group-chat' title='Group Chat' hasBullet={true} />
        <AsideMenuItem to='/features/chat/drawer-chat' title='Drawer Chat' hasBullet={true} />
      </AsideMenuItemWithSub>

      <AsideMenuItemWithSub to='/features/wizards' title='Wizards' icon='gift'>
        <AsideMenuItem to='/features/wizards/horizontal' title='Horizontal' hasBullet={true} />
        <AsideMenuItem to='/features/wizards/vertical' title='Vertical' hasBullet={true} />
      </AsideMenuItemWithSub>

      <AsideMenuItemWithSub to='/features/widgets' title='Widgets' icon='element-plus'>
        <AsideMenuItem to='/features/widgets/lists' title='Lists' hasBullet={true} />
        <AsideMenuItem to='/features/widgets/statistics' title='Statistics' hasBullet={true} />
        <AsideMenuItem to='/features/widgets/charts' title='Charts' hasBullet={true} />
        <AsideMenuItem to='/features/widgets/mixed' title='Mixed' hasBullet={true} />
        <AsideMenuItem to='/features/widgets/tables' title='Tables' hasBullet={true} />
        <AsideMenuItem to='/features/widgets/feeds' title='Feeds' hasBullet={true} />
      </AsideMenuItemWithSub>
    </>
  )
}
