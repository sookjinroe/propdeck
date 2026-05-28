import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Member } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  member: Member
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

const sizes = { sm: 'w-5 h-5 text-[9px]', md: 'w-7 h-7 text-xs', lg: 'w-9 h-9 text-sm' }

export function MemberAvatar({ member, size = 'md', showTooltip = false }: Props) {
  const avatar = (
    <div className={cn('rounded-full flex items-center justify-center font-bold flex-shrink-0', sizes[size], member.bg, member.color)}>
      {member.initial}
    </div>
  )
  if (!showTooltip) return avatar
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent side="top"><p className="text-xs">{member.name} · {member.role}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
