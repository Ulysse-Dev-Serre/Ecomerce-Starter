interface AvatarProps {
  src?: string | null
  alt?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md',
  className = '' 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-12 h-12 text-base'
  }

  // Generate initials from name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '👤'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate background color from name
  const getBgColor = (name: string | null | undefined) => {
    if (!name) return 'bg-gray-400'
    
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (src) {
    return (
      <img 
        src={src} 
        alt={alt || name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // Si l'image ne charge pas, remplacer par initiales
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${getBgColor(name)} 
        rounded-full 
        flex items-center justify-center 
        text-white font-semibold
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  )
}
