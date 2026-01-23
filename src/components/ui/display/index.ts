/**
 * Display Components - Barrel Export
 *
 * Enterprise-grade display components for the InTime platform.
 * Hublot-inspired: elegant, precise, consistent.
 */

// ============================================
// FORMATTERS
// ============================================
export {
  // Currency
  formatCurrency,
  parseCurrencyInput,
  CURRENCY_CONFIG,
  type CurrencyCode,
  type FormatCurrencyOptions,

  // Numbers
  formatNumber,
  type FormatNumberOptions,

  // Percentages
  formatPercentage,
  type FormatPercentageOptions,

  // Dates
  formatDate,
  formatDateRange,
  type DateFormat,

  // Phone
  formatPhone,
  PHONE_FORMATS,
  type PhoneValue,

  // Address
  formatAddress,
  type AddressValue,
  type AddressFormat,

  // Text
  formatSnakeCase,
  formatCamelCase,
  truncateText,

  // Arrays
  formatArray,
  type FormatArrayOptions,

  // Boolean
  formatBoolean,
  type BooleanFormat,

  // Email & URL
  formatEmail,
  formatUrl,
  formatLinkedIn,

  // Rating
  formatRating,

  // Status
  getStatusVariant,
  type StatusVariant,

  // Utilities
  isEmpty,
  getEmptyText,
} from '@/lib/formatters'

// ============================================
// VALUE DISPLAY
// ============================================
export {
  ValueDisplay,
  CurrencyDisplay,
  DateDisplay,
  PhoneDisplay,
  EmailDisplay,
  TagsDisplay,
  StatusDisplay,
  type ValueDisplayProps,
  type ValueDisplayType,
} from '../value-display'

// ============================================
// FIELD DISPLAY
// ============================================
export {
  FieldDisplay,
  FieldGroup,
  InlineField,
  StatField,
  DetailRow,
  InfoCard,
  QuickStatCard,
  type FieldDisplayProps,
  type FieldGroupProps,
  type InlineFieldProps,
  type StatFieldProps,
  type DetailRowProps,
  type InfoCardProps,
  type QuickStatCardProps,
} from '../field-display'

// ============================================
// ADDRESS DISPLAY
// ============================================
export {
  AddressDisplay,
  AddressCard,
  AddressList,
  type AddressDisplayValue,
  type AddressDisplayProps,
  type AddressCardProps,
  type AddressListProps,
  type AddressType,
} from '../address-display'

// ============================================
// USER DISPLAY
// ============================================
export {
  UserDisplay,
  UserCard,
  UserAvatarGroup,
  UserList,
  type UserValue,
  type UserDisplayProps,
  type UserCardProps,
  type UserAvatarGroupProps,
  type UserListProps,
} from '../user-display'

// ============================================
// TAGS DISPLAY
// ============================================
export {
  TagsDisplay as TagsDisplayComponent,
  TagsInput,
  SkillTagsDisplay,
  type TagsDisplayProps,
  type TagsInputProps,
  type SkillTag,
  type SkillTagsDisplayProps,
} from '../tags-display'

// ============================================
// CURRENCY INPUT
// ============================================
export {
  CurrencyInput,
  CurrencyDisplay as CurrencyDisplayComponent,
  CurrencyRangeInput,
  type CurrencyInputValue,
  type CurrencyInputProps,
  type CurrencyDisplayProps,
  type CurrencyRangeInputProps,
} from '../currency-input'

// ============================================
// PERCENTAGE INPUT
// ============================================
export {
  PercentageInput,
  PercentageDisplay,
  type PercentageInputProps,
  type PercentageDisplayProps,
} from '../percentage-input'

// ============================================
// DATE INPUT
// ============================================
export {
  DateInput,
  DateRangeInput,
  DateRangeDisplay,
  type DateInputProps,
  type DateRangeInputProps,
  type DateRangeValue,
  type DateRangeDisplayProps,
} from '../date-range-input'
