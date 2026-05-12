import { CLIO_CATEGORY_LINKS, type ClioCategory } from '../../config/affiliate'

// Material-symbols icon → Clio storefront category.
// Cards whose icon is not mapped fall back to the main Clio link.
const CLIO_CATEGORY_BY_ICON: Record<string, ClioCategory> = {
  // Base
  palette: 'base',
  water_drop: 'base',
  wb_sunny: 'base',
  shower: 'base',
  eco: 'base',
  restaurant: 'base',

  // Lip
  favorite: 'lip',
  bakery_dining: 'lip',
  cake: 'lip',

  // Eye
  visibility: 'eye',
  edit: 'eye',
  forest: 'eye',
  grass: 'eye',
  park: 'eye',

  // Cheek
  spa: 'cheek',
  auto_awesome: 'cheek',
  grid_3x3: 'cheek',
  local_fire_department: 'cheek',
  whatshot: 'cheek',
  auto_fix_high: 'cheek',
}

export function getClioCategoryByIcon(icon: string): ClioCategory {
  return CLIO_CATEGORY_BY_ICON[icon] ?? 'main'
}

export function getClioLinkByIcon(icon: string): string {
  return CLIO_CATEGORY_LINKS[getClioCategoryByIcon(icon)]
}

// Perfume type → cross-sell makeup category on Clio.
// floral → pink/romantic lip, citrus → fresh base, woody → deep eye,
// amber → red/sensual lip, fresh → glow base, gourmand → sweet cheek.
const CLIO_CATEGORY_BY_PERFUME_TYPE: Record<string, ClioCategory> = {
  floral: 'lip',
  citrus: 'base',
  woody: 'eye',
  amber: 'lip',
  fresh: 'base',
  gourmand: 'cheek',
}

export function getClioCategoryByPerfumeType(type: string): ClioCategory {
  return CLIO_CATEGORY_BY_PERFUME_TYPE[type] ?? 'main'
}

export function getClioLinkByPerfumeType(type: string): string {
  return CLIO_CATEGORY_LINKS[getClioCategoryByPerfumeType(type)]
}
