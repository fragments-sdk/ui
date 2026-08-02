import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { composeStories } from "@storybook/react";
import type { Meta, StoryObj } from "@storybook/react";
import * as AccordionStories from "../Accordion/Accordion.stories";
import * as AlertStories from "../Alert/Alert.stories";
import * as AppShellStories from "../AppShell/AppShell.stories";
import * as AvatarStories from "../Avatar/Avatar.stories";
import * as BadgeStories from "../Badge/Badge.stories";
import * as BentoGridStories from "../BentoGrid/BentoGrid.stories";
import { Box } from "../Box";
import * as BoxStories from "../Box/Box.stories";
import * as BreadcrumbsStories from "../Breadcrumbs/Breadcrumbs.stories";
import * as ButtonStories from "../Button/Button.stories";
import * as ButtonGroupStories from "../ButtonGroup/ButtonGroup.stories";
import * as CardStories from "../Card/Card.stories";
import * as ChartStories from "../Chart/Chart.stories";
import * as CheckboxStories from "../Checkbox/Checkbox.stories";
import * as ChipStories from "../Chip/Chip.stories";
import * as CodeBlockStories from "../CodeBlock/CodeBlock.stories";
import * as CollapsibleStories from "../Collapsible/Collapsible.stories";
import * as ColorPickerStories from "../ColorPicker/ColorPicker.stories";
import * as ComboboxStories from "../Combobox/Combobox.stories";
import * as CommandStories from "../Command/Command.stories";
import * as ConversationListStories from "../ConversationList/ConversationList.stories";
import * as DataTableStories from "../DataTable/DataTable.stories";
import * as DatePickerStories from "../DatePicker/DatePicker.stories";
import * as DialogStories from "../Dialog/Dialog.stories";
import * as DrawerStories from "../Drawer/Drawer.stories";
import * as EditorStories from "../Editor/Editor.stories";
import * as EmptyStateStories from "../EmptyState/EmptyState.stories";
import * as FieldStories from "../Field/Field.stories";
import * as FieldsetStories from "../Fieldset/Fieldset.stories";
import * as FormStories from "../Form/Form.stories";
import * as GridStories from "../Grid/Grid.stories";
import * as HeaderStories from "../Header/Header.stories";
import * as IconStories from "../Icon/Icon.stories";
import * as IconButtonStories from "../IconButton/IconButton.stories";
import * as ImageStories from "../Image/Image.stories";
import * as InputStories from "../Input/Input.stories";
import * as LinkStories from "../Link/Link.stories";
import * as ListStories from "../List/List.stories";
import * as ListboxStories from "../Listbox/Listbox.stories";
import * as LoadingStories from "../Loading/Loading.stories";
import * as MainStories from "../Main/Main.stories";
import * as MarkdownStories from "../Markdown/Markdown.stories";
import * as MenuStories from "../Menu/Menu.stories";
import * as MessageStories from "../Message/Message.stories";
import * as NavigationMenuStories from "../NavigationMenu/NavigationMenu.stories";
import * as PaginationStories from "../Pagination/Pagination.stories";
import * as PopoverStories from "../Popover/Popover.stories";
import * as ProgressStories from "../Progress/Progress.stories";
import * as PromptStories from "../Prompt/Prompt.stories";
import * as RadioGroupStories from "../RadioGroup/RadioGroup.stories";
import * as ScrollAreaStories from "../ScrollArea/ScrollArea.stories";
import * as SelectStories from "../Select/Select.stories";
import * as SeparatorStories from "../Separator/Separator.stories";
import * as SidebarStories from "../Sidebar/Sidebar.stories";
import * as SkeletonStories from "../Skeleton/Skeleton.stories";
import * as SliderStories from "../Slider/Slider.stories";
import * as StackStories from "../Stack/Stack.stories";
import * as SwitchStories from "../Switch/Switch.stories";
import * as TableStories from "../Table/Table.stories";
import * as TableOfContentsStories from "../TableOfContents/TableOfContents.stories";
import * as TabsStories from "../Tabs/Tabs.stories";
import { Text } from "../Text";
import * as TextStories from "../Text/Text.stories";
import * as TextareaStories from "../Textarea/Textarea.stories";
import * as ThemeStories from "../Theme/Theme.stories";
import * as ThinkingIndicatorStories from "../ThinkingIndicator/ThinkingIndicator.stories";
import * as ToastStories from "../Toast/Toast.stories";
import * as ToggleGroupStories from "../ToggleGroup/ToggleGroup.stories";
import * as TooltipStories from "../Tooltip/Tooltip.stories";
import * as VisuallyHiddenStories from "../VisuallyHidden/VisuallyHidden.stories";
import styles from "./GeometryEvidence.module.scss";

const AccordionSpecimen = composeStories(AccordionStories).Single;
const AlertSpecimen = composeStories(AlertStories).Info;
const AppShellSpecimen = composeStories(AppShellStories).DefaultLayout;
const AvatarSpecimen = composeStories(AvatarStories).WithInitials;
const BadgeSpecimen = composeStories(BadgeStories).Default;
const BentoGridSpecimen = composeStories(BentoGridStories).Default;
const BoxSpecimen = composeStories(BoxStories).Default;
const BreadcrumbsSpecimen = composeStories(BreadcrumbsStories).Default;
const ButtonSpecimen = composeStories(ButtonStories).Primary;
const ButtonGroupSpecimen = composeStories(ButtonGroupStories).Default;
const CardSpecimen = composeStories(CardStories).Default;
const ChartSpecimen = composeStories(ChartStories).WithSummary;
const CheckboxSpecimen = composeStories(CheckboxStories).Default;
const ChipSpecimen = composeStories(ChipStories).Default;
const CodeBlockSpecimen = composeStories(CodeBlockStories).Default;
const CollapsibleSpecimen = composeStories(CollapsibleStories).Default;
const ColorPickerSpecimen = composeStories(ColorPickerStories).Default;
const ComboboxSpecimen = composeStories(ComboboxStories).Default;
const CommandSpecimen = composeStories(CommandStories).Default;
const ConversationListSpecimen = composeStories(ConversationListStories).Basic;
const DataTableSpecimen = composeStories(DataTableStories).Default;
const DatePickerSpecimen = composeStories(DatePickerStories).Default;
const DialogSpecimen = composeStories(DialogStories).Default;
const DrawerSpecimen = composeStories(DrawerStories).Default;
const EditorSpecimen = composeStories(EditorStories).ReadOnly;
const EmptyStateSpecimen = composeStories(EmptyStateStories).Default;
const FieldSpecimen = composeStories(FieldStories).Default;
const FieldsetSpecimen = composeStories(FieldsetStories).TwoColumnLayout;
const FormSpecimen = composeStories(FormStories).SignUp;
const GridSpecimen = composeStories(GridStories).Default;
const HeaderSpecimen = composeStories(HeaderStories).Minimal;
const IconSpecimen = composeStories(IconStories).Default;
const IconButtonSpecimen = composeStories(IconButtonStories).Ghost;
const ComposedImageSpecimen = composeStories(ImageStories).Default;
const InputSpecimen = composeStories(InputStories).Default;
const LinkSpecimen = composeStories(LinkStories).Default;
const ListSpecimen = composeStories(ListStories).Bullet;
const ListboxSpecimen = composeStories(ListboxStories).Default;
const LoadingSpecimen = composeStories(LoadingStories).Spinner;
const MainSpecimen = composeStories(MainStories).NarrowMeasure;
const MarkdownSpecimen = composeStories(MarkdownStories).Default;
const MenuSpecimen = composeStories(MenuStories).Default;
const MessageSpecimen = composeStories(MessageStories).UserMessage;
const NavigationMenuSpecimen = composeStories(NavigationMenuStories).WithSimpleLinks;
const PaginationSpecimen = composeStories(PaginationStories).Default;
const PopoverSpecimen = composeStories(PopoverStories).Default;
const ProgressSpecimen = composeStories(ProgressStories).Default;
const PromptSpecimen = composeStories(PromptStories).Basic;
const RadioGroupSpecimen = composeStories(RadioGroupStories).Default;
const ScrollAreaSpecimen = composeStories(ScrollAreaStories).Vertical;
const SelectSpecimen = composeStories(SelectStories).Default;
const SeparatorSpecimen = composeStories(SeparatorStories).Default;
const SidebarSpecimen = composeStories(SidebarStories).Default;
const SkeletonSpecimen = composeStories(SkeletonStories).Default;
const SliderSpecimen = composeStories(SliderStories).Default;
const StackSpecimen = composeStories(StackStories).Vertical;
const SwitchSpecimen = composeStories(SwitchStories).Default;
const TableSpecimen = composeStories(TableStories).Default;
const TableOfContentsSpecimen = composeStories(TableOfContentsStories).Default;
const TabsSpecimen = composeStories(TabsStories).Underline;
const TextSpecimen = composeStories(TextStories).Default;
const TextareaSpecimen = composeStories(TextareaStories).Default;
const ThemeSpecimen = composeStories(ThemeStories).WithToggle;
const ThinkingIndicatorSpecimen = composeStories(ThinkingIndicatorStories).Dots;
const ToastSpecimen = composeStories(ToastStories).Default;
const ToggleGroupSpecimen = composeStories(ToggleGroupStories).Default;
const TooltipSpecimen = composeStories(TooltipStories).Default;
const VisuallyHiddenSpecimen = composeStories(VisuallyHiddenStories).Default;

const deterministicImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 180'%3E%3Crect width='300' height='180' fill='%23818cf8'/%3E%3Cpath d='M0 140l72-64 52 44 42-30 134 90H0z' fill='%23312e81'/%3E%3C/svg%3E";

function ImageSpecimen() {
  return <ComposedImageSpecimen src={deterministicImage} alt="Deterministic landscape" />;
}

type CatalogSpecimen = {
  name: string;
  selector: string;
  Component: ComponentType;
};

const catalogSpecimens: CatalogSpecimen[] = [
  { name: "Accordion", selector: "catalog-accordion", Component: AccordionSpecimen },
  { name: "Alert", selector: "catalog-alert", Component: AlertSpecimen },
  { name: "AppShell", selector: "catalog-app-shell", Component: AppShellSpecimen },
  { name: "Avatar", selector: "catalog-avatar", Component: AvatarSpecimen },
  { name: "Badge", selector: "catalog-badge", Component: BadgeSpecimen },
  { name: "BentoGrid", selector: "catalog-bento-grid", Component: BentoGridSpecimen },
  { name: "Box", selector: "catalog-box", Component: BoxSpecimen },
  { name: "Breadcrumbs", selector: "catalog-breadcrumbs", Component: BreadcrumbsSpecimen },
  { name: "Button", selector: "catalog-button", Component: ButtonSpecimen },
  { name: "ButtonGroup", selector: "catalog-button-group", Component: ButtonGroupSpecimen },
  { name: "Card", selector: "catalog-card", Component: CardSpecimen },
  { name: "Chart", selector: "catalog-chart", Component: ChartSpecimen },
  { name: "Checkbox", selector: "catalog-checkbox", Component: CheckboxSpecimen },
  { name: "Chip", selector: "catalog-chip", Component: ChipSpecimen },
  { name: "CodeBlock", selector: "catalog-code-block", Component: CodeBlockSpecimen },
  { name: "Collapsible", selector: "catalog-collapsible", Component: CollapsibleSpecimen },
  { name: "ColorPicker", selector: "catalog-color-picker", Component: ColorPickerSpecimen },
  { name: "Combobox", selector: "catalog-combobox", Component: ComboboxSpecimen },
  { name: "Command", selector: "catalog-command", Component: CommandSpecimen },
  {
    name: "ConversationList",
    selector: "catalog-conversation-list",
    Component: ConversationListSpecimen,
  },
  { name: "DataTable", selector: "catalog-data-table", Component: DataTableSpecimen },
  { name: "DatePicker", selector: "catalog-date-picker", Component: DatePickerSpecimen },
  { name: "Dialog", selector: "catalog-dialog", Component: DialogSpecimen },
  { name: "Drawer", selector: "catalog-drawer", Component: DrawerSpecimen },
  { name: "Editor", selector: "catalog-editor", Component: EditorSpecimen },
  { name: "EmptyState", selector: "catalog-empty-state", Component: EmptyStateSpecimen },
  { name: "Field", selector: "catalog-field", Component: FieldSpecimen },
  { name: "Fieldset", selector: "catalog-fieldset", Component: FieldsetSpecimen },
  { name: "Form", selector: "catalog-form", Component: FormSpecimen },
  { name: "Grid", selector: "catalog-grid", Component: GridSpecimen },
  { name: "Header", selector: "catalog-header", Component: HeaderSpecimen },
  { name: "Icon", selector: "catalog-icon", Component: IconSpecimen },
  { name: "IconButton", selector: "catalog-icon-button", Component: IconButtonSpecimen },
  { name: "Image", selector: "catalog-image", Component: ImageSpecimen },
  { name: "Input", selector: "catalog-input", Component: InputSpecimen },
  { name: "Link", selector: "catalog-link", Component: LinkSpecimen },
  { name: "List", selector: "catalog-list", Component: ListSpecimen },
  { name: "Listbox", selector: "catalog-listbox", Component: ListboxSpecimen },
  { name: "Loading", selector: "catalog-loading", Component: LoadingSpecimen },
  { name: "Main", selector: "catalog-main", Component: MainSpecimen },
  { name: "Markdown", selector: "catalog-markdown", Component: MarkdownSpecimen },
  { name: "Menu", selector: "catalog-menu", Component: MenuSpecimen },
  { name: "Message", selector: "catalog-message", Component: MessageSpecimen },
  {
    name: "NavigationMenu",
    selector: "catalog-navigation-menu",
    Component: NavigationMenuSpecimen,
  },
  { name: "Pagination", selector: "catalog-pagination", Component: PaginationSpecimen },
  { name: "Popover", selector: "catalog-popover", Component: PopoverSpecimen },
  { name: "Progress", selector: "catalog-progress", Component: ProgressSpecimen },
  { name: "Prompt", selector: "catalog-prompt", Component: PromptSpecimen },
  { name: "RadioGroup", selector: "catalog-radio-group", Component: RadioGroupSpecimen },
  { name: "ScrollArea", selector: "catalog-scroll-area", Component: ScrollAreaSpecimen },
  { name: "Select", selector: "catalog-select", Component: SelectSpecimen },
  { name: "Separator", selector: "catalog-separator", Component: SeparatorSpecimen },
  { name: "Sidebar", selector: "catalog-sidebar", Component: SidebarSpecimen },
  { name: "Skeleton", selector: "catalog-skeleton", Component: SkeletonSpecimen },
  { name: "Slider", selector: "catalog-slider", Component: SliderSpecimen },
  { name: "Stack", selector: "catalog-stack", Component: StackSpecimen },
  { name: "Switch", selector: "catalog-switch", Component: SwitchSpecimen },
  { name: "Table", selector: "catalog-table", Component: TableSpecimen },
  {
    name: "TableOfContents",
    selector: "catalog-table-of-contents",
    Component: TableOfContentsSpecimen,
  },
  { name: "Tabs", selector: "catalog-tabs", Component: TabsSpecimen },
  { name: "Text", selector: "catalog-text", Component: TextSpecimen },
  { name: "Textarea", selector: "catalog-textarea", Component: TextareaSpecimen },
  { name: "Theme", selector: "catalog-theme", Component: ThemeSpecimen },
  {
    name: "ThinkingIndicator",
    selector: "catalog-thinking-indicator",
    Component: ThinkingIndicatorSpecimen,
  },
  { name: "Toast", selector: "catalog-toast", Component: ToastSpecimen },
  { name: "ToggleGroup", selector: "catalog-toggle-group", Component: ToggleGroupSpecimen },
  { name: "Tooltip", selector: "catalog-tooltip", Component: TooltipSpecimen },
  {
    name: "VisuallyHidden",
    selector: "catalog-visually-hidden",
    Component: VisuallyHiddenSpecimen,
  },
];

type SpecimenBoundaryProps = { children: ReactNode; name: string };
type SpecimenBoundaryState = { failed: boolean };

class SpecimenBoundary extends Component<SpecimenBoundaryProps, SpecimenBoundaryState> {
  state: SpecimenBoundaryState = { failed: false };

  static getDerivedStateFromError(): SpecimenBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Geometry specimen failed: ${this.props.name}`, error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return <Text color="error">Specimen failed to render</Text>;
    }

    return this.props.children;
  }
}

function CatalogMatrix() {
  return (
    <Box className={styles.frame} padding="lg">
      <Box className={styles.intro} marginY="md">
        <Text as="h1" size="xl" weight="semibold">
          Catalog geometry evidence
        </Text>
        <Text color="secondary">
          One deterministic, bounded specimen for every public catalog primitive.
        </Text>
      </Box>

      <div className={styles.grid}>
        {catalogSpecimens.map(({ name, selector, Component: Specimen }) => (
          <Box
            as="section"
            key={selector}
            className={styles.specimen}
            padding="md"
            border
            rounded="md"
            background="primary"
            overflow="auto"
            data-geometry-id={selector}
          >
            <Text as="h2" size="xs" color="tertiary" weight="medium" className={styles.label}>
              {name}
            </Text>
            <SpecimenBoundary name={name}>
              <Specimen />
            </SpecimenBoundary>
          </Box>
        ))}
      </div>
    </Box>
  );
}

const meta = {
  title: "Cloud/Geometry Evidence",
  parameters: {
    layout: "fullscreen",
    chromatic: { disableSnapshot: true },
    docs: {
      description: {
        component:
          "Machine-addressable catalog fixtures used by the deterministic geometry evidence runner.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CatalogSmoke: Story = {
  render: () => <CatalogMatrix />,
};
