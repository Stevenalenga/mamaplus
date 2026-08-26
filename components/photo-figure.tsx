import Image from 'next/image'

type PhotoFigureProps = {
  src: string
  alt: string
  caption: string
  className?: string
  imageClassName?: string
  priority?: boolean
  heightClassName?: string
}

export function PhotoFigure({
  src,
  alt,
  caption,
  className = '',
  imageClassName = 'object-cover',
  priority = false,
  heightClassName = 'h-64 md:h-80',
}: PhotoFigureProps) {
  return (
    <figure className={`relative overflow-hidden rounded-2xl shadow-lg ${className}`}>
      <div className={`relative ${heightClassName}`}>
        <Image src={src} alt={alt} fill className={imageClassName} priority={priority} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      </div>
      <figcaption className="absolute left-0 right-0 bottom-0 p-4 text-white text-sm sm:text-base font-medium leading-snug">
        {caption}
      </figcaption>
    </figure>
  )
}
