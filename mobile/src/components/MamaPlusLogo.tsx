import { Image, ImageStyle, StyleProp } from 'react-native'

const logoSource = require('../../assets/logo.png')

type MamaPlusLogoProps = {
  width?: number
  height?: number
  style?: StyleProp<ImageStyle>
}

export default function MamaPlusLogo({ width = 200, height = 67, style }: MamaPlusLogoProps) {
  return (
    <Image
      source={logoSource}
      style={[{ width, height, resizeMode: 'contain' }, style]}
      accessibilityLabel="MamaPlus logo"
    />
  )
}
