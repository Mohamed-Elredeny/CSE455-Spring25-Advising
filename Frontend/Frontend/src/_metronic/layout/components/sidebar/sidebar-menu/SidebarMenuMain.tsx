import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

const SidebarMenuMain = () => {
  return (
    <>
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Chat</span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to="/chat"
        title="Chat"
        icon="message-text-2"
        fontIcon="bi-chat-left"
      >
        <SidebarMenuItem
          to="/chat/private"
          icon="user"
          title="All Chats"
          fontIcon="bi-person"
        />
      </SidebarMenuItemWithSub>
    </>
  )
}

export {SidebarMenuMain}
