import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MAMAPLUS_APK_FILENAME, MAMAPLUS_APK_HREF } from '@/lib/apk'
import { cn } from '@/lib/utils'

type ApkDownloadButtonProps = {
  className?: string
  label?: string
  variant?: 'default' | 'outline' | 'secondary'
}

export function ApkDownloadButton({
  className,
  label = 'Download Android app',
  variant = 'default',
}: ApkDownloadButtonProps) {
  return (
    <Button
      asChild
      variant={variant === 'default' ? 'default' : variant}
      className={cn(
        variant === 'default' && 'bg-primary hover:bg-primary/90 text-white',
        className
      )}
    >
      <a href={MAMAPLUS_APK_HREF} download={MAMAPLUS_APK_FILENAME}>
        <Smartphone className="w-4 h-4" />
        {label}
      </a>
    </Button>
  )
}
