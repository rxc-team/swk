import { NzStepsModule } from 'ng-zorro-antd/steps';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import {
    GenerateFieldSettingComponent
} from './components/generate-field-setting/generate-field-setting.component';
import {
    GenerateMasterSettingComponent
} from './components/generate-master-setting/generate-master-setting.component';
import {
    GenerateOptionAddComponent
} from './components/generate-option-add/generate-option-add.component';
import {
    GenerateOptionSettingComponent
} from './components/generate-option-setting/generate-option-setting.component';
import {
    GenerateUserSettingComponent
} from './components/generate-user-setting/generate-user-setting.component';
import { GenerateAttrSetComponent } from './generate-attr-set/generate-attr-set.component';
import { GenerateCompleteComponent } from './generate-complete/generate-complete.component';
import { GenerateDsSaveComponent } from './generate-ds-save/generate-ds-save.component';
import { GenerateDsSetComponent } from './generate-ds-set/generate-ds-set.component';
import { GenerateMpSaveComponent } from './generate-mp-save/generate-mp-save.component';
import { GenerateRoutingModule } from './generate-routing.module';
import { GenerateUploadComponent } from './generate-upload/generate-upload.component';
import { GenerateComponent } from './generate/generate.component';
import { StepService } from './step.service';

@NgModule({
  declarations: [
    GenerateComponent,
    GenerateUploadComponent,
    GenerateCompleteComponent,
    GenerateFieldSettingComponent,
    GenerateMasterSettingComponent,
    GenerateOptionSettingComponent,
    GenerateUserSettingComponent,
    GenerateOptionAddComponent,
    GenerateDsSetComponent,
    GenerateAttrSetComponent,
    GenerateDsSaveComponent,
    GenerateMpSaveComponent
  ],
  imports: [SharedModule, NzStepsModule, GenerateRoutingModule],
  providers: [StepService]
})
export class GenerateModule {}
