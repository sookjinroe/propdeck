import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { MemberAvatar } from './MemberAvatar'
import { MEMBERS } from '@/data'
import type { Member, Role } from '@/types'

interface Props { open: boolean; onClose: () => void }

export function MembersSheet({ open, onClose }: Props) {
  const [members, setMembers] = useState<Member[]>(MEMBERS)
  const [email, setEmail] = useState('')

  const updateRole = (id: string, role: Role) =>
    setMembers(ms => ms.map(m => m.id === id ? { ...m, role } : m))

  const remove = (id: string) =>
    setMembers(ms => ms.filter(m => m.id !== id))

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-[360px] p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex-shrink-0">
          <SheetTitle className="text-sm font-bold">팀원 관리</SheetTitle>
        </SheetHeader>

        {/* invite */}
        <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <p className="text-xs font-semibold text-stone-500 mb-2.5">이메일로 초대</p>
          <div className="flex gap-2">
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 주소 입력" className="text-sm h-8 bg-stone-50" />
            <Button size="sm" className="h-8 px-4 flex-shrink-0">초대</Button>
          </div>
        </div>

        {/* member list */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-5 py-3">{members.length}명</p>
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors">
              <MemberAvatar member={m} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">{m.name} {m.isMe && <span className="text-xs font-normal text-stone-400">(나)</span>}</p>
                <p className="text-xs text-stone-400 truncate">{m.email}</p>
              </div>
              <Select value={m.role} onValueChange={v => updateRole(m.id, v as Role)} disabled={m.isMe}>
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PM" className="text-xs">PM</SelectItem>
                  <SelectItem value="작성자" className="text-xs">작성자</SelectItem>
                  <SelectItem value="뷰어" className="text-xs">뷰어</SelectItem>
                </SelectContent>
              </Select>
              {!m.isMe && (
                <button onClick={() => remove(m.id)} className="w-6 h-6 rounded flex items-center justify-center text-stone-300 hover:bg-red-50 hover:text-red-400 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {m.isMe && <div className="w-6" />}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
