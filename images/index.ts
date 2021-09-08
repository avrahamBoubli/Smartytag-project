export const PantsIcon = require('./icons/pants.png');
export const DressIcon = require('./icons/dress.png');
export const TshirtIcon = require('./icons/tshirt.png');
export const ShirtIcon = require('./icons/shirt.png');
export const ShortIcon = require('./icons/shorts.png');
export const ShoesIcon = require('./icons/shoes.png');
export const CoatIcon = require('./icons/coat.png');
export const ClotheIcon = require('./icons/clothes.png');
export const AppLogo = require('./icons/logo.png');
export const LoginBkImage = require('./icons/bg.png');
/**
 * Returns icon based on template type
 * @param type 
 */
export function getProductIcon(type: string) {
  switch (type) {
    case 'Pants':
    case 'Jeans':
      return PantsIcon;
    case 'Dress':
    case 'Skirt':
      return DressIcon;
    case 'Shirts':
      return ShirtIcon;
    case 'Sweater':
    case 'T-shirt':
    case 'Shirt':
    case 'Hoodies':
      return TshirtIcon;
    case 'Shorts':
      return ShortIcon;
    case 'Shoes':
      return ShoesIcon;
    case 'Coat':
      return CoatIcon;
    default:
      return ClotheIcon;
  }
}