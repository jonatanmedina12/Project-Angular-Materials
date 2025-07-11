import { importProvidersFrom } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';

// Seleccionar solo los iconos que usas para reducir el bundle
const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};

const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

export const iconsProvider = importProvidersFrom(NzIconModule.forRoot(icons));