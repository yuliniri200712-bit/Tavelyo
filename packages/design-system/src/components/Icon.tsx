import {
  Archive,
  Armchair,
  BellRing,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDot,
  Clock,
  ConciergeBell,
  CookingPot,
  Funnel,
  HandPlatter,
  Hourglass,
  Info,
  LayoutGrid,
  Layers,
  ListChecks,
  Lock,
  LogOut,
  Minus,
  Pencil,
  Plus,
  Printer,
  QrCode,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Timer,
  Trash,
  TriangleAlert,
  Users,
  Utensils,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react';
import { classNames } from './class-names.ts';

/**
 * Catálogo cerrado de iconos (D-27, Lucide). Los módulos usan estos nombres y nunca importan la
 * biblioteca: así el grosor y el tamaño son siempre los mismos, y cambiarla solo toca este archivo.
 */
const ICONS = {
  add: Plus,
  archive: Archive,
  back: ChevronLeft,
  bill: ReceiptText,
  branch: Store,
  callWaiter: BellRing,
  cart: ShoppingBag,
  check: CircleCheck,
  close: X,
  current: CircleDot,
  delete: Trash,
  dish: Utensils,
  edit: Pencil,
  expand: ChevronDown,
  filter: Funnel,
  floor: LayoutGrid,
  freeTable: Armchair,
  info: Info,
  kitchen: CookingPot,
  lock: Lock,
  next: ChevronRight,
  offline: WifiOff,
  pending: Circle,
  people: Users,
  print: Printer,
  qr: QrCode,
  readyToServe: ConciergeBell,
  refresh: RefreshCw,
  remove: Minus,
  search: Search,
  serve: HandPlatter,
  settings: Settings,
  signOut: LogOut,
  stations: Layers,
  tasks: ListChecks,
  time: Clock,
  timer: Timer,
  waiting: Hourglass,
  warning: TriangleAlert,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const iconNames = Object.keys(ICONS) as readonly IconName[];

export interface IconProps {
  readonly name: IconName;
  /**
   * Solo cuando el icono es la única señal (sin texto al lado). Sin `label` es decorativo y los
   * lectores de pantalla lo ignoran: el texto visible ya dice lo mismo (IV §6).
   */
  readonly label?: string;
  readonly size?: 'regular' | 'large';
  readonly className?: string;
}

export function Icon({ name, label, size = 'regular', className }: IconProps) {
  const Svg = ICONS[name];
  const classes = classNames('tv-icon', size === 'large' && 'tv-icon--large', className);
  return label ? (
    <Svg className={classes} role="img" aria-label={label} focusable="false" />
  ) : (
    <Svg className={classes} aria-hidden="true" focusable="false" />
  );
}
