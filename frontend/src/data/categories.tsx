import React from 'react';
import {
  Checkroom as CheckroomIcon,
  ChildCare as ChildCareIcon,
  Woman as WomanIcon,
  DryCleaning as DryCleaningIcon
} from '@mui/icons-material';

export interface Category {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const categoriesData: Category[] = [
  {
    id: 1,
    title: 'Jeans Pants',
    subtitle: 'Denim & trousers',
    icon: <CheckroomIcon className="text-zinc-600" fontSize="medium" />
  },
  {
    id: 2,
    title: 'Jeans Shirts',
    subtitle: 'Denim shirts & jackets',
    icon: <DryCleaningIcon className="text-zinc-600" fontSize="medium" />
  },
  {
    id: 3,
    title: 'Kids',
    subtitle: 'Children wear',
    icon: <ChildCareIcon className="text-zinc-600" fontSize="medium" />
  },
  {
    id: 4,
    title: 'Ladies Dress',
    subtitle: 'Eastern & western',
    icon: <WomanIcon className="text-zinc-600" fontSize="medium" />
  }
];
