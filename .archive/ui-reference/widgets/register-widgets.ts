/**
 * Widget Registration
 *
 * Registers all display and input widgets with the widget registry.
 * Import this file to ensure all widgets are available for rendering.
 */

import { registerWidget } from '../registry/widget-registry';

// Display Widgets
import {
  TextDisplay,
  BadgeDisplay,
  StatusBadge,
  CurrencyDisplay,
  PercentageDisplay,
  DateDisplay,
  DateTimeDisplay,
  BooleanDisplay,
  TagsDisplay,
  EmailDisplay,
  PhoneDisplay,
  LinkDisplay,
  EntityLinkDisplay,
  EntityListDisplay,
  AddressDisplay,
  JsonDisplay,
  ImageDisplay,
  ProgressDisplay,
  AvatarDisplay,
  // Composite display widgets
  PriorityBadge,
  UserCard,
  MetricCard,
  KPICard,
  ActivityCard,
  TimelineItem,
  RACIPanel,
  ActivityBadgeCount,
} from './display';

// Input Widgets
import {
  TextInput,
  TextareaInput,
  NumberInput,
  CurrencyInput,
  PercentageInput,
  DateInput,
  DateTimeInput,
  TimeInput,
  BooleanInput,
  SelectInput,
  MultiselectInput,
  RadioInput,
  CheckboxGroupInput,
  TagsInput,
  EmailInput,
  PhoneInput,
  UrlInput,
  FileInput,
  JsonInput,
  EntitySelect,
  EntityMultiselect,
  // Composite input widgets
  RateInput,
  DateRangePicker,
  DurationInput,
  VisaStatusSelect,
} from './input';

/**
 * Register all widgets
 */
export function registerAllWidgets() {
  // ==========================================
  // DISPLAY WIDGETS
  // ==========================================

  registerWidget('text-display', {
    Display: TextDisplay,
  });

  registerWidget('badge-display', {
    Display: BadgeDisplay,
  });

  registerWidget('status-badge', {
    Display: StatusBadge,
  });

  registerWidget('currency-display', {
    Display: CurrencyDisplay,
  });

  registerWidget('percentage-display', {
    Display: PercentageDisplay,
  });

  registerWidget('date-display', {
    Display: DateDisplay,
  });

  registerWidget('datetime-display', {
    Display: DateTimeDisplay,
  });

  registerWidget('boolean-display', {
    Display: BooleanDisplay,
  });

  registerWidget('tags-display', {
    Display: TagsDisplay,
  });

  registerWidget('email-display', {
    Display: EmailDisplay,
  });

  registerWidget('phone-display', {
    Display: PhoneDisplay,
  });

  registerWidget('link-display', {
    Display: LinkDisplay,
  });

  registerWidget('entity-link', {
    Display: EntityLinkDisplay,
  });

  registerWidget('entity-list-display', {
    Display: EntityListDisplay,
  });

  registerWidget('address-display', {
    Display: AddressDisplay,
  });

  registerWidget('json-display', {
    Display: JsonDisplay,
  });

  registerWidget('image-display', {
    Display: ImageDisplay,
  });

  registerWidget('progress-display', {
    Display: ProgressDisplay,
  });

  registerWidget('avatar-display', {
    Display: AvatarDisplay,
  });

  // ==========================================
  // COMPOSITE DISPLAY WIDGETS
  // ==========================================

  registerWidget('priority-badge', {
    Display: PriorityBadge,
  });

  registerWidget('user-card', {
    Display: UserCard,
  });

  registerWidget('metric-card', {
    Display: MetricCard,
  });

  registerWidget('kpi-card', {
    Display: KPICard,
  });

  registerWidget('activity-card', {
    Display: ActivityCard,
  });

  registerWidget('timeline-item', {
    Display: TimelineItem,
  });

  registerWidget('raci-panel', {
    Display: RACIPanel,
  });

  registerWidget('activity-badge-count', {
    Display: ActivityBadgeCount,
  });

  // ==========================================
  // INPUT WIDGETS
  // ==========================================

  registerWidget('text-input', {
    Display: TextDisplay,
    Input: TextInput,
  });

  registerWidget('textarea-input', {
    Display: TextDisplay,
    Input: TextareaInput,
  });

  registerWidget('number-input', {
    Display: TextDisplay as unknown as typeof NumberInput,
    Input: NumberInput,
  });

  registerWidget('currency-input', {
    Display: CurrencyDisplay,
    Input: CurrencyInput,
  });

  registerWidget('percentage-input', {
    Display: PercentageDisplay,
    Input: PercentageInput,
  });

  registerWidget('date-input', {
    Display: DateDisplay,
    Input: DateInput,
  });

  registerWidget('datetime-input', {
    Display: DateTimeDisplay,
    Input: DateTimeInput,
  });

  registerWidget('time-input', {
    Display: TextDisplay,
    Input: TimeInput,
  });

  registerWidget('boolean-input', {
    Display: BooleanDisplay,
    Input: BooleanInput,
  });

  registerWidget('select-input', {
    Display: BadgeDisplay,
    Input: SelectInput,
  });

  registerWidget('multiselect-input', {
    Display: TagsDisplay,
    Input: MultiselectInput,
  });

  registerWidget('radio-input', {
    Display: TextDisplay,
    Input: RadioInput,
  });

  registerWidget('checkbox-group-input', {
    Display: TagsDisplay,
    Input: CheckboxGroupInput,
  });

  registerWidget('tags-input', {
    Display: TagsDisplay,
    Input: TagsInput,
  });

  registerWidget('email-input', {
    Display: EmailDisplay,
    Input: EmailInput,
  });

  registerWidget('phone-input', {
    Display: PhoneDisplay,
    Input: PhoneInput,
  });

  registerWidget('url-input', {
    Display: LinkDisplay,
    Input: UrlInput,
  });

  registerWidget('file-input', {
    Display: TextDisplay as unknown as typeof FileInput,
    Input: FileInput,
  });

  registerWidget('image-input', {
    Display: ImageDisplay as unknown as typeof FileInput,
    Input: FileInput,
  });

  registerWidget('json-input', {
    Display: JsonDisplay,
    Input: JsonInput,
  });

  registerWidget('entity-select', {
    Display: EntityLinkDisplay as unknown as typeof EntitySelect,
    Input: EntitySelect,
  });

  registerWidget('entity-multiselect', {
    Display: EntityListDisplay as unknown as typeof EntityMultiselect,
    Input: EntityMultiselect,
  });

  // Rich text input (using textarea for now)
  registerWidget('richtext-input', {
    Display: TextDisplay,
    Input: TextareaInput,
  });

  // Files input (multiple files)
  registerWidget('files-input', {
    Display: TextDisplay as unknown as typeof FileInput,
    Input: FileInput,
  });

  // ==========================================
  // COMPOSITE INPUT WIDGETS
  // ==========================================

  registerWidget('rate-input', {
    Display: TextDisplay as unknown as typeof RateInput,
    Input: RateInput,
  });

  registerWidget('date-range-picker', {
    Display: TextDisplay as unknown as typeof DateRangePicker,
    Input: DateRangePicker,
  });

  registerWidget('duration-input', {
    Display: TextDisplay as unknown as typeof DurationInput,
    Input: DurationInput,
  });

  registerWidget('visa-status-select', {
    Display: BadgeDisplay as unknown as typeof VisaStatusSelect,
    Input: VisaStatusSelect,
  });
}

// Import and register dashboard section widgets
import { registerDashboardWidgets } from './dashboard';
import { registerCustomWidgets } from './custom';

/**
 * Register all widgets including dashboard section widgets and custom components
 */
export function registerAllWidgetsAndDashboard() {
  registerAllWidgets();
  registerDashboardWidgets();
  registerCustomWidgets();
}

// Auto-register on import
registerAllWidgets();
registerDashboardWidgets();
registerCustomWidgets();

export default registerAllWidgets;
