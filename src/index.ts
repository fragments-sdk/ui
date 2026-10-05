// Keep this entry free of startup work so unused exports can be removed.
// Import "@usefragments/ui/styles" once for the compiled tokens and component CSS.
// Sass consumers can configure seeds with @use "@usefragments/ui/scss".

// Core Components
export { Button, type ButtonProps } from "./components/Button";
export { Input, type InputProps, type InputSize, type InputType } from "./components/Input";
export { Textarea, type TextareaProps, type TextareaSize } from "./components/Textarea";
export { NumberField, type NumberFieldProps, type NumberFieldSize } from "./components/NumberField";
export {
  Card,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardBodyProps,
  type CardFooterProps,
} from "./components/Card";
export { Switch, type SwitchProps } from "./components/Switch";
export {
  Alert,
  type AlertProps,
  type AlertTone,
  type AlertIconProps,
  type AlertBodyProps,
  type AlertTitleProps,
  type AlertContentProps,
  type AlertActionsProps,
  type AlertActionProps,
  type AlertCloseProps,
} from "./components/Alert";
export { Badge, type BadgeProps, type BadgeTone } from "./components/Badge";
export { IconButton, type IconButtonProps } from "./components/IconButton";
export {
  CONTROL_SIZES,
  ComponentDefaultsProvider,
  useComponentDefaults,
  useResolvedControlSize,
  type ComponentDefaults,
  type ComponentDefaultsProviderProps,
  type ControlSize,
} from "./components/ComponentDefaults";
export {
  Avatar,
  type AvatarProps,
  type AvatarGroupProps,
  type AvatarSize,
} from "./components/Avatar";

// Accordion
export {
  Accordion,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
  type AccordionValue,
  type AccordionChangeEventDetails,
  type AccordionHeadingLevel,
} from "./components/Accordion";

// Collapsible
export {
  Collapsible,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
  type CollapsibleChangeEventDetails,
} from "./components/Collapsible";

// Dialog
export {
  Dialog,
  type DialogProps,
  type DialogWidth,
  type DialogInitialFocus,
  type DialogFinalFocus,
  type DialogContentProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogHeaderProps,
  type DialogBodyProps,
  type DialogFooterProps,
  type DialogTriggerProps,
  type DialogCloseProps,
} from "./components/Dialog";

// AlertDialog
export {
  AlertDialog,
  ALERT_DIALOG_SETTLE_MS,
  type AlertDialogProps,
  type AlertDialogWidth,
  type AlertDialogContentProps,
  type AlertDialogTriggerProps,
  type AlertDialogHeaderProps,
  type AlertDialogTitleProps,
  type AlertDialogDescriptionProps,
  type AlertDialogBodyProps,
  type AlertDialogFooterProps,
  type AlertDialogCancelProps,
  type AlertDialogActionProps,
} from "./components/AlertDialog";

// Tabs
export {
  Tabs,
  type TabsProps,
  type TabsListProps,
  type TabProps,
  type TabsPanelProps,
  type TabValue,
  type TabsVariant,
  type TabsSize,
  type TabsChangeEventDetails,
} from "./components/Tabs";

// Tooltip
export {
  Tooltip,
  TooltipProvider,
  TOOLTIP_COLD_DELAY_MS,
  TOOLTIP_WARM_WINDOW_MS,
  type TooltipProps,
  type TooltipContentProps,
  type TooltipProviderProps,
  type TooltipSide,
  type TooltipAlign,
} from "./components/Tooltip";

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
  type SelectSize,
} from "./components/Select";

// Menu
export {
  Menu,
  type MenuProps,
  type MenuTriggerProps,
  type MenuContentProps,
  type MenuItemProps,
  type MenuItemTone,
  type MenuCheckboxItemProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuGroupProps,
  type MenuGroupLabelProps,
  type MenuSeparatorProps,
  type MenuNoteProps,
} from "./components/Menu";

// Popover
export {
  Popover,
  type PopoverProps,
  type PopoverSize,
  type PopoverTriggerProps,
  type PopoverContentProps,
  type PopoverTitleProps,
  type PopoverDescriptionProps,
  type PopoverBodyProps,
  type PopoverFooterProps,
  type PopoverCloseProps,
} from "./components/Popover";

// Progress
export { Progress, type ProgressProps, type ProgressTone } from "./components/Progress";

// Checkbox
export { Checkbox, type CheckboxProps } from "./components/Checkbox";

// Combobox
export {
  Combobox,
  type ComboboxProps,
  type ComboboxSize,
  type ComboboxInputProps,
  type ComboboxTriggerProps,
  type ComboboxContentProps,
  type ComboboxItemProps,
  type ComboboxEmptyProps,
  type ComboboxGroupProps,
  type ComboboxGroupLabelProps,
} from "./components/Combobox";

// RadioGroup
export { RadioGroup, type RadioGroupProps, type RadioItemProps } from "./components/RadioGroup";

// Grid
export {
  Grid,
  type GridProps,
  type GridItemProps,
  type GridColumns,
  type GridGap,
  type GridAlign,
  type GridColSpan,
  type GridRowSpan,
} from "./components/Grid";

// Separator
export {
  Separator,
  type SeparatorProps,
  type SeparatorOrientation,
  type SeparatorLength,
} from "./components/Separator";

// Skeleton
export {
  Skeleton,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonShape,
  type SkeletonSize,
} from "./components/Skeleton";

// Loading
export {
  Loading,
  useLoadingDelay,
  type LoadingProps,
  type LoadingScreenProps,
} from "./components/Loading";

// Table (simple semantic HTML table)
export {
  Table,
  type TableProps,
  type TableRowProps,
  type TableCellProps,
  type TableHeaderCellProps,
  type TableCaptionProps,
} from "./components/Table";

// DataTable (TanStack-powered data table)
export {
  DataTable,
  createColumns,
  type DataTableProps,
  type DataTableColumn,
  type ColumnDef,
  type ColumnAlign,
  type SortingState,
  type RowSelectionState,
  type ExpandedState,
} from "./components/DataTable";

// DataTable row virtualization (opt-in; requires @tanstack/react-virtual).
// Intentionally NOT re-exported from the main barrel: `useTableVirtualizer`
// wraps a hook that must resolve synchronously, so — unlike DataTable/Chart/
// Editor — it cannot be lazy-required. Re-exporting it here (or routing it
// through the `./data-table` subpath, which the main barrel imports) would
// statically pull @tanstack/react-virtual into every consumer's Button-only
// build. It lives behind its own dedicated subpath the barrel never imports:
//   import { DataTableVirtual, useTableVirtualizer } from "@usefragments/ui/data-table-virtual";

// EmptyState
export {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateIconProps,
  type EmptyStateTitleProps,
  type EmptyStateDescriptionProps,
  type EmptyStateActionsProps,
} from "./components/EmptyState";

// Toast
export {
  Toast,
  ToastProvider,
  useToast,
  TOAST_DURATION_MS,
  TOAST_VISIBLE_MAX,
  type ToastApi,
  type ToastAction,
  type ToastBusy,
  type ToastContent,
  type ToastInput,
  type ToastPromiseMessages,
  type ToastProps,
  type ToastProviderProps,
  type ToastTone,
  type ToastPosition,
} from "./components/Toast";

// Field
export {
  Field,
  type FieldProps,
  type FieldLabelProps,
  type FieldControlProps,
  type FieldDescriptionProps,
  type FieldErrorProps,
  type FieldValidityProps,
  type FieldRequiredProps,
} from "./components/Field";

// Fieldset
export {
  Fieldset,
  type FieldsetProps,
  type FieldsetLegendProps,
  type FieldsetDescriptionProps,
} from "./components/Fieldset";

// Form
export { Form, type FormActionsProps, type FormProps } from "./components/Form";

// Sidebar
export {
  Sidebar,
  useSidebar,
  type SidebarStateProps,
  type SidebarState,
  type SidebarCollapsible,
  type SidebarProviderProps,
  type SidebarProps,
  type SidebarHeaderProps,
  type SidebarNavProps,
  type SidebarSectionProps,
  type SidebarSectionActionProps,
  type SidebarItemProps,
  type SidebarSubItemProps,
  type SidebarSubmenuProps,
  type SidebarFooterProps,
  type SidebarCollapseToggleProps,
  type SidebarMenuSkeletonProps,
} from "./components/Sidebar";

// Theme
export {
  Theme,
  useTheme,
  useThemePortalProps,
  configureTheme,
  type ThemeProps,
  type ThemeMode,
  type ThemeInputs,
  type ThemeChrome,
  type ThemeNeutral,
  type ThemePortalProps,
  type UseThemeReturn,
  type ConfigureThemeOptions,
} from "./components/Theme";
// A server component: exported from its own module, not the client Theme module.
export { ThemeScript, getThemeScript, type ThemeScriptProps } from "./components/Theme/ThemeScript";

// Header
export {
  Header,
  type HeaderProps,
  type HeaderElevatedOnScrollOptions,
  type HeaderBrandProps,
  type HeaderNavProps,
  type HeaderNavItemProps,
  type HeaderNavMenuProps,
  type HeaderNavMenuItemProps,
  type HeaderSearchProps,
  type HeaderActionsProps,
  type HeaderTriggerProps,
  type HeaderSkipLinkProps,
} from "./components/Header";

// AppShell
export {
  AppShell,
  type AppShellProps,
  type AppShellLayout,
  type AppShellHeaderProps,
  type AppShellSidebarProps,
  type AppShellMainProps,
  type AppShellAsideProps,
} from "./components/AppShell";

// Stack
export {
  Stack,
  type StackProps,
  type StackDirection,
  type StackGap,
  type StackAlign,
  type StackJustify,
  type StackElement,
} from "./components/Stack";

// Main
export {
  Main,
  type MainProps,
  type MainRegionProps,
  type MainMeasure,
  type MainElement,
  type MainTitleProps,
} from "./components/Main";

// Text
export { Text, type TextProps } from "./components/Text";

// Kbd
export { Kbd, type KbdProps, type KbdGroupProps } from "./components/Kbd";

// ButtonGroup
export { ButtonGroup, type ButtonGroupProps } from "./components/ButtonGroup";

// ToggleGroup
export {
  ToggleGroup,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
} from "./components/ToggleGroup";

// Slider
export { Slider, type SliderProps } from "./components/Slider";

// ColorPicker
export { ColorPicker, type ColorPickerProps, type ColorPickerSize } from "./components/ColorPicker";

// DatePicker
export {
  DatePicker,
  type DatePickerProps,
  type DatePickerSingleProps,
  type DatePickerRangeProps,
  type DatePickerSize,
  type DatePickerTriggerProps,
  type DatePickerContentProps,
  type DatePickerCalendarProps,
  type DatePickerPresetProps,
  type DateRange,
  type Matcher,
} from "./components/DatePicker";

// Prompt
export {
  Prompt,
  usePromptContext,
  type PromptProps,
  type PromptTextareaProps,
  type PromptToolbarProps,
  type PromptActionsProps,
  type PromptInfoProps,
  type PromptPickerProps,
  type PromptPickerOption,
  type PromptAttachProps,
  type PromptAttachmentsProps,
  type PromptAttachment,
  type PromptSubmitProps,
} from "./components/Prompt";

// CodeBlock
export {
  CodeBlock,
  type CodeBlockProps,
  type CodeBlockLanguage,
  type CodeBlockSize,
  type CodeBlockTab,
  type TabbedCodeBlockProps,
} from "./components/CodeBlock";

// Icon
export {
  Icon,
  type IconProps,
  type IconSize,
  type IconWeight,
  type IconTone,
} from "./components/Icon";

// Image
export {
  Image,
  type ImageProps,
  type ImageAspectRatio,
  type ImageObjectFit,
  type ImageRadius,
  type ImageStatus,
} from "./components/Image";

// Link
export { Link, type LinkProps } from "./components/Link";

// List
export { List, type ListProps, type ListItemProps, type ListRowProps } from "./components/List";

// Listbox (for search results, autocomplete, command menus)
export {
  Listbox,
  type ListboxProps,
  type ListboxSingleProps,
  type ListboxMultipleProps,
  type ListboxItemProps,
  type ListboxGroupProps,
  type ListboxEmptyProps,
} from "./components/Listbox";

// Breadcrumbs
export {
  Breadcrumbs,
  type BreadcrumbsProps,
  type BreadcrumbsItemProps,
} from "./components/Breadcrumbs";

// TableOfContents
export {
  TableOfContents,
  type TableOfContentsProps,
  type TableOfContentsItemProps,
  type TableOfContentsGroupProps,
} from "./components/TableOfContents";

// Box
export { Box, type BoxProps } from "./components/Box";

// ScrollArea
export { ScrollArea, type ScrollAreaProps } from "./components/ScrollArea";

// Chip
export { Chip, type ChipProps, type ChipGroupProps } from "./components/Chip";

// VisuallyHidden
export { VisuallyHidden, type VisuallyHiddenProps } from "./components/VisuallyHidden";

// Markdown (AI Chat)
export { Markdown, type MarkdownProps } from "./components/Markdown";

// Message (AI Chat)
export {
  Message,
  useMessageContext,
  type MessageProps,
  type MessageFrom,
  type MessageStatus,
  type MessageContentProps,
  type MessageActionsProps,
  type MessageTimestampProps,
  type MessageAvatarProps,
  type MessageErrorProps,
} from "./components/Message";

// ConversationList (AI Chat)
export {
  ConversationList,
  useConversationList,
  type ConversationListProps,
  type ConversationListEventProps,
  type ConversationHistory,
  type AutoScrollBehavior,
} from "./components/ConversationList";

// ThinkingIndicator (AI Chat)
export {
  ThinkingIndicator,
  type ThinkingIndicatorProps,
  type StepStatus,
  type ThinkingStepsProps,
  type ThinkingStepProps,
} from "./components/ThinkingIndicator";

// Chart
export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChartConfig,
  type ChartConfig,
  type ChartConfigEntry,
  type ChartSeries,
  type ChartContainerProps,
  type ChartTooltipContentProps,
  type ChartLegendContentProps,
} from "./components/Chart";

// Drawer
export {
  Drawer,
  type DrawerProps,
  type DrawerSide,
  type DrawerSize,
  type DrawerContentProps,
  type DrawerTriggerProps,
  type DrawerHeaderProps,
  type DrawerTitleProps,
  type DrawerDescriptionProps,
  type DrawerBodyProps,
  type DrawerFooterProps,
  type DrawerCloseProps,
  type DrawerSwipeAreaProps,
} from "./components/Drawer";

// Pagination
export {
  Pagination,
  type PaginationProps,
  type PaginationSize,
  type PaginationPreviousProps,
  type PaginationNextProps,
} from "./components/Pagination";

// Command
export {
  Command,
  type CommandProps,
  type CommandInputProps,
  type CommandListProps,
  type CommandItemProps,
  type CommandGroupProps,
  type CommandEmptyProps,
  type CommandErrorProps,
  type CommandSeparatorProps,
  type CommandDialogProps,
  type CommandFilter,
} from "./components/Command";

// Editor
export {
  Editor,
  useEditorContext,
  type EditorProps,
  type EditorFormat,
  type EditorSaveStatus,
  type EditorMode,
  type EditorToolbarProps,
  type EditorToolbarGroupProps,
  type EditorToolbarButtonProps,
  type EditorStatusIndicatorProps,
  type EditorContentProps,
  type EditorStatusBarProps,
} from "./components/Editor";

// Accessibility Utilities
export {
  useId,
  useAnnounce,
  usePrefersReducedMotion,
  usePrefersContrast,
  useFocusTrap,
  handleArrowNavigation,
  A11yVisuallyHidden,
  type A11yVisuallyHiddenProps,
} from "./utils/a11y";

// Feedback recipes: loading phases and dismissal
export {
  useLoadingPhase,
  LOADING_DELAY_MS,
  LOADING_SLOW_MS,
  type LoadingPhase,
  type LoadingTimers,
  type UseLoadingPhaseOptions,
} from "./recipes/loading";
export {
  useDismiss,
  nextFocusTarget,
  type UseDismissOptions,
  type UseDismissResult,
} from "./recipes/dismiss";

// Keyboard Shortcuts
export {
  KEYBOARD_SHORTCUTS,
  matchesShortcut,
  getShortcutLabel,
  findConflicts,
  getShortcuts,
  isEditableElement,
  configureShortcuts,
  getResolvedShortcut,
  resetShortcutOverrides,
  useKeyboardShortcut,
  type KeyboardShortcut,
  type ShortcutName,
  type UseKeyboardShortcutOptions,
} from "./utils/keyboard-shortcuts";

// Seed Derivation
export {
  type SeedConfig,
  PALETTES,
  RADIUS_STYLES,
  PALETTE_SEMANTIC_COLORS,
  DEFAULT_SEEDS,
  getSemanticColors,
  deriveText,
  deriveSurfaces,
  deriveBorders,
  deriveShadows,
  deriveAccentHover,
  deriveAccentActive,
  deriveDarkAccent,
  deriveSemanticText,
  deriveSemanticTint,
  deriveSemanticWash,
  deriveSemanticHover,
} from "./utils/seed-derivation";

// Theme Presets
export {
  PRESETS,
  PRESET_DEFINITIONS,
  generatePreset,
  seedsToTheme,
  type ThemeConfig,
  type PresetDefinition,
} from "./utils/theme-presets";

export type { ComponentMetadata } from "./metadata";
