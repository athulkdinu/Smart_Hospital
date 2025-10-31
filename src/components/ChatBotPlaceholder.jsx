import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'

function ChatBotPlaceholder() {
  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--brand-solid)]">
        <FontAwesomeIcon icon={faComments} />
        <h3 className="font-semibold">Chat with us</h3>
      </div>
      <p className="text-sm text-slate-600 mt-2">Our assistant will appear here. Start a conversation to get help.</p>
      <div className="mt-3 h-24 rounded-lg bg-[var(--brand-tint)] border border-dashed border-[var(--brand-border)]"/>   
    </div>
  )
}

export default ChatBotPlaceholder


