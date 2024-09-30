import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TplFormComponent } from './tpl-form.component';

describe('TplFormComponent', () => {
  let component: TplFormComponent;
  let fixture: ComponentFixture<TplFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TplFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TplFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
