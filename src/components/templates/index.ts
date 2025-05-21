/**
 * Template Components
 * 
 * A collection of reusable template components for common UI patterns.
 */

// Legacy templates (for backward compatibility)
export * from './EntityListTemplate';
export * from './EntityDetailTemplate';
export * from './EntityFormTemplate';
export * from './types';

// Modern List templates
export { ListTemplate } from './list/ListTemplate';
export { ListTemplateHeader } from './list/ListTemplateHeader';
export type { Column, ListTemplateProps } from './list/ListTemplate';

// Modern Detail templates
export { DetailTemplate, DetailSection } from './detail/DetailTemplate';
export type { DetailTab, DetailAction, DetailTemplateProps } from './detail/DetailTemplate';

// Modern Create templates
export { CreateTemplate } from './create/CreateTemplate';
export { FormSection as CreateFormSection, FormGroup as CreateFormGroup, FormRow as CreateFormRow } from './create/CreateForm';
export type { CreateTemplateProps } from './create/CreateTemplate';

// Modern Edit templates
export { EditTemplate } from './edit/EditTemplate';
export { FormSection as EditFormSection, FormGroup as EditFormGroup, FormRow as EditFormRow } from './edit/EditForm';
export type { EditTemplateProps } from './edit/EditTemplate';
