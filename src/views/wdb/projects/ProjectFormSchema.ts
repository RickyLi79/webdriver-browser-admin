import type { FormSchema } from '@/components/Table';
import { useI18n } from '@/hooks/web/useI18n';
import { isDevMode } from '@/utils/env';

const { t } = useI18n();

export const projectFormSchema = ({ readonly }: { readonly?: boolean }) =>
  [
    {
      field: 'name',
      component: 'Input',
      required: true,
      label: () => t('views.wdb.projects.projectInfo.name'),
      componentProps: ({ schema, formActionType }) => {
        return {
          onBlur() {
            formActionType.setFieldsValue({
              [schema.field]: formActionType.getFieldsValue()[schema.field]?.trim(),
            });
          },
          readonly,
        };
      },
    },
    {
      field: 'description',
      component: 'InputTextArea',
      label: () => t('views.wdb.projects.projectInfo.description'),
      componentProps: ({ schema, formActionType }) => {
        return {
          autoSize: { minRows: 3, maxRows: 5 },
          onBlur() {
            formActionType.setFieldsValue({
              [schema.field]: formActionType.getFieldsValue()[schema.field]?.trim(),
            });
          },
          readonly,
        };
      },
    },
    {
      field: 'isDev',
      component: 'Switch',
      defaultValue: isDevMode(),
      label: () => t('views.wdb.projects.projectInfo.isDev'),
      ifShow: isDevMode(),
      componentProps: {
        disabled: readonly,
      },
    },
  ] as FormSchema[];
