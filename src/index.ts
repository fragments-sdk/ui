'use client';

// Import CSS variables and base styles
// This ensures --fui-* variables are available when using any component
import './styles/globals.scss';

// Core Components
export { Button, type ButtonProps } from './components/Button';
export { Input, type InputProps } from './components/Input';
export { Textarea, type TextareaProps } from './components/Textarea';
export {
  Card,
  CardRoot,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardBodyProps,
  type CardFooterProps,
} from './components/Card';
export { Toggle, type ToggleProps } from './components/Toggle';
export {
  Alert,
  AlertRoot,
  AlertIcon,
  AlertBody,
  AlertTitle,
  AlertContent,
  AlertActions,
  AlertAction,
  AlertClose,
  type AlertProps,
  type AlertSeverity,
  type AlertIconProps,
  type AlertBodyProps,
  type AlertTitleProps,
  type AlertContentProps,
  type AlertActionsProps,
  type AlertActionProps,
  type AlertCloseProps,
} from './components/Alert';
export { Badge, type BadgeProps } from './components/Badge';
export { Avatar, type AvatarProps, type AvatarGroupProps, type AvatarSize } from './components/Avatar';

// Accordion
export {
  Accordion,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
  type AccordionValue,
} from './components/Accordion';

// Collapsible
export {
  Collapsible,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsibleContext,
  type CollapsibleProps,
  type CollapsibleRootProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
} from './components/Collapsible';

// Dialog
export {
  Dialog,
  type DialogProps,
  type DialogContentProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogHeaderProps,
  type DialogBodyProps,
  type DialogFooterProps,
  type DialogTriggerProps,
  type DialogCloseProps,
} from './components/Dialog';

// Tabs
export {
  Tabs,
  type TabsProps,
  type TabsListProps,
  type TabProps,
  type TabsPanelProps,
  type TabValue,
} from './components/Tabs';

// Tooltip
export {
  Tooltip,
  TooltipProvider,
  type TooltipProps,
  type TooltipProviderProps,
  type TooltipSide,
  type TooltipAlign,
} from './components/Tooltip';

// Select
export {
  Select,
  type SelectProps,
  type SelectTriggerProps,
  type SelectContentProps,
  type SelectItemProps,
  type SelectGroupProps,
  type SelectGroupLabelProps,
  type SelectValue,
  type SelectOption,
} from './components/Select';

// Menu
export {
  Menu,
  type MenuProps,
  type MenuTriggerProps,
  type MenuContentProps,
  type MenuItemProps,
  type MenuCheckboxItemProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuGroupProps,
  type MenuGroupLabelProps,
  type MenuSeparatorProps,
} from './components/Menu';

// Popover
export {
  Popover,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverContentProps,
  type PopoverTitleProps,
  type PopoverDescriptionProps,
  type PopoverBodyProps,
  type PopoverFooterProps,
  type PopoverCloseProps,
} from './components/Popover';

// Progress
export {
  Progress,
  CircularProgress,
  type ProgressProps,
  type CircularProgressProps,
} from './components/Progress';

// Checkbox
export { Checkbox, type CheckboxProps } from './components/Checkbox';

// Combobox
export {
  Combobox,
  type ComboboxProps,
  type ComboboxInputProps,
  type ComboboxTriggerProps,
  type ComboboxContentProps,
  type ComboboxItemProps,
  type ComboboxEmptyProps,
  type ComboboxGroupProps,
  type ComboboxGroupLabelProps,
} from './components/Combobox';

// RadioGroup
export {
  RadioGroup,
  type RadioGroupProps,
  type RadioItemProps,
} from './components/RadioGroup';

// Grid
export { Grid, type GridProps, type GridItemProps, type ResponsiveColumns } from './components/Grid';

// Separator
export { Separator, type SeparatorProps } from './components/Separator';

// Skeleton
export {
  Skeleton,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonVariant,
  type SkeletonSize,
} from './components/Skeleton';

// Loading
export {
  Loading,
  LoadingRoot,
  LoadingInline,
  LoadingScreen,
  type LoadingProps,
  type LoadingSize,
  type LoadingVariant,
  type LoadingInlineProps,
  type LoadingScreenProps,
} from './components/Loading';

// Table
export {
  Table,
  createColumns,
  type TableProps,
  type TableColumn,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from './components/Table';

// EmptyState
export {
  EmptyState,
  EmptyStateRoot,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  type EmptyStateProps,
  type EmptyStateIconProps,
  type EmptyStateTitleProps,
  type EmptyStateDescriptionProps,
  type EmptyStateActionsProps,
} from './components/EmptyState';

// Toast
export {
  Toast,
  ToastProvider,
  useToast,
  type ToastProps,
  type ToastProviderProps,
  type ToastData,
  type ToastVariant,
  type ToastPosition,
} from './components/Toast';

// Field
export {
  Field,
  type FieldProps,
  type FieldLabelProps,
  type FieldControlProps,
  type FieldDescriptionProps,
  type FieldErrorProps,
  type FieldValidityProps,
} from './components/Field';

// Fieldset
export {
  Fieldset,
  type FieldsetProps,
  type FieldsetLegendProps,
} from './components/Fieldset';

// Form
export { Form, type FormProps } from './components/Form';

// Sidebar
export {
  Sidebar,
  SidebarProvider,
  useSidebar,
  useSidebarContext, // deprecated, use useSidebar instead
  type SidebarProviderProps,
  type SidebarProps,
  type SidebarHeaderProps,
  type SidebarNavProps,
  type SidebarSectionProps,
  type SidebarSectionActionProps,
  type SidebarItemProps,
  type SidebarSubItemProps,
  type SidebarFooterProps,
  type SidebarTriggerProps,
  type SidebarOverlayProps,
  type SidebarCollapseToggleProps,
  type SidebarRailProps,
  type SidebarMenuSkeletonProps,
  type SidebarCollapsible,
} from './components/Sidebar';

// Theme
export {
  ThemeProvider,
  ThemeToggle,
  useTheme,
  type ThemeProviderProps,
  type ThemeToggleProps,
  type ThemeMode,
  type UseThemeReturn,
} from './components/Theme';

// Header
export {
  Header,
  type HeaderProps,
  type HeaderBrandProps,
  type HeaderNavProps,
  type HeaderNavItemProps,
  type HeaderSearchProps,
  type HeaderActionsProps,
  type HeaderTriggerProps,
} from './components/Header';

// AppShell
export {
  AppShell,
  type AppShellProps,
  type AppShellLayout,
  type AppShellHeaderProps,
  type AppShellSidebarProps,
  type AppShellMainProps,
  type AppShellAsideProps,
} from './components/AppShell';

// Stack
export {
  Stack,
  type StackProps,
  type ResponsiveDirection,
  type ResponsiveGap,
} from './components/Stack';

// Text
export { Text, type TextProps } from './components/Text';

// ButtonGroup
export { ButtonGroup, type ButtonGroupProps } from './components/ButtonGroup';

// ToggleGroup
export {
  ToggleGroup,
  ToggleGroupRoot,
  ToggleGroupItem,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
} from './components/ToggleGroup';

// Slider
export { Slider, type SliderProps } from './components/Slider';

// ColorPicker
export { ColorPicker, type ColorPickerProps } from './components/ColorPicker';

// DatePicker
export {
  DatePicker,
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerPreset,
  type DatePickerProps,
  type DatePickerTriggerProps,
  type DatePickerContentProps,
  type DatePickerCalendarProps,
  type DatePickerPresetProps,
  type DateRange,
  type Matcher,
} from './components/DatePicker';

// Prompt
export {
  Prompt,
  usePromptContext,
  type PromptProps,
  type PromptVariant,
  type PromptTextareaProps,
  type PromptToolbarProps,
  type PromptActionsProps,
  type PromptInfoProps,
  type PromptActionButtonProps,
  type PromptModeButtonProps,
  type PromptUsageProps,
  type PromptSubmitProps,
} from './components/Prompt';

// CodeBlock
export {
  CodeBlock,
  TabbedCodeBlock,
  type CodeBlockProps,
  type CodeBlockLanguage,
  type CodeBlockTab,
  type TabbedCodeBlockProps,
} from './components/CodeBlock';

// Icon
export { Icon, type IconProps } from './components/Icon';

// Image
export { Image, type ImageProps } from './components/Image';

// Link
export { Link, type LinkProps } from './components/Link';

// List
export {
  List,
  ListRoot,
  ListItem,
  type ListProps,
  type ListItemProps,
} from './components/List';

// Listbox (for search results, autocomplete, command menus)
export {
  Listbox,
  ListboxRoot,
  ListboxItem,
  ListboxGroup,
  ListboxEmpty,
  type ListboxProps,
  type ListboxItemProps,
  type ListboxGroupProps,
  type ListboxEmptyProps,
} from './components/Listbox';

// Breadcrumbs
export {
  Breadcrumbs,
  BreadcrumbsRoot,
  BreadcrumbsItem,
  BreadcrumbsSeparator,
  type BreadcrumbsProps,
  type BreadcrumbsItemProps,
  type BreadcrumbsSeparatorProps,
} from './components/Breadcrumbs';

// TableOfContents
export {
  TableOfContents,
  TableOfContentsRoot,
  TableOfContentsItem,
  type TableOfContentsProps,
  type TableOfContentsItemProps,
} from './components/TableOfContents';

// Box
export { Box, type BoxProps } from './components/Box';

// ScrollArea
export { ScrollArea, type ScrollAreaProps } from './components/ScrollArea';

// Chip
export { Chip, type ChipProps, type ChipGroupProps } from './components/Chip';

// VisuallyHidden
export { VisuallyHidden, type VisuallyHiddenProps } from './components/VisuallyHidden';

// Brand
export { BRAND, type Brand } from './brand';

// Markdown (AI Chat)
export { Markdown, type MarkdownProps } from './components/Markdown';

// Message (AI Chat)
export {
  Message,
  MessageRoot,
  MessageContent,
  MessageActions,
  MessageTimestamp,
  MessageAvatar,
  useMessageContext,
  type MessageProps,
  type MessageRole,
  type MessageStatus,
  type MessageContentProps,
  type MessageActionsProps,
  type MessageTimestampProps,
  type MessageAvatarProps,
} from './components/Message';

// ConversationList (AI Chat)
export {
  ConversationList,
  ConversationListRoot,
  DateSeparator,
  TypingIndicator,
  useConversationList,
  type ConversationListProps,
  type AutoScrollBehavior,
  type DateSeparatorProps,
  type TypingIndicatorProps,
} from './components/ConversationList';

// ThinkingIndicator (AI Chat)
export {
  ThinkingIndicator,
  ThinkingIndicatorRoot,
  ThinkingSteps,
  ThinkingStep,
  useThinkingIndicatorContext,
  type ThinkingIndicatorProps,
  type ThinkingVariant,
  type ThinkingStep as ThinkingStepType,
  type StepStatus,
  type ThinkingStepsProps,
  type ThinkingStepProps,
} from './components/ThinkingIndicator';

// Chart
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChartConfig,
  type ChartConfig,
  type ChartContainerProps,
  type ChartTooltipContentProps,
  type ChartLegendContentProps,
} from './components/Chart';

// Accessibility Utilities
export {
  useId,
  useAnnounce,
  usePrefersReducedMotion,
  usePrefersContrast,
  useFocusTrap,
  handleArrowNavigation,
  VisuallyHidden as A11yVisuallyHidden,
  type VisuallyHiddenProps as A11yVisuallyHiddenProps,
} from './utils/a11y';
