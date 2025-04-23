import {useIntl} from 'react-intl'

import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

const SidebarMenuMain = () => {
  const intl = useIntl()

  return (
    <>
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Chat</span>
        </div>
      </div>
      <SidebarMenuItem
        to="/users"
        icon="user"
        title="Users"
        fontIcon="bi-people"
      />
      <SidebarMenuItem
        to="/chat"
        icon="message-text-2"
        title="Chat"
        fontIcon="bi-chat-left"
      />
    </>
  )
}

export {SidebarMenuMain}
